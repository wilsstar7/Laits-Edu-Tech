-- =============================================================================
-- PHASE 3 : PERSONALITY PDF REPORT & REPORT MANAGEMENT
-- =============================================================================
-- 1. Table: personality_reports
-- 2. Performance indexes
-- 3. Row Level Security (RLS) for personality_reports
-- 4. Private Storage Bucket: personality-reports
-- 5. Storage RLS policies for storage.objects
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. personality_reports table
-- -----------------------------------------------------------------------------
create table if not exists public.personality_reports (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  assessment_result_id  uuid not null references public.assessment_results(id) on delete cascade,
  file_path             text not null,
  file_name             text not null,
  file_size             integer not null default 0 check (file_size >= 0),
  mime_type             text not null default 'application/pdf',
  report_version        text not null default '1.0',
  status                text not null default 'generating' check (status in ('generating', 'ready', 'failed', 'deleted')),
  generated_at          timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (assessment_result_id, report_version)
);

-- Trigger for updated_at
drop trigger if exists trg_personality_reports_updated_at on public.personality_reports;
create trigger trg_personality_reports_updated_at
  before update on public.personality_reports
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 2. Performance Indexes
-- -----------------------------------------------------------------------------
create index if not exists idx_personality_reports_user on public.personality_reports(user_id, created_at desc);
create index if not exists idx_personality_reports_result on public.personality_reports(assessment_result_id);
create index if not exists idx_personality_reports_status on public.personality_reports(status);

-- -----------------------------------------------------------------------------
-- 3. Row Level Security (RLS) for personality_reports
-- -----------------------------------------------------------------------------
alter table public.personality_reports enable row level security;

drop policy if exists "reports_select_own" on public.personality_reports;
create policy "reports_select_own"
  on public.personality_reports for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "reports_insert_own" on public.personality_reports;
create policy "reports_insert_own"
  on public.personality_reports for insert
  to authenticated
  with check (
    user_id = (select auth.uid()) and
    exists (
      select 1 from public.assessment_results r
      where r.id = personality_reports.assessment_result_id
        and (r.user_id = (select auth.uid()) or public.is_admin())
    )
  );

drop policy if exists "reports_update_own" on public.personality_reports;
create policy "reports_update_own"
  on public.personality_reports for update
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin())
  with check (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "reports_delete_admin" on public.personality_reports;
create policy "reports_delete_admin"
  on public.personality_reports for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 4. Private Storage Bucket: personality-reports
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'personality-reports',
  'personality-reports',
  false,
  10485760, -- 10MB
  array['application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- -----------------------------------------------------------------------------
-- 5. Storage RLS policies for storage.objects
-- Path: {user_id}/{assessment_result_id}/{file_name}
-- -----------------------------------------------------------------------------
drop policy if exists "personality_reports_storage_select" on storage.objects;
create policy "personality_reports_storage_select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'personality-reports' and
    (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or public.is_admin()
    )
  );

drop policy if exists "personality_reports_storage_insert" on storage.objects;
create policy "personality_reports_storage_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'personality-reports' and
    (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or public.is_admin()
    )
  );

drop policy if exists "personality_reports_storage_update" on storage.objects;
create policy "personality_reports_storage_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'personality-reports' and
    (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or public.is_admin()
    )
  );

drop policy if exists "personality_reports_storage_delete" on storage.objects;
create policy "personality_reports_storage_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'personality-reports' and
    (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or public.is_admin()
    )
  );
