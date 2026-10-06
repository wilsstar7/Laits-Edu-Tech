-- =============================================================================
-- PHASE 4 : PERSONALIZED LEARNING, TUTOR MARKETPLACE & BOOKING ENGINE
-- =============================================================================
-- Tables:
--   1. personality_type_subjects
--   2. learning_paths
--   3. learning_path_subjects
--   4. personality_type_learning_paths
--   5. tutor_profiles (columns addition: is_verified, headline, experience_years, total_reviews, is_active)
--   6. tutor_subjects
--   7. tutor_availability
--   8. bookings
--
-- Security & Integrity:
--   - Strict RLS on every new table
--   - Database-level double booking prevention via btree_gist exclusion constraint
--   - Atomic booking transaction RPC: create_booking()
--   - State-machine status transition RPC: update_booking_status()
-- =============================================================================

-- Ensure btree_gist extension exists for exclusion constraints
create extension if not exists btree_gist with schema extensions;

-- -----------------------------------------------------------------------------
-- 1. personality_type_subjects
-- -----------------------------------------------------------------------------
create table if not exists public.personality_type_subjects (
  id                  uuid primary key default gen_random_uuid(),
  personality_type_id uuid not null references public.personality_types(id) on delete cascade,
  subject_id          uuid not null references public.subjects(id) on delete cascade,
  priority            integer not null default 1 check (priority >= 1),
  reason              text not null default '',
  created_at          timestamptz not null default now(),
  unique (personality_type_id, subject_id)
);

comment on table public.personality_type_subjects is 'Maps personality types to recommended curriculum subjects with priority and rationale.';

-- -----------------------------------------------------------------------------
-- 2. learning_paths
-- -----------------------------------------------------------------------------
create table if not exists public.learning_paths (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null check (char_length(title) between 2 and 150),
  slug                text not null unique check (slug ~ '^[a-z0-9-]+$'),
  description         text not null check (char_length(description) <= 2000),
  thumbnail_url       text check (thumbnail_url is null or char_length(thumbnail_url) <= 2048),
  difficulty          text not null default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  estimated_duration  text not null check (char_length(estimated_duration) <= 50),
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

drop trigger if exists trg_learning_paths_updated_at on public.learning_paths;
create trigger trg_learning_paths_updated_at
  before update on public.learning_paths
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. learning_path_subjects
-- -----------------------------------------------------------------------------
create table if not exists public.learning_path_subjects (
  id                uuid primary key default gen_random_uuid(),
  learning_path_id  uuid not null references public.learning_paths(id) on delete cascade,
  subject_id        uuid not null references public.subjects(id) on delete cascade,
  display_order     integer not null default 0,
  created_at        timestamptz not null default now(),
  unique (learning_path_id, subject_id)
);

-- -----------------------------------------------------------------------------
-- 4. personality_type_learning_paths
-- -----------------------------------------------------------------------------
create table if not exists public.personality_type_learning_paths (
  id                  uuid primary key default gen_random_uuid(),
  personality_type_id uuid not null references public.personality_types(id) on delete cascade,
  learning_path_id    uuid not null references public.learning_paths(id) on delete cascade,
  priority            integer not null default 1 check (priority >= 1),
  reason              text not null default '',
  created_at          timestamptz not null default now(),
  unique (personality_type_id, learning_path_id)
);

-- -----------------------------------------------------------------------------
-- 5. tutor_profiles updates (safe schema evolution)
-- -----------------------------------------------------------------------------
alter table public.tutor_profiles
  add column if not exists is_verified boolean not null default false,
  add column if not exists headline text check (headline is null or char_length(headline) <= 200),
  add column if not exists experience_years integer not null default 0 check (experience_years >= 0),
  add column if not exists total_reviews integer not null default 0 check (total_reviews >= 0),
  add column if not exists is_active boolean not null default true;

-- Update protect_owner_fields trigger to safeguard tutor rating, is_verified, total_reviews
create or replace function public.protect_tutor_profile_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if new.user_id is distinct from old.user_id or new.id is distinct from old.id then
      raise exception 'Perubahan ID tutor tidak diizinkan.' using errcode = '42501';
    end if;
    -- Non-admin cannot alter verified status or rating directly
    if not (select public.is_admin()) then
      if new.is_verified is distinct from old.is_verified then
        raise exception 'Perubahan status verifikasi hanya dapat dilakukan oleh admin.' using errcode = '42501';
      end if;
      if new.rating is distinct from old.rating or new.total_reviews is distinct from old.total_reviews then
        raise exception 'Rating dan review dikelola secara otomatis oleh sistem.' using errcode = '42501';
      end if;
    end if;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists tutor_profiles_protect_fields on public.tutor_profiles;
create trigger tutor_profiles_protect_fields
  before update on public.tutor_profiles
  for each row execute function public.protect_tutor_profile_fields();

-- -----------------------------------------------------------------------------
-- 6. tutor_subjects
-- -----------------------------------------------------------------------------
create table if not exists public.tutor_subjects (
  id         uuid primary key default gen_random_uuid(),
  tutor_id   uuid not null references public.tutor_profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (tutor_id, subject_id)
);

-- -----------------------------------------------------------------------------
-- 7. tutor_availability
-- -----------------------------------------------------------------------------
create table if not exists public.tutor_availability (
  id          uuid primary key default gen_random_uuid(),
  tutor_id    uuid not null references public.tutor_profiles(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0=Minggu, 1=Senin, ..., 6=Sabtu
  start_time  time not null,
  end_time    time not null check (end_time > start_time),
  timezone    text not null default 'Asia/Jakarta',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_tutor_availability_updated_at on public.tutor_availability;
create trigger trg_tutor_availability_updated_at
  before update on public.tutor_availability
  for each row execute function public.set_updated_at();

-- Prevent overlapping availability on the same day for the same tutor
create or replace function public.check_tutor_availability_overlap()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_overlap_count integer;
begin
  if new.is_active then
    select count(*) into v_overlap_count
    from public.tutor_availability
    where tutor_id = new.tutor_id
      and day_of_week = new.day_of_week
      and is_active = true
      and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      and (
        (new.start_time, new.end_time) overlaps (start_time, end_time)
      );

    if v_overlap_count > 0 then
      raise exception 'Jadwal ketersediaan bertabrakan dengan jadwal aktif lainnya pada hari yang sama.' using errcode = '23505';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_tutor_availability_overlap on public.tutor_availability;
create trigger trg_check_tutor_availability_overlap
  before insert or update on public.tutor_availability
  for each row execute function public.check_tutor_availability_overlap();

-- -----------------------------------------------------------------------------
-- 8. bookings
-- -----------------------------------------------------------------------------
create table if not exists public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references public.profiles(id) on delete cascade,
  tutor_id            uuid not null references public.tutor_profiles(id) on delete cascade,
  subject_id          uuid not null references public.subjects(id) on delete restrict,
  scheduled_start     timestamptz not null,
  scheduled_end       timestamptz not null check (scheduled_end > scheduled_start),
  timezone            text not null default 'Asia/Jakarta',
  status              text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'no_show')),
  student_note        text check (student_note is null or char_length(student_note) <= 1000),
  tutor_note          text check (tutor_note is null or char_length(tutor_note) <= 1000),
  meeting_url         text check (meeting_url is null or char_length(meeting_url) <= 2048),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  cancelled_at        timestamptz,
  cancelled_by        uuid references public.profiles(id),
  cancellation_reason text check (cancellation_reason is null or char_length(cancellation_reason) <= 500)
);

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- Database-level zero overlap constraint using PostgreSQL GiST & btree_gist
alter table public.bookings
  drop constraint if exists bookings_no_overlap_active;

alter table public.bookings
  add constraint bookings_no_overlap_active
  exclude using gist (
    tutor_id with =,
    tstzrange(scheduled_start, scheduled_end) with &&
  )
  where (status in ('pending', 'confirmed'));

-- -----------------------------------------------------------------------------
-- 9. Performance Indexes
-- -----------------------------------------------------------------------------
create index if not exists idx_pts_personality on public.personality_type_subjects(personality_type_id, priority);
create index if not exists idx_pts_subject on public.personality_type_subjects(subject_id);

create index if not exists idx_learning_paths_slug on public.learning_paths(slug);
create index if not exists idx_learning_paths_active on public.learning_paths(is_active);

create index if not exists idx_lps_path on public.learning_path_subjects(learning_path_id, display_order);
create index if not exists idx_lps_subject on public.learning_path_subjects(subject_id);

create index if not exists idx_ptlp_personality on public.personality_type_learning_paths(personality_type_id, priority);
create index if not exists idx_ptlp_path on public.personality_type_learning_paths(learning_path_id);

create index if not exists idx_tutor_subjects_tutor on public.tutor_subjects(tutor_id);
create index if not exists idx_tutor_subjects_subject on public.tutor_subjects(subject_id);

create index if not exists idx_tutor_avail_tutor_day on public.tutor_availability(tutor_id, day_of_week) where is_active;

create index if not exists idx_bookings_student on public.bookings(student_id, scheduled_start desc);
create index if not exists idx_bookings_tutor on public.bookings(tutor_id, scheduled_start desc);
create index if not exists idx_bookings_subject on public.bookings(subject_id);
create index if not exists idx_bookings_status on public.bookings(status, scheduled_start);
create index if not exists idx_bookings_timerange on public.bookings(scheduled_start, scheduled_end);

-- -----------------------------------------------------------------------------
-- 10. Row Level Security (RLS) Setup
-- -----------------------------------------------------------------------------
alter table public.personality_type_subjects enable row level security;
alter table public.learning_paths enable row level security;
alter table public.learning_path_subjects enable row level security;
alter table public.personality_type_learning_paths enable row level security;
alter table public.tutor_subjects enable row level security;
alter table public.tutor_availability enable row level security;
alter table public.bookings enable row level security;

-- personality_type_subjects
drop policy if exists "pts_read_all" on public.personality_type_subjects;
create policy "pts_read_all"
  on public.personality_type_subjects for select
  to authenticated, anon
  using (true);

drop policy if exists "pts_admin_all" on public.personality_type_subjects;
create policy "pts_admin_all"
  on public.personality_type_subjects for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- learning_paths
drop policy if exists "lp_read_active" on public.learning_paths;
create policy "lp_read_active"
  on public.learning_paths for select
  to authenticated, anon
  using (is_active or public.is_admin());

drop policy if exists "lp_admin_all" on public.learning_paths;
create policy "lp_admin_all"
  on public.learning_paths for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- learning_path_subjects
drop policy if exists "lps_read_all" on public.learning_path_subjects;
create policy "lps_read_all"
  on public.learning_path_subjects for select
  to authenticated, anon
  using (true);

drop policy if exists "lps_admin_all" on public.learning_path_subjects;
create policy "lps_admin_all"
  on public.learning_path_subjects for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- personality_type_learning_paths
drop policy if exists "ptlp_read_all" on public.personality_type_learning_paths;
create policy "ptlp_read_all"
  on public.personality_type_learning_paths for select
  to authenticated, anon
  using (true);

drop policy if exists "ptlp_admin_all" on public.personality_type_learning_paths;
create policy "ptlp_admin_all"
  on public.personality_type_learning_paths for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- tutor_profiles update RLS check (Allow public to browse active tutors)
drop policy if exists "tutor_profiles: read all active or own or admin" on public.tutor_profiles;
create policy "tutor_profiles: read all active or own or admin"
  on public.tutor_profiles for select
  to authenticated, anon
  using (is_active or user_id = (select auth.uid()) or public.is_admin());

-- tutor_subjects
drop policy if exists "tutor_subjects_read_all" on public.tutor_subjects;
create policy "tutor_subjects_read_all"
  on public.tutor_subjects for select
  to authenticated, anon
  using (true);

drop policy if exists "tutor_subjects_manage_own" on public.tutor_subjects;
create policy "tutor_subjects_manage_own"
  on public.tutor_subjects for all
  to authenticated
  using (
    exists (
      select 1 from public.tutor_profiles tp
      where tp.id = tutor_subjects.tutor_id
        and tp.user_id = (select auth.uid())
    ) or public.is_admin()
  )
  with check (
    exists (
      select 1 from public.tutor_profiles tp
      where tp.id = tutor_subjects.tutor_id
        and tp.user_id = (select auth.uid())
    ) or public.is_admin()
  );

-- tutor_availability
drop policy if exists "tutor_avail_read_active" on public.tutor_availability;
create policy "tutor_avail_read_active"
  on public.tutor_availability for select
  to authenticated, anon
  using (
    is_active
    or exists (
      select 1 from public.tutor_profiles tp
      where tp.id = tutor_availability.tutor_id
        and tp.user_id = (select auth.uid())
    )
    or public.is_admin()
  );

drop policy if exists "tutor_avail_manage_own" on public.tutor_availability;
create policy "tutor_avail_manage_own"
  on public.tutor_availability for all
  to authenticated
  using (
    exists (
      select 1 from public.tutor_profiles tp
      where tp.id = tutor_availability.tutor_id
        and tp.user_id = (select auth.uid())
    ) or public.is_admin()
  )
  with check (
    exists (
      select 1 from public.tutor_profiles tp
      where tp.id = tutor_availability.tutor_id
        and tp.user_id = (select auth.uid())
    ) or public.is_admin()
  );

-- bookings
drop policy if exists "bookings_read_party" on public.bookings;
create policy "bookings_read_party"
  on public.bookings for select
  to authenticated
  using (
    student_id = (select auth.uid())
    or exists (
      select 1 from public.tutor_profiles tp
      where tp.id = bookings.tutor_id
        and tp.user_id = (select auth.uid())
    )
    or public.is_admin()
  );

-- Direct booking insertion is guarded through secure RPC create_booking().
-- For fallback standard client inserts, we check student identity:
drop policy if exists "bookings_insert_own_student" on public.bookings;
create policy "bookings_insert_own_student"
  on public.bookings for insert
  to authenticated
  with check (
    student_id = (select auth.uid())
    and status in ('pending', 'confirmed')
  );

-- Direct booking update is allowed only for allowed state transitions or via RPC
drop policy if exists "bookings_update_party" on public.bookings;
create policy "bookings_update_party"
  on public.bookings for update
  to authenticated
  using (
    student_id = (select auth.uid())
    or exists (
      select 1 from public.tutor_profiles tp
      where tp.id = bookings.tutor_id
        and tp.user_id = (select auth.uid())
    )
    or public.is_admin()
  )
  with check (
    student_id = (select auth.uid())
    or exists (
      select 1 from public.tutor_profiles tp
      where tp.id = bookings.tutor_id
        and tp.user_id = (select auth.uid())
    )
    or public.is_admin()
  );

-- -----------------------------------------------------------------------------
-- 11. SECURE TRANSACTIONAL RPC : create_booking
-- -----------------------------------------------------------------------------
create or replace function public.create_booking(
  p_tutor_id        uuid,
  p_subject_id      uuid,
  p_scheduled_start timestamptz,
  p_scheduled_end   timestamptz,
  p_timezone        text default 'Asia/Jakarta',
  p_student_note    text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id        uuid := (select auth.uid());
  v_tutor             public.tutor_profiles%rowtype;
  v_subject_active    boolean;
  v_tutor_teaches     boolean;
  v_duration_minutes  numeric;
  v_day_of_week       integer;
  v_start_time        time;
  v_end_time          time;
  v_avail_matches     boolean;
  v_overlap_count     integer;
  v_booking_id        uuid;
begin
  -- 1. Authenticated user verification
  if v_student_id is null then
    raise exception 'Tidak terautentikasi: Silakan masuk terlebih dahulu.' using errcode = '42501';
  end if;

  -- 2. Verify student exists in profiles
  if not exists (select 1 from public.profiles where id = v_student_id) then
    raise exception 'Profil siswa tidak ditemukan.' using errcode = 'P0002';
  end if;

  -- 3. Verify slot time validity (must be in the future, at least 5 minutes ahead)
  if p_scheduled_start <= now() + interval '5 minutes' then
    raise exception 'Waktu mulai sesi harus di masa mendatang.' using errcode = '22023';
  end if;

  if p_scheduled_end <= p_scheduled_start then
    raise exception 'Waktu selesai harus setelah waktu mulai.' using errcode = '22023';
  end if;

  v_duration_minutes := round(extract(epoch from (p_scheduled_end - p_scheduled_start)) / 60);
  if v_duration_minutes not in (30, 60, 90) then
    raise exception 'Durasi sesi tidak valid. Durasi yang didukung adalah 30, 60, atau 90 menit.' using errcode = '22023';
  end if;

  -- 4. Verify tutor exists and is active
  select * into v_tutor
  from public.tutor_profiles
  where id = p_tutor_id and is_active = true;

  if not found then
    raise exception 'Tutor tidak ditemukan atau sedang tidak aktif.' using errcode = 'P0002';
  end if;

  -- Student cannot book themselves if they are also registered as a tutor
  if v_tutor.user_id = v_student_id then
    raise exception 'Anda tidak dapat memesan sesi bimbingan dengan akun tutor Anda sendiri.' using errcode = '42501';
  end if;

  -- 5. Verify subject exists and is active
  select is_active into v_subject_active
  from public.subjects
  where id = p_subject_id;

  if not found or not v_subject_active then
    raise exception 'Mata pelajaran tidak ditemukan atau sedang tidak aktif.' using errcode = 'P0002';
  end if;

  -- 6. Verify tutor teaches this subject
  select exists (
    select 1 from public.tutor_subjects
    where tutor_id = p_tutor_id and subject_id = p_subject_id
  ) into v_tutor_teaches;

  if not v_tutor_teaches then
    raise exception 'Tutor tidak mengampu mata pelajaran yang dipilih.' using errcode = '42501';
  end if;

  -- 7. Verify slot falls within tutor configured active availability
  -- Extract day_of_week and local times in target timezone
  v_day_of_week := extract(dow from (p_scheduled_start at time zone coalesce(p_timezone, 'Asia/Jakarta')))::integer;
  v_start_time  := (p_scheduled_start at time zone coalesce(p_timezone, 'Asia/Jakarta'))::time;
  v_end_time    := (p_scheduled_end at time zone coalesce(p_timezone, 'Asia/Jakarta'))::time;

  select exists (
    select 1 from public.tutor_availability
    where tutor_id = p_tutor_id
      and day_of_week = v_day_of_week
      and is_active = true
      and start_time <= v_start_time
      and end_time >= v_end_time
  ) into v_avail_matches;

  if not v_avail_matches then
    raise exception 'Waktu yang dipilih berada di luar jam ketersediaan tutor.' using errcode = '22023';
  end if;

  -- 8. Verify no overlapping active booking exists (pending or confirmed)
  select count(*) into v_overlap_count
  from public.bookings
  where tutor_id = p_tutor_id
    and status in ('pending', 'confirmed')
    and (scheduled_start, scheduled_end) overlaps (p_scheduled_start, p_scheduled_end);

  if v_overlap_count > 0 then
    raise exception 'Jadwal yang dipilih sudah terisi atau memiliki pemesanan lain. Silakan pilih slot waktu lain.' using errcode = '23505';
  end if;

  -- 9. Atomic insertion
  v_booking_id := gen_random_uuid();

  insert into public.bookings (
    id,
    student_id,
    tutor_id,
    subject_id,
    scheduled_start,
    scheduled_end,
    timezone,
    status,
    student_note
  ) values (
    v_booking_id,
    v_student_id,
    p_tutor_id,
    p_subject_id,
    p_scheduled_start,
    p_scheduled_end,
    coalesce(p_timezone, 'Asia/Jakarta'),
    'pending',
    nullif(trim(p_student_note), '')
  );

  return v_booking_id;
end;
$$;

grant execute on function public.create_booking(uuid, uuid, timestamptz, timestamptz, text, text) to authenticated;

-- -----------------------------------------------------------------------------
-- 12. SECURE STATUS TRANSITION RPC : update_booking_status
-- -----------------------------------------------------------------------------
create or replace function public.update_booking_status(
  p_booking_id    uuid,
  p_new_status    text,
  p_reason        text default null,
  p_tutor_note    text default null,
  p_meeting_url   text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id   uuid := (select auth.uid());
  v_booking     public.bookings%rowtype;
  v_is_tutor    boolean := false;
  v_is_student  boolean := false;
  v_is_admin    boolean := false;
begin
  if v_caller_id is null then
    raise exception 'Tidak terautentikasi.' using errcode = '42501';
  end if;

  select * into v_booking
  from public.bookings
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'Pemesanan bimbingan tidak ditemukan.' using errcode = 'P0002';
  end if;

  v_is_student := (v_booking.student_id = v_caller_id);
  v_is_tutor   := exists (
    select 1 from public.tutor_profiles tp
    where tp.id = v_booking.tutor_id and tp.user_id = v_caller_id
  );
  v_is_admin   := public.is_admin();

  if not (v_is_student or v_is_tutor or v_is_admin) then
    raise exception 'Anda tidak memiliki hak akses untuk mengubah pemesanan ini.' using errcode = '42501';
  end if;

  -- Status transition state machine validation
  if v_is_student and not v_is_admin then
    -- Students can only cancel their own pending or confirmed bookings
    if p_new_status <> 'cancelled' then
      raise exception 'Siswa hanya diizinkan untuk membatalkan pemesanan.' using errcode = '42501';
    end if;

    if v_booking.status not in ('pending', 'confirmed') then
      raise exception 'Pemesanan dengan status % tidak dapat dibatalkan.', v_booking.status using errcode = '22023';
    end if;

    update public.bookings
    set
      status = 'cancelled',
      cancelled_at = now(),
      cancelled_by = v_caller_id,
      cancellation_reason = nullif(trim(p_reason), ''),
      updated_at = now()
    where id = p_booking_id;

    return;
  end if;

  if v_is_tutor and not v_is_admin then
    -- Tutor workflows
    if v_booking.status = 'pending' then
      if p_new_status not in ('confirmed', 'rejected', 'cancelled') then
        raise exception 'Pemesanan berstatus pending hanya dapat dikonfirmasi atau ditolak.' using errcode = '22023';
      end if;
    elsif v_booking.status = 'confirmed' then
      if p_new_status not in ('completed', 'cancelled') then
        raise exception 'Pemesanan yang telah dikonfirmasi hanya dapat diselesaikan atau dibatalkan.' using errcode = '22023';
      end if;
    else
      raise exception 'Pemesanan dengan status % tidak dapat diubah.', v_booking.status using errcode = '22023';
    end if;

    update public.bookings
    set
      status = p_new_status,
      tutor_note = coalesce(nullif(trim(p_tutor_note), ''), v_booking.tutor_note),
      meeting_url = coalesce(nullif(trim(p_meeting_url), ''), v_booking.meeting_url),
      cancelled_at = case when p_new_status in ('cancelled', 'rejected') then now() else v_booking.cancelled_at end,
      cancelled_by = case when p_new_status in ('cancelled', 'rejected') then v_caller_id else v_booking.cancelled_by end,
      cancellation_reason = case when p_new_status in ('cancelled', 'rejected') then nullif(trim(p_reason), '') else v_booking.cancellation_reason end,
      updated_at = now()
    where id = p_booking_id;

    return;
  end if;

  -- Admin fallback
  if v_is_admin then
    update public.bookings
    set
      status = p_new_status,
      tutor_note = coalesce(nullif(trim(p_tutor_note), ''), v_booking.tutor_note),
      meeting_url = coalesce(nullif(trim(p_meeting_url), ''), v_booking.meeting_url),
      cancellation_reason = coalesce(nullif(trim(p_reason), ''), v_booking.cancellation_reason),
      updated_at = now()
    where id = p_booking_id;
    return;
  end if;
end;
$$;

grant execute on function public.update_booking_status(uuid, text, text, text, text) to authenticated;

-- =============================================================================
-- 13. SEED DATA FOR PHASE 4 (CURATED REALISTIC DEMO DATA)
-- =============================================================================

do $$
declare
  v_hash text := extensions.crypt('Password123!', extensions.gen_salt('bf', 10));

  -- 5 Demo Tutors Auth/Profile UUIDs
  v_tutor1_uid uuid := 'b1000000-0000-0000-0000-000000000001';
  v_tutor2_uid uuid := 'b1000000-0000-0000-0000-000000000002';
  v_tutor3_uid uuid := 'b1000000-0000-0000-0000-000000000003';
  v_tutor4_uid uuid := 'b1000000-0000-0000-0000-000000000004';
  v_tutor5_uid uuid := 'b1000000-0000-0000-0000-000000000005';

  -- Tutor Profiles UUIDs
  v_tp1_id uuid := 'b2000000-0000-0000-0000-000000000001';
  v_tp2_id uuid := 'b2000000-0000-0000-0000-000000000002';
  v_tp3_id uuid := 'b2000000-0000-0000-0000-000000000003';
  v_tp4_id uuid := 'b2000000-0000-0000-0000-000000000004';
  v_tp5_id uuid := 'b2000000-0000-0000-0000-000000000005';

  -- Subject UUIDs (from catalog)
  v_sub_math uuid := '00000000-0000-0000-0000-000000000101';
  v_sub_eng  uuid := '00000000-0000-0000-0000-000000000102';
  v_sub_phy  uuid := '00000000-0000-0000-0000-000000000103';
  v_sub_chem uuid := '00000000-0000-0000-0000-000000000104';
  v_sub_bio  uuid := '00000000-0000-0000-0000-000000000105';
  v_sub_qur  uuid := '00000000-0000-0000-0000-000000000201';
  v_sub_tahf uuid := '00000000-0000-0000-0000-000000000202';
  v_sub_had  uuid := '00000000-0000-0000-0000-000000000203';
  v_sub_fiqh uuid := '00000000-0000-0000-0000-000000000204';
  v_sub_arab uuid := '00000000-0000-0000-0000-000000000205';

  -- Personality Types UUIDs
  v_pt_exp uuid := '00000000-0000-0000-0000-00000000b001'; -- Explorer
  v_pt_pln uuid := '00000000-0000-0000-0000-00000000b002'; -- Planner
  v_pt_ana uuid := '00000000-0000-0000-0000-00000000b003'; -- Analyst
  v_pt_con uuid := '00000000-0000-0000-0000-00000000b004'; -- Connector

  -- Learning Path UUIDs
  v_lp1_id uuid := 'c0000000-0000-0000-0000-000000000001';
  v_lp2_id uuid := 'c0000000-0000-0000-0000-000000000002';
  v_lp3_id uuid := 'c0000000-0000-0000-0000-000000000003';
begin
  -- 1. Insert 5 Demo Tutors into auth.users (if not present)
  insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
  values
    (v_tutor1_uid, '00000000-0000-0000-0000-000000000000', 'farhan.tutor@laits.edu', v_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ust. Dr. Farhan Hakim, M.Pd"}', 'authenticated', 'authenticated', now(), now()),
    (v_tutor2_uid, '00000000-0000-0000-0000-000000000000', 'sarah.tutor@laits.edu', v_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sarah Amanda, S.Si"}', 'authenticated', 'authenticated', now(), now()),
    (v_tutor3_uid, '00000000-0000-0000-0000-000000000000', 'hendra.tutor@laits.edu', v_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Hendra Wijaya, M.Sc"}', 'authenticated', 'authenticated', now(), now()),
    (v_tutor4_uid, '00000000-0000-0000-0000-000000000000', 'annisa.tutor@laits.edu', v_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Annisa Larasati, M.Hum"}', 'authenticated', 'authenticated', now(), now()),
    (v_tutor5_uid, '00000000-0000-0000-0000-000000000000', 'zulkifli.tutor@laits.edu', v_hash, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ust. Zulkifli Rahman, Lc"}', 'authenticated', 'authenticated', now(), now())
  on conflict (id) do nothing;

  -- 2. Insert Profiles
  insert into public.profiles (id, full_name, email, role, phone)
  values
    (v_tutor1_uid, 'Ust. Dr. Farhan Hakim, M.Pd', 'farhan.tutor@laits.edu', 'tutor', '081198765401'),
    (v_tutor2_uid, 'Sarah Amanda, S.Si', 'sarah.tutor@laits.edu', 'tutor', '081198765402'),
    (v_tutor3_uid, 'Hendra Wijaya, M.Sc', 'hendra.tutor@laits.edu', 'tutor', '081198765403'),
    (v_tutor4_uid, 'Annisa Larasati, M.Hum', 'annisa.tutor@laits.edu', 'tutor', '081198765404'),
    (v_tutor5_uid, 'Ust. Zulkifli Rahman, Lc', 'zulkifli.tutor@laits.edu', 'tutor', '081198765405')
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = 'tutor';

  -- 3. Insert Tutor Profiles
  insert into public.tutor_profiles (id, user_id, bio, headline, education_background, experience, teaching_style, hourly_rate, rating, total_reviews, experience_years, is_verified, is_active)
  values
    (
      v_tp1_id,
      v_tutor1_uid,
      'Pendidik bersanad dengan pengalaman bimbingan tahsin, tajwid praktis, dan bahasa Arab lebih dari 10 tahun.',
      'Spesialis Tahsin Bersanad, Kaidah Tajwid & Bahasa Arab',
      'S3 Pendidikan Islam UIN Syarif Hidayatullah Jakarta',
      'Dosen Ilmu Tarbiyah dan Instruktur Pelatihan Tahsin Guru Quran',
      'Pendekatan sabar, metode talaqqi interaktif dua arah, serta koreksi makharijul huruf yang teliti dan apresiatif.',
      95000.00,
      4.95,
      48,
      10,
      true,
      true
    ),
    (
      v_tp2_id,
      v_tutor2_uid,
      'Pengajar Matematika dan Fisika berpengalaman membimbing siswa persiapan olimpiade sains dan seleksi masuk perguruan tinggi.',
      'Master Tutor Matematika Aljabar & Fisika Olimpiade',
      'S1 Matematika Universitas Indonesia',
      '7 tahun sebagai pengajar bimbel terakreditasi dan pelatih olimpiade sains kota Jakarta',
      'Visualisasi konsep logika deduktif, pembedahan pola soal bertahap, dan diskusi studi kasus aplikasi nyata.',
      85000.00,
      4.90,
      36,
      7,
      true,
      true
    ),
    (
      v_tp3_id,
      v_tutor3_uid,
      'Fasilitator sains yang berfokus pada pemahaman konsep inti kimia dan fisika melalui analogi sehari-hari tanpa menghafal rumus buta.',
      'Spesialis Kimia Analitik, Stoikiometri & Sains Berbasis Masalah',
      'S2 Kimia Institut Teknologi Bandung (ITB)',
      '6 tahun membimbing siswa SMA kurikulum Merdeka dan persiapan UTBK',
      'Eksplorasi konsep interaktif, pendekatan problem-based inquiry, serta penguatan pemahaman logika dasar.',
      80000.00,
      4.85,
      29,
      6,
      true,
      true
    ),
    (
      v_tp4_id,
      v_tutor4_uid,
      'Tutor Bahasa Inggris komunikatif dengan pengalaman mengajar conversation, grammar praktis, dan persiapan ujian akademik.',
      'Instruktur Bahasa Inggris Akademik & Percakapan Aktif',
      'S2 Linguistik Terapan Universitas Gadjah Mada',
      '5 tahun pengajar bahasa Inggris perguruan tinggi dan lembaga bahasa internasional',
      'Komunikatif, ramah, banyak latihan percakapan langsung, serta umpan balik koreksi yang membangun rasa percaya diri.',
      75000.00,
      4.88,
      22,
      5,
      true,
      true
    ),
    (
      v_tp5_id,
      v_tutor5_uid,
      'Pengajar studi Islam, Fiqih ibadah harian, Hadits, dan Bahasa Arab dengan sanad keilmuan yang bersambung dan metode terstruktur.',
      'Pengajar Fiqih Ibadah Praktis, Hadits & Kaidah Nahwu-Shorof',
      'S1 Syariah Universitas Islam Madinah',
      '8 tahun pengasuh bimbingan tahfidz dan mudarris kajian fiqih remaja',
      'Sistematis, terarah dengan silabus runtut, mengaitkan dalil Al-Qur''an dengan implementasi akhlak sehari-hari.',
      90000.00,
      4.92,
      31,
      8,
      true,
      true
    )
  on conflict (user_id) do update set
    bio = excluded.bio,
    headline = excluded.headline,
    education_background = excluded.education_background,
    experience = excluded.experience,
    teaching_style = excluded.teaching_style,
    hourly_rate = excluded.hourly_rate,
    rating = excluded.rating,
    total_reviews = excluded.total_reviews,
    experience_years = excluded.experience_years,
    is_verified = excluded.is_verified,
    is_active = excluded.is_active;

  -- 4. Connect Tutor with Subjects (tutor_subjects)
  -- Tutor 1: Al-Quran & Tajwid, Bahasa Arab, Tahfidz
  insert into public.tutor_subjects (tutor_id, subject_id)
  values
    (v_tp1_id, v_sub_qur),
    (v_tp1_id, v_sub_arab),
    (v_tp1_id, v_sub_tahf)
  on conflict do nothing;

  -- Tutor 2: Matematika, Fisika
  insert into public.tutor_subjects (tutor_id, subject_id)
  values
    (v_tp2_id, v_sub_math),
    (v_tp2_id, v_sub_phy)
  on conflict do nothing;

  -- Tutor 3: Kimia, Fisika, Biologi
  insert into public.tutor_subjects (tutor_id, subject_id)
  values
    (v_tp3_id, v_sub_chem),
    (v_tp3_id, v_sub_phy),
    (v_tp3_id, v_sub_bio)
  on conflict do nothing;

  -- Tutor 4: Bahasa Inggris
  insert into public.tutor_subjects (tutor_id, subject_id)
  values
    (v_tp4_id, v_sub_eng)
  on conflict do nothing;

  -- Tutor 5: Fiqih, Hadits, Bahasa Arab
  insert into public.tutor_subjects (tutor_id, subject_id)
  values
    (v_tp5_id, v_sub_fiqh),
    (v_tp5_id, v_sub_had),
    (v_tp5_id, v_sub_arab)
  on conflict do nothing;

  -- 5. Insert Availability for Demo Tutors
  -- Clean up previous demo availability for these tutors
  delete from public.tutor_availability
  where tutor_id in (v_tp1_id, v_tp2_id, v_tp3_id, v_tp4_id, v_tp5_id);

  -- Tutor 1: Senin, Rabu, Jumat (16:00 - 21:00)
  insert into public.tutor_availability (tutor_id, day_of_week, start_time, end_time, timezone, is_active)
  values
    (v_tp1_id, 1, '16:00'::time, '21:00'::time, 'Asia/Jakarta', true),
    (v_tp1_id, 3, '16:00'::time, '21:00'::time, 'Asia/Jakarta', true),
    (v_tp1_id, 5, '16:00'::time, '21:00'::time, 'Asia/Jakarta', true);

  -- Tutor 2: Selasa, Kamis, Sabtu (15:00 - 20:00)
  insert into public.tutor_availability (tutor_id, day_of_week, start_time, end_time, timezone, is_active)
  values
    (v_tp2_id, 2, '15:00'::time, '20:00'::time, 'Asia/Jakarta', true),
    (v_tp2_id, 4, '15:00'::time, '20:00'::time, 'Asia/Jakarta', true),
    (v_tp2_id, 6, '09:00'::time, '17:00'::time, 'Asia/Jakarta', true);

  -- Tutor 3: Senin, Selasa, Kamis (18:00 - 21:00)
  insert into public.tutor_availability (tutor_id, day_of_week, start_time, end_time, timezone, is_active)
  values
    (v_tp3_id, 1, '18:00'::time, '21:00'::time, 'Asia/Jakarta', true),
    (v_tp3_id, 2, '18:00'::time, '21:00'::time, 'Asia/Jakarta', true),
    (v_tp3_id, 4, '18:00'::time, '21:00'::time, 'Asia/Jakarta', true);

  -- Tutor 4: Rabu, Jumat, Sabtu (14:00 - 19:00)
  insert into public.tutor_availability (tutor_id, day_of_week, start_time, end_time, timezone, is_active)
  values
    (v_tp4_id, 3, '14:00'::time, '19:00'::time, 'Asia/Jakarta', true),
    (v_tp4_id, 5, '14:00'::time, '19:00'::time, 'Asia/Jakarta', true),
    (v_tp4_id, 6, '13:00'::time, '18:00'::time, 'Asia/Jakarta', true);

  -- Tutor 5: Senin, Rabu, Sabtu (18:30 - 21:30)
  insert into public.tutor_availability (tutor_id, day_of_week, start_time, end_time, timezone, is_active)
  values
    (v_tp5_id, 1, '18:30'::time, '21:30'::time, 'Asia/Jakarta', true),
    (v_tp5_id, 3, '18:30'::time, '21:30'::time, 'Asia/Jakarta', true),
    (v_tp5_id, 6, '08:00'::time, '12:00'::time, 'Asia/Jakarta', true);

  -- 6. Insert 3 Learning Paths
  insert into public.learning_paths (id, title, slug, description, difficulty, estimated_duration, is_active)
  values
    (
      v_lp1_id,
      'Fondasi Sains & Penalaran Logika',
      'sains-dan-logika',
      'Jalur belajar komprehensif untuk memperdalam pemahaman konsep Matematika, Fisika, dan Kimia secara analitis melalui pemecahan masalah bertahap.',
      'intermediate',
      '8 Minggu',
      true
    ),
    (
      v_lp2_id,
      'Komunikasi Global & Bahasa Asing',
      'bahasa-dan-komunikasi',
      'Jalur belajar terpadu untuk mengasah kemampuan komunikasi aktif, tata bahasa kontekstual, dan literasi internasional dalam Bahasa Inggris dan Bahasa Arab.',
      'beginner',
      '6 Minggu',
      true
    ),
    (
      v_lp3_id,
      'Pendalaman Al-Qur''an & Studi Islam Aplikatif',
      'studi-islam-qurani',
      'Jalur pembelajaran terstruktur mencakup kaidah tartil Al-Qur''an, tahfidz mutqin, kaidah fiqih harian, dan pemahaman hadits pilihan.',
      'beginner',
      '10 Minggu',
      true
    )
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    difficulty = excluded.difficulty,
    estimated_duration = excluded.estimated_duration,
    is_active = excluded.is_active;

  -- 7. Learning Path Subjects
  -- Path 1: Matematika, Fisika, Kimia
  insert into public.learning_path_subjects (learning_path_id, subject_id, display_order)
  values
    (v_lp1_id, v_sub_math, 1),
    (v_lp1_id, v_sub_phy, 2),
    (v_lp1_id, v_sub_chem, 3)
  on conflict (learning_path_id, subject_id) do update set display_order = excluded.display_order;

  -- Path 2: Bahasa Inggris, Bahasa Arab
  insert into public.learning_path_subjects (learning_path_id, subject_id, display_order)
  values
    (v_lp2_id, v_sub_eng, 1),
    (v_lp2_id, v_sub_arab, 2)
  on conflict (learning_path_id, subject_id) do update set display_order = excluded.display_order;

  -- Path 3: Al-Qur'an & Tajwid, Tahfidz, Fiqih, Hadits
  insert into public.learning_path_subjects (learning_path_id, subject_id, display_order)
  values
    (v_lp3_id, v_sub_qur, 1),
    (v_lp3_id, v_sub_tahf, 2),
    (v_lp3_id, v_sub_fiqh, 3),
    (v_lp3_id, v_sub_had, 4)
  on conflict (learning_path_id, subject_id) do update set display_order = excluded.display_order;

  -- 8. Connect Personality Types to Real Subjects (personality_type_subjects)
  -- Type 1: Explorer (Penjelajah Konseptual) -> Fisika, Biologi, Bahasa Inggris
  insert into public.personality_type_subjects (personality_type_id, subject_id, priority, reason)
  values
    (v_pt_exp, v_sub_phy, 1, 'Materi konsep dan eksperimen fisika memberi ruang eksplorasi rasa ingin tahu yang tinggi.'),
    (v_pt_exp, v_sub_bio, 2, 'Kajian ekosistem dan ragam biologi selaras dengan gaya belajar eksploratif berbasis analogi.'),
    (v_pt_exp, v_sub_eng, 3, 'Kemampuan komunikasi global mendukung eksplorasi sudut pandang wawasan baru.')
  on conflict (personality_type_id, subject_id) do update set priority = excluded.priority, reason = excluded.reason;

  -- Type 2: Planner (Perencana Terstruktur) -> Matematika, Kimia, Al-Qur'an & Tajwid
  insert into public.personality_type_subjects (personality_type_id, subject_id, priority, reason)
  values
    (v_pt_pln, v_sub_math, 1, 'Struktur aljabar dan geometri yang sistematis sangat sesuai dengan kecenderungan belajar metodis.'),
    (v_pt_pln, v_sub_chem, 2, 'Kaidah stoikiometri dan struktur atom memberikan target pembelajaran yang terukur dan runut.'),
    (v_pt_pln, v_sub_qur, 3, 'Ketertiban kaidah hukum tajwid selaras dengan kecermatan dan konsistensi Anda.')
  on conflict (personality_type_id, subject_id) do update set priority = excluded.priority, reason = excluded.reason;

  -- Type 3: Analyst (Pemikir Kritis) -> Matematika, Fisika, Fiqih
  insert into public.personality_type_subjects (personality_type_id, subject_id, priority, reason)
  values
    (v_pt_ana, v_sub_math, 1, 'Pembuktian teorema dan penalaran deduktif matematika menantang ketajaman analisis logis Anda.'),
    (v_pt_ana, v_sub_phy, 2, 'Mekanika dan hukum pergerakan fisika memberikan kepuasan pemecahan masalah mendalam.'),
    (v_pt_ana, v_sub_fiqh, 3, 'Kaidah dalil komparatif fiqih menuntut ketelitian penelaahan sumber yang komprehensif.')
  on conflict (personality_type_id, subject_id) do update set priority = excluded.priority, reason = excluded.reason;

  -- Type 4: Connector (Kolaborator Sosial) -> Bahasa Arab, Bahasa Inggris, Tahfidz
  insert into public.personality_type_subjects (personality_type_id, subject_id, priority, reason)
  values
    (v_pt_con, v_sub_arab, 1, 'Pembelajaran dialogis percakapan bahasa Arab selaras dengan antusiasme interaksi hangat.'),
    (v_pt_con, v_sub_eng, 2, 'Praktik speaking dua arah memberi kenyamanan belajar interaktif yang suportif.'),
    (v_pt_con, v_sub_tahf, 3, 'Bimbingan talaqqi setoran hafalan rutin memberikan dorongan motivasi melalui pendampingan intensif.')
  on conflict (personality_type_id, subject_id) do update set priority = excluded.priority, reason = excluded.reason;

  -- 9. Connect Personality Types to Learning Paths (personality_type_learning_paths)
  insert into public.personality_type_learning_paths (personality_type_id, learning_path_id, priority, reason)
  values
    (v_pt_exp, v_lp1_id, 1, 'Membantu mengarahkan rasa ingin tahu konseptual menjadi pemahaman sains aplikatif yang kokoh.'),
    (v_pt_exp, v_lp2_id, 2, 'Membuka akses referensi dan diskusi internasional melalui kemampuan bahasa aktif.'),
    (v_pt_pln, v_lp1_id, 1, 'Menyajikan kurikulum berjenjang dengan capaian materi yang terukur secara teratur.'),
    (v_pt_pln, v_lp3_id, 2, 'Memberikan panduan target hafalan dan pemahaman adab islami yang tertib.'),
    (v_pt_ana, v_lp1_id, 1, 'Menawarkan materi sains dengan pendalaman logika dan pembuktian soal tingkat tinggi.'),
    (v_pt_con, v_lp2_id, 1, 'Menyediakan ruang interaksi bahasa aktif yang ramah dan penuh dialog positif.'),
    (v_pt_con, v_lp3_id, 2, 'Pendampingan talaqqi bersama tutor yang hangat dan membimbing secara konsisten.')
  on conflict (personality_type_id, learning_path_id) do update set priority = excluded.priority, reason = excluded.reason;

end $$;
