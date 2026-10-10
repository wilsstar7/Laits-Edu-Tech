-- Migration: 20261006000007_allow_read_tutor_profiles.sql
-- Description: Allow students and visitors to read tutor profiles in the tutor marketplace.

drop policy if exists "profiles: read own or admin" on public.profiles;
drop policy if exists "profiles: read own, admin, or tutor" on public.profiles;

create policy "profiles: read own, admin, or tutor"
  on public.profiles for select
  to authenticated, anon
  using (
    id = (select auth.uid())
    or (select public.is_admin())
    or role = 'tutor'
  );
