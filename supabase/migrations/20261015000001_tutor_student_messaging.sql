-- =============================================================================
-- Migration: 20261015000001_tutor_student_messaging.sql
-- Description: Persistent two-way messaging between students and tutors.
--
-- Security model:
--   * Clients can only SELECT rows of conversations they take part in (RLS).
--   * All writes go through SECURITY DEFINER RPCs that validate the caller:
--       - start_conversation: student -> any active tutor,
--                             tutor   -> only students who have booked them.
--       - send_message / mark_conversation_read: participants only.
--   * Profiles of students are not readable by tutors through RLS, so the
--     conversation list and contact list are served by RPCs that expose only
--     name + avatar of the counterpart.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABLES
-- -----------------------------------------------------------------------------
create table if not exists public.conversations (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.profiles(id) on delete cascade,
  tutor_id         uuid not null references public.profiles(id) on delete cascade,
  last_message_at  timestamptz,
  created_at       timestamptz not null default now(),
  unique (student_id, tutor_id),
  check (student_id <> tutor_id)
);

comment on table public.conversations is 'One thread per student-tutor pair. tutor_id is the tutor''s profiles.id (auth user id).';

create table if not exists public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  sender_id        uuid not null references public.profiles(id) on delete cascade,
  body             text not null check (char_length(btrim(body)) between 1 and 2000),
  read_at          timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists idx_conversations_student on public.conversations(student_id, last_message_at desc nulls last);
create index if not exists idx_conversations_tutor   on public.conversations(tutor_id, last_message_at desc nulls last);
create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);
create index if not exists idx_messages_unread       on public.messages(conversation_id) where read_at is null;

-- -----------------------------------------------------------------------------
-- 2. RLS (read-only for clients; writes via RPC)
-- -----------------------------------------------------------------------------
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

revoke insert, update, delete on public.conversations from anon, authenticated;
revoke insert, update, delete on public.messages      from anon, authenticated;
revoke all on public.conversations from anon;
revoke all on public.messages      from anon;
grant select on public.conversations to authenticated;
grant select on public.messages      to authenticated;

drop policy if exists "conversations_select_participant" on public.conversations;
create policy "conversations_select_participant"
  on public.conversations for select
  to authenticated
  using (
    student_id = (select auth.uid())
    or tutor_id = (select auth.uid())
    or (select public.is_admin())
  );

drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (
          c.student_id = (select auth.uid())
          or c.tutor_id = (select auth.uid())
          or (select public.is_admin())
        )
    )
  );

-- -----------------------------------------------------------------------------
-- 3. RPC: start_conversation(other user)
-- -----------------------------------------------------------------------------
create or replace function public.start_conversation(p_other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid        uuid := auth.uid();
  v_role       public.user_role;
  v_student_id uuid;
  v_tutor_id   uuid;
  v_conv_id    uuid;
begin
  if v_uid is null then
    raise exception 'Autentikasi diperlukan.' using errcode = '42501';
  end if;

  select role into v_role from public.profiles where id = v_uid;

  if v_role = 'student' then
    select p.id into v_tutor_id
    from public.profiles p
    join public.tutor_profiles tp on tp.user_id = p.id
    where (p.id = p_other_user_id or tp.id = p_other_user_id)
      and p.role = 'tutor'
      and tp.is_active
    limit 1;

    if v_tutor_id is null then
      raise exception 'Tutor tidak ditemukan atau sedang tidak aktif.' using errcode = 'P0002';
    end if;
    v_student_id := v_uid;

  elsif v_role = 'tutor' then
    if not exists (
      select 1
      from public.bookings b
      join public.tutor_profiles tp on tp.id = b.tutor_id
      where tp.user_id = v_uid and b.student_id = p_other_user_id
    ) and not exists (
      select 1
      from public.conversations c
      where c.tutor_id = v_uid and c.student_id = p_other_user_id
    ) then
      raise exception 'Anda hanya dapat menghubungi murid yang pernah memesan sesi dengan Anda.' using errcode = '42501';
    end if;
    v_student_id := p_other_user_id;
    v_tutor_id := v_uid;

  else
    raise exception 'Fitur pesan hanya tersedia untuk murid dan tutor.' using errcode = '42501';
  end if;

  insert into public.conversations (student_id, tutor_id)
  values (v_student_id, v_tutor_id)
  on conflict (student_id, tutor_id) do nothing;

  select id into v_conv_id
  from public.conversations
  where student_id = v_student_id and tutor_id = v_tutor_id;

  return v_conv_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- 4. RPC: send_message
--    Also notifies the recipient when public.notifications exists, wrapped in
--    an exception handler so notification delivery never rolls back a message.
-- -----------------------------------------------------------------------------
create or replace function public.send_message(p_conversation_id uuid, p_body text)
returns public.messages
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid          uuid := auth.uid();
  v_conv         public.conversations;
  v_body         text := btrim(coalesce(p_body, ''));
  v_recipient    uuid;
  v_had_unread   boolean;
  v_sender_name  text;
  v_link         text;
  v_msg          public.messages;
begin
  if v_uid is null then
    raise exception 'Autentikasi diperlukan.' using errcode = '42501';
  end if;

  if char_length(v_body) = 0 then
    raise exception 'Pesan tidak boleh kosong.' using errcode = '22023';
  end if;
  if char_length(v_body) > 2000 then
    raise exception 'Pesan terlalu panjang (maksimal 2000 karakter).' using errcode = '22023';
  end if;

  select * into v_conv from public.conversations where id = p_conversation_id;
  if v_conv.id is null or (v_conv.student_id <> v_uid and v_conv.tutor_id <> v_uid) then
    raise exception 'Percakapan tidak ditemukan.' using errcode = 'P0002';
  end if;

  v_recipient := case when v_conv.student_id = v_uid then v_conv.tutor_id else v_conv.student_id end;

  select exists (
    select 1 from public.messages
    where conversation_id = v_conv.id and sender_id = v_uid and read_at is null
  ) into v_had_unread;

  insert into public.messages (conversation_id, sender_id, body)
  values (v_conv.id, v_uid, v_body)
  returning * into v_msg;

  update public.conversations
  set last_message_at = v_msg.created_at
  where id = v_conv.id;

  if not v_had_unread and to_regclass('public.notifications') is not null then
    begin
      select coalesce(nullif(full_name, ''), 'Pengguna') into v_sender_name
      from public.profiles where id = v_uid;

      v_link := case when v_recipient = v_conv.tutor_id
        then '/tutor/messages?c=' || v_conv.id
        else '/student/messages?c=' || v_conv.id
      end;

      insert into public.notifications (user_id, title, message, type, link_url)
      values (
        v_recipient,
        'Pesan baru dari ' || left(v_sender_name, 150),
        left(v_body, 200),
        'info',
        v_link
      );
    exception when others then
      null;
    end;
  end if;

  return v_msg;
end;
$$;

-- -----------------------------------------------------------------------------
-- 5. RPC: mark_conversation_read
-- -----------------------------------------------------------------------------
create or replace function public.mark_conversation_read(p_conversation_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_count integer;
begin
  if v_uid is null then
    raise exception 'Autentikasi diperlukan.' using errcode = '42501';
  end if;

  update public.messages m
  set read_at = now()
  from public.conversations c
  where m.conversation_id = c.id
    and c.id = p_conversation_id
    and (c.student_id = v_uid or c.tutor_id = v_uid)
    and m.sender_id <> v_uid
    and m.read_at is null;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- -----------------------------------------------------------------------------
-- 6. RPC: list_my_conversations
-- -----------------------------------------------------------------------------
create or replace function public.list_my_conversations()
returns table (
  conversation_id        uuid,
  other_user_id          uuid,
  other_name             text,
  other_avatar_url       text,
  other_role             text,
  last_message_body      text,
  last_message_sender_id uuid,
  last_message_at        timestamptz,
  unread_count           integer,
  created_at             timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.id,
    o.id,
    coalesce(nullif(o.full_name, ''), 'Pengguna'),
    o.avatar_url,
    o.role::text,
    lm.body,
    lm.sender_id,
    coalesce(c.last_message_at, c.created_at),
    (
      select count(*)::integer from public.messages u
      where u.conversation_id = c.id
        and u.sender_id <> auth.uid()
        and u.read_at is null
    ),
    c.created_at
  from public.conversations c
  join public.profiles o
    on o.id = case when c.student_id = auth.uid() then c.tutor_id else c.student_id end
  left join lateral (
    select m.body, m.sender_id
    from public.messages m
    where m.conversation_id = c.id
    order by m.created_at desc
    limit 1
  ) lm on true
  where c.student_id = auth.uid() or c.tutor_id = auth.uid()
  order by coalesce(c.last_message_at, c.created_at) desc;
$$;

-- -----------------------------------------------------------------------------
-- 7. RPC: list_message_contacts
--    Student: active tutors (with their subjects).
--    Tutor:   students who have booked them (with the booked subjects).
-- -----------------------------------------------------------------------------
create or replace function public.list_message_contacts()
returns table (
  user_id     uuid,
  full_name   text,
  avatar_url  text,
  subtitle    text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_uid  uuid := auth.uid();
  v_role public.user_role;
begin
  if v_uid is null then
    raise exception 'Autentikasi diperlukan.' using errcode = '42501';
  end if;

  select role into v_role from public.profiles where id = v_uid;

  if v_role = 'student' then
    return query
      select
        p.id,
        coalesce(nullif(p.full_name, ''), 'Tutor'),
        p.avatar_url,
        (
          select string_agg(s.name, ', ' order by s.name)
          from public.tutor_subjects ts
          join public.subjects s on s.id = ts.subject_id
          where ts.tutor_id = tp.id
        )
      from public.tutor_profiles tp
      join public.profiles p on p.id = tp.user_id
      where tp.is_active and p.role = 'tutor'
      order by p.full_name;

  elsif v_role = 'tutor' then
    return query
      select
        p.id,
        coalesce(nullif(p.full_name, ''), 'Murid'),
        p.avatar_url,
        string_agg(distinct s.name, ', ')
      from public.bookings b
      join public.tutor_profiles tp on tp.id = b.tutor_id
      join public.profiles p on p.id = b.student_id
      left join public.subjects s on s.id = b.subject_id
      where tp.user_id = v_uid
      group by p.id, p.full_name, p.avatar_url
      order by p.full_name;
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- 8. GRANTS
-- -----------------------------------------------------------------------------
revoke execute on function public.start_conversation(uuid)          from public, anon;
revoke execute on function public.send_message(uuid, text)          from public, anon;
revoke execute on function public.mark_conversation_read(uuid)      from public, anon;
revoke execute on function public.list_my_conversations()           from public, anon;
revoke execute on function public.list_message_contacts()           from public, anon;

grant execute on function public.start_conversation(uuid)           to authenticated;
grant execute on function public.send_message(uuid, text)           to authenticated;
grant execute on function public.mark_conversation_read(uuid)       to authenticated;
grant execute on function public.list_my_conversations()            to authenticated;
grant execute on function public.list_message_contacts()            to authenticated;

-- -----------------------------------------------------------------------------
-- 9. REALTIME (new messages and read receipts pushed to participants; RLS applies)
-- -----------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
     ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end;
$$;
