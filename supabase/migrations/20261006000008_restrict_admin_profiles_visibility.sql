-- Migration: 20261006000008_restrict_admin_profiles_visibility.sql
-- Description: Restrict regular admin from viewing admin and super_admin profiles (only students and tutors).
-- Super admin retains full visibility across all platform profiles.

drop policy if exists "profiles: read own, admin, or tutor" on public.profiles;

create policy "profiles: read own, admin, or tutor"
  on public.profiles for select
  to authenticated, anon
  using (
    id = (select auth.uid())
    or (select public.is_super_admin())
    or (
      (select public.is_admin())
      and role in ('student', 'tutor')
    )
    or role = 'tutor'
  );
