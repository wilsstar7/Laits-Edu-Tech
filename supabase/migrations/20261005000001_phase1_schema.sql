-- =============================================================================
-- PHASE 1 — SCHEMA FOUNDATION
-- Tables : profiles, student_profiles, tutor_profiles, subjects
-- Notes  : Security (RLS, grants, role protection) lives in the next migration.
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.user_role as enum ('student', 'tutor', 'admin', 'super_admin');
create type public.gender_type as enum ('male', 'female');
create type public.subject_category as enum ('general', 'religious');

-- -----------------------------------------------------------------------------
-- Shared helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles — 1:1 with auth.users. Holds identity + authorization (role).
-- -----------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '' check (char_length(full_name) <= 120),
  email       text not null check (char_length(email) <= 320),
  avatar_url  text check (avatar_url is null or char_length(avatar_url) <= 2048),
  role        public.user_role not null default 'student',
  phone       text check (phone is null or phone ~ '^\+?[0-9][0-9 \-]{6,19}$'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Application profile for every auth user. role is protected; only admin RPCs may change it.';

create unique index profiles_email_lower_key on public.profiles (lower(email)) where email <> '';
create index profiles_role_idx on public.profiles (role);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- student_profiles — student-specific data (1:1 with profiles)
-- grade codes: '1'..'12' (SD/SMP/SMA), 'kuliah', 'umum'
-- -----------------------------------------------------------------------------
create table public.student_profiles (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null unique references public.profiles (id) on delete cascade,
  date_of_birth  date check (date_of_birth is null or date_of_birth >= date '1900-01-01'),
  gender         public.gender_type,
  school         text check (school is null or char_length(school) <= 150),
  grade          text check (
                   grade is null or grade in (
                     '1','2','3','4','5','6','7','8','9','10','11','12','kuliah','umum'
                   )
                 ),
  city           text check (city is null or char_length(city) <= 100),
  parent_name    text check (parent_name is null or char_length(parent_name) <= 120),
  parent_phone   text check (parent_phone is null or parent_phone ~ '^\+?[0-9][0-9 \-]{6,19}$'),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger student_profiles_set_updated_at
  before update on public.student_profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- tutor_profiles — foundation for the tutor marketplace (Phase 2+)
-- -----------------------------------------------------------------------------
create table public.tutor_profiles (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null unique references public.profiles (id) on delete cascade,
  bio                   text check (bio is null or char_length(bio) <= 2000),
  phone                 text check (phone is null or phone ~ '^\+?[0-9][0-9 \-]{6,19}$'),
  education_background  text check (education_background is null or char_length(education_background) <= 1000),
  experience            text check (experience is null or char_length(experience) <= 2000),
  teaching_style        text check (teaching_style is null or char_length(teaching_style) <= 1000),
  hourly_rate           numeric(12, 2) check (hourly_rate is null or hourly_rate >= 0),
  -- rating is system-computed (future reviews); clients cannot write it.
  rating                numeric(3, 2) not null default 0 check (rating between 0 and 5),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger tutor_profiles_set_updated_at
  before update on public.tutor_profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- subjects — database-driven subject catalog
-- -----------------------------------------------------------------------------
create table public.subjects (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 1 and 100),
  category     public.subject_category not null,
  description  text check (description is null or char_length(description) <= 1000),
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create unique index subjects_name_lower_key on public.subjects (lower(name));
create index subjects_category_active_idx on public.subjects (category) where is_active;

create trigger subjects_set_updated_at
  before update on public.subjects
  for each row execute function public.set_updated_at();
