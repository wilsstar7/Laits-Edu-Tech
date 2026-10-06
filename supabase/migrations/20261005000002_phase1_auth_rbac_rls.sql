-- =============================================================================
-- PHASE 1 — AUTH TRIGGERS, RBAC HELPERS, GRANTS & ROW LEVEL SECURITY
--
-- Security model (defense in depth):
--   1. RLS on every table (row visibility / ownership).
--   2. Column-level GRANTs (clients can only UPDATE whitelisted columns —
--      `role`, `id`, `user_id`, `email`, `rating` are NOT writable).
--   3. BEFORE UPDATE trigger that rejects changes to authorization fields
--      when the statement comes from a client role (anon / authenticated).
--   4. Role changes only through `admin_set_user_role()` (SECURITY DEFINER,
--      validates caller role server-side).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. RBAC helper functions
--    SECURITY DEFINER so policies can read profiles.role without recursive RLS.
-- -----------------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role from public.profiles p where p.id = (select auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.role in ('admin', 'super_admin') from public.profiles p where p.id = (select auth.uid())),
    false
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.role = 'super_admin' from public.profiles p where p.id = (select auth.uid())),
    false
  );
$$;

-- -----------------------------------------------------------------------------
-- 2. Protect authorization fields on profiles
--    SECURITY INVOKER on purpose: `current_user` must reflect the caller.
--    Inside SECURITY DEFINER functions (admin RPC, auth triggers) current_user
--    is the function owner, so trusted server-side code passes through.
-- -----------------------------------------------------------------------------
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if new.id is distinct from old.id then
      raise exception 'Perubahan tidak diizinkan.' using errcode = '42501';
    end if;
    if new.role is distinct from old.role then
      raise exception 'Perubahan peran tidak diizinkan.' using errcode = '42501';
    end if;
    if new.email is distinct from old.email then
      raise exception 'Email hanya dapat diubah melalui pengaturan akun.' using errcode = '42501';
    end if;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

create or replace function public.protect_owner_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if new.user_id is distinct from old.user_id or new.id is distinct from old.id then
      raise exception 'Perubahan tidak diizinkan.' using errcode = '42501';
    end if;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

create trigger student_profiles_protect_fields
  before update on public.student_profiles
  for each row execute function public.protect_owner_fields();

create trigger tutor_profiles_protect_fields
  before update on public.tutor_profiles
  for each row execute function public.protect_owner_fields();

-- -----------------------------------------------------------------------------
-- 3. auth.users → profiles (signup trigger)
--    * Role is ALWAYS 'student' — client metadata is never trusted for role.
--    * Metadata is sanitized; invalid values become NULL.
--    * Failures are logged as WARNING and never block signup. Missing rows are
--      recovered on first login via public.ensure_profile().
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta     jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_dob    date;
  v_gender public.gender_type;
  v_grade  text;
  v_phone  text;
begin
  begin
    insert into public.profiles (id, email, full_name, role)
    values (
      new.id,
      coalesce(new.email, ''),
      left(coalesce(nullif(trim(meta ->> 'full_name'), ''), nullif(trim(meta ->> 'name'), ''), ''), 120),
      'student'
    )
    on conflict (id) do nothing;
  exception when others then
    raise warning 'handle_new_user: profile insert failed for user % (sqlstate %): %', new.id, sqlstate, sqlerrm;
    return new;
  end;

  begin
    begin
      v_dob := nullif(meta ->> 'date_of_birth', '')::date;
    exception when others then
      v_dob := null;
    end;
    if v_dob is not null and (v_dob < date '1900-01-01' or v_dob > current_date) then
      v_dob := null;
    end if;

    v_gender := case meta ->> 'gender'
                  when 'male' then 'male'::public.gender_type
                  when 'female' then 'female'::public.gender_type
                  else null
                end;

    v_grade := case
                 when meta ->> 'grade' in ('1','2','3','4','5','6','7','8','9','10','11','12','kuliah','umum')
                   then meta ->> 'grade'
                 else null
               end;

    v_phone := case
                 when (meta ->> 'parent_phone') ~ '^\+?[0-9][0-9 \-]{6,19}$' then meta ->> 'parent_phone'
                 else null
               end;

    insert into public.student_profiles (
      user_id, date_of_birth, gender, school, grade, city, parent_name, parent_phone
    )
    values (
      new.id,
      v_dob,
      v_gender,
      left(nullif(trim(meta ->> 'school'), ''), 150),
      v_grade,
      left(nullif(trim(meta ->> 'city'), ''), 100),
      left(nullif(trim(meta ->> 'parent_name'), ''), 120),
      v_phone
    )
    on conflict (user_id) do nothing;
  exception when others then
    raise warning 'handle_new_user: student_profile insert failed for user % (sqlstate %): %', new.id, sqlstate, sqlerrm;
  end;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep profiles.email in sync when the user changes email through Supabase Auth.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    begin
      update public.profiles set email = coalesce(new.email, '') where id = new.id;
    exception when others then
      raise warning 'handle_user_email_change failed for user % (sqlstate %): %', new.id, sqlstate, sqlerrm;
    end;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();

-- -----------------------------------------------------------------------------
-- 4. RPC: ensure_profile()
--    Self-healing for users without a profile row (trigger failure, OAuth, or
--    users created before this migration). Always creates role = 'student'.
-- -----------------------------------------------------------------------------
create or replace function public.ensure_profile()
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid     uuid := auth.uid();
  v_user    auth.users%rowtype;
  v_profile public.profiles%rowtype;
begin
  if v_uid is null then
    raise exception 'Tidak terautentikasi.' using errcode = '28000';
  end if;

  select * into v_profile from public.profiles where id = v_uid;
  if found then
    return v_profile;
  end if;

  select * into v_user from auth.users where id = v_uid;
  if not found then
    raise exception 'Pengguna tidak ditemukan.' using errcode = 'P0002';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    v_user.id,
    coalesce(v_user.email, ''),
    left(coalesce(
      nullif(trim(v_user.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(v_user.raw_user_meta_data ->> 'name'), ''),
      ''
    ), 120),
    'student'
  )
  on conflict (id) do nothing;

  insert into public.student_profiles (user_id) values (v_user.id)
  on conflict (user_id) do nothing;

  select * into v_profile from public.profiles where id = v_uid;
  return v_profile;
end;
$$;

-- -----------------------------------------------------------------------------
-- 5. RPC: admin_set_user_role()
--    admin       → may switch users between 'student' and 'tutor' only.
--    super_admin → may assign any role (except changing their own).
-- -----------------------------------------------------------------------------
create or replace function public.admin_set_user_role(target_user_id uuid, new_role public.user_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_role public.user_role;
  v_target_role public.user_role;
begin
  v_caller_role := public.current_user_role();

  if v_caller_role is null or v_caller_role not in ('admin', 'super_admin') then
    raise exception 'Akses ditolak.' using errcode = '42501';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'Anda tidak dapat mengubah peran akun sendiri.' using errcode = '42501';
  end if;

  select role into v_target_role from public.profiles where id = target_user_id for update;
  if not found then
    raise exception 'Pengguna tidak ditemukan.' using errcode = 'P0002';
  end if;

  if v_caller_role = 'admin'
     and (v_target_role not in ('student', 'tutor') or new_role not in ('student', 'tutor')) then
    raise exception 'Akses ditolak.' using errcode = '42501';
  end if;

  update public.profiles set role = new_role where id = target_user_id;

  if new_role = 'tutor' then
    insert into public.tutor_profiles (user_id) values (target_user_id)
    on conflict (user_id) do nothing;
  elsif new_role = 'student' then
    insert into public.student_profiles (user_id) values (target_user_id)
    on conflict (user_id) do nothing;
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- 6. Function privileges (Postgres grants EXECUTE to PUBLIC by default)
-- -----------------------------------------------------------------------------
revoke execute on function public.current_user_role()               from public, anon;
revoke execute on function public.is_admin()                        from public, anon;
revoke execute on function public.is_super_admin()                  from public, anon;
revoke execute on function public.ensure_profile()                  from public, anon;
revoke execute on function public.admin_set_user_role(uuid, public.user_role) from public, anon;
revoke execute on function public.handle_new_user()                 from public, anon, authenticated;
revoke execute on function public.handle_user_email_change()        from public, anon, authenticated;
revoke execute on function public.protect_profile_fields()          from public, anon, authenticated;
revoke execute on function public.protect_owner_fields()            from public, anon, authenticated;

grant execute on function public.current_user_role()   to authenticated;
grant execute on function public.is_admin()            to authenticated;
grant execute on function public.is_super_admin()      to authenticated;
grant execute on function public.ensure_profile()      to authenticated;
grant execute on function public.admin_set_user_role(uuid, public.user_role) to authenticated;

-- -----------------------------------------------------------------------------
-- 7. Table / column privileges
--    Supabase grants ALL to anon/authenticated by default — reset to least
--    privilege, then whitelist writable columns.
-- -----------------------------------------------------------------------------
revoke all on table public.profiles         from anon, authenticated;
revoke all on table public.student_profiles from anon, authenticated;
revoke all on table public.tutor_profiles   from anon, authenticated;
revoke all on table public.subjects         from anon, authenticated;

-- profiles: read (filtered by RLS) + update of non-authorization columns only
grant select on table public.profiles to authenticated;
grant update (full_name, phone, avatar_url) on table public.profiles to authenticated;

-- student_profiles
grant select on table public.student_profiles to authenticated;
grant insert (user_id, date_of_birth, gender, school, grade, city, parent_name, parent_phone)
  on table public.student_profiles to authenticated;
grant update (date_of_birth, gender, school, grade, city, parent_name, parent_phone)
  on table public.student_profiles to authenticated;

-- tutor_profiles (rating is system-managed → not writable)
grant select on table public.tutor_profiles to authenticated;
grant update (bio, phone, education_background, experience, teaching_style, hourly_rate)
  on table public.tutor_profiles to authenticated;

-- subjects: public catalog read; writes restricted to admins by RLS
grant select on table public.subjects to anon, authenticated;
grant insert, update, delete on table public.subjects to authenticated;

-- -----------------------------------------------------------------------------
-- 8. Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.student_profiles enable row level security;
alter table public.tutor_profiles   enable row level security;
alter table public.subjects         enable row level security;

-- profiles --------------------------------------------------------------------
create policy "profiles: read own or admin"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "profiles: update own, admin (student/tutor), super_admin (all)"
  on public.profiles for update
  to authenticated
  using (
    id = (select auth.uid())
    or (select public.is_super_admin())
    or ((select public.is_admin()) and role in ('student', 'tutor'))
  )
  with check (
    id = (select auth.uid())
    or (select public.is_super_admin())
    or ((select public.is_admin()) and role in ('student', 'tutor'))
  );
-- No INSERT / DELETE policies: rows are created by trigger / ensure_profile()
-- and removed via ON DELETE CASCADE from auth.users.

-- student_profiles ------------------------------------------------------------
create policy "student_profiles: read own or admin"
  on public.student_profiles for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "student_profiles: insert own (students only)"
  on public.student_profiles for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and (select public.current_user_role()) = 'student'
  );

create policy "student_profiles: update own or admin"
  on public.student_profiles for update
  to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_admin()));

-- tutor_profiles --------------------------------------------------------------
create policy "tutor_profiles: read own or admin"
  on public.tutor_profiles for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "tutor_profiles: update own or admin"
  on public.tutor_profiles for update
  to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_admin()));
-- INSERT happens only inside admin_set_user_role() (SECURITY DEFINER).

-- subjects --------------------------------------------------------------------
create policy "subjects: anon reads active"
  on public.subjects for select
  to anon
  using (is_active);

create policy "subjects: authenticated reads active, admin reads all"
  on public.subjects for select
  to authenticated
  using (is_active or (select public.is_admin()));

create policy "subjects: admin insert"
  on public.subjects for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "subjects: admin update"
  on public.subjects for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "subjects: admin delete"
  on public.subjects for delete
  to authenticated
  using ((select public.is_admin()));
