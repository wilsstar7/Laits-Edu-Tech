-- =============================================================================
-- Migration: 20261006000004_phase7_production_hardening.sql
-- Description: LMS Phase 7 — Production Hardening, Security, Performance,
--              Notifications, Monthly Learning Reports, RLS Audit & State Guards.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. NOTIFICATIONS TABLE & RLS
-- -----------------------------------------------------------------------------
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 200),
  message     text not null check (char_length(message) <= 2000),
  type        text not null default 'info' check (type in ('info', 'booking', 'payment', 'report', 'system')),
  link_url    text check (link_url is null or char_length(link_url) <= 1000),
  is_read     boolean not null default false,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- Notifications Indexes
create index if not exists idx_notifications_user_unread 
  on public.notifications(user_id, is_read, created_at desc);

create index if not exists idx_notifications_user_created 
  on public.notifications(user_id, created_at desc);

-- Notifications RLS
alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid() or (select public.is_admin()));

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid() or (select public.is_admin()))
  with check (user_id = auth.uid() or (select public.is_admin()));

drop policy if exists "notifications_admin_manage" on public.notifications;
create policy "notifications_admin_manage"
  on public.notifications for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "notifications_admin_delete" on public.notifications;
create policy "notifications_admin_delete"
  on public.notifications for delete
  to authenticated
  using ((select public.is_admin()));

-- Function: Mark Single Notification As Read
create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Autentikasi diperlukan.' using errcode = '42501';
  end if;

  update public.notifications
  set
    is_read = true,
    read_at = coalesce(read_at, now())
  where id = p_notification_id
    and (user_id = auth.uid() or (select public.is_admin()));
end;
$$;

-- Function: Mark All Notifications As Read for current user
create or replace function public.mark_all_notifications_read()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if auth.uid() is null then
    raise exception 'Autentikasi diperlukan.' using errcode = '42501';
  end if;

  update public.notifications
  set
    is_read = true,
    read_at = now()
  where user_id = auth.uid()
    and not is_read;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Function: Create System Event Notification (Security Definer helper)
create or replace function public.create_system_notification(
  p_user_id   uuid,
  p_title     text,
  p_message   text,
  p_type      text default 'info',
  p_link_url  text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_notification_id uuid;
begin
  insert into public.notifications (
    user_id,
    title,
    message,
    type,
    link_url
  ) values (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_link_url
  ) returning id into v_notification_id;

  return v_notification_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2. MONTHLY LEARNING REPORTS TABLE & RLS
-- -----------------------------------------------------------------------------
create table if not exists public.monthly_learning_reports (
  id                      uuid primary key default gen_random_uuid(),
  student_id              uuid not null references public.profiles(id) on delete cascade,
  period_month            integer not null check (period_month between 1 and 12),
  period_year             integer not null check (period_year >= 2024),
  total_sessions          integer not null default 0 check (total_sessions >= 0),
  total_hours             numeric(6, 2) not null default 0 check (total_hours >= 0),
  avg_progress_percentage integer not null default 0 check (avg_progress_percentage between 0 and 100),
  summary                 text not null default '',
  status                  text not null default 'ready' check (status in ('generating', 'ready', 'failed')),
  file_path               text,
  generated_at            timestamptz not null default now(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (student_id, period_year, period_month)
);

-- Trigger: auto updated_at
drop trigger if exists trg_monthly_learning_reports_updated_at on public.monthly_learning_reports;
create trigger trg_monthly_learning_reports_updated_at
  before update on public.monthly_learning_reports
  for each row execute function public.set_updated_at();

-- Index for monthly reports query performance
create index if not exists idx_monthly_reports_student_period
  on public.monthly_learning_reports(student_id, period_year desc, period_month desc);

-- Monthly Learning Reports RLS
alter table public.monthly_learning_reports enable row level security;

drop policy if exists "monthly_reports_select_student" on public.monthly_learning_reports;
create policy "monthly_reports_select_student"
  on public.monthly_learning_reports for select
  to authenticated
  using (student_id = auth.uid() or (select public.is_admin()));

drop policy if exists "monthly_reports_admin_insert" on public.monthly_learning_reports;
create policy "monthly_reports_admin_insert"
  on public.monthly_learning_reports for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "monthly_reports_admin_update" on public.monthly_learning_reports;
create policy "monthly_reports_admin_update"
  on public.monthly_learning_reports for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "monthly_reports_admin_delete" on public.monthly_learning_reports;
create policy "monthly_reports_admin_delete"
  on public.monthly_learning_reports for delete
  to authenticated
  using ((select public.is_admin()));

-- Function: Generate Monthly Learning Report atomically from sessions and learning path
create or replace function public.generate_monthly_learning_report(
  p_student_id  uuid,
  p_year        integer,
  p_month       integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id       uuid := auth.uid();
  v_report_id       uuid;
  v_start_time      timestamptz;
  v_end_time        timestamptz;
  v_sessions_count  integer := 0;
  v_total_minutes   integer := 0;
  v_total_hours     numeric(6, 2) := 0;
  v_avg_progress    integer := 0;
  v_summary_text    text;
begin
  -- Authorization check
  if v_caller_id is null then
    raise exception 'Autentikasi diperlukan.' using errcode = '42501';
  end if;

  if v_caller_id <> p_student_id and not (select public.is_admin()) then
    raise exception 'Akses ditolak.' using errcode = '42501';
  end if;

  -- Build date boundaries for target month
  v_start_time := make_timestamptz(p_year, p_month, 1, 0, 0, 0, 'Asia/Jakarta');
  v_end_time := v_start_time + interval '1 month';

  -- Aggregate completed sessions in this calendar month
  select
    count(*),
    coalesce(sum(actual_duration_min), 0)
  into v_sessions_count, v_total_minutes
  from public.learning_sessions
  where student_id = p_student_id
    and status = 'completed'
    and started_at >= v_start_time
    and started_at < v_end_time;

  v_total_hours := round((v_total_minutes::numeric / 60.0), 2);

  -- Aggregate current learning path progress
  select coalesce(round(avg(progress_percentage))::integer, 0)
  into v_avg_progress
  from public.student_learning_paths
  where student_id = p_student_id;

  v_summary_text := format(
    'Laporan Pembelajaran Periode %s/%s: Siswa telah menyelesaikan %s sesi bimbingan dengan total durasi %s jam. Rata-rata kemajuan materi kurikulum saat ini mencapai %s%%.',
    p_month, p_year, v_sessions_count, v_total_hours, v_avg_progress
  );

  -- Upsert report idempotently
  insert into public.monthly_learning_reports (
    student_id,
    period_month,
    period_year,
    total_sessions,
    total_hours,
    avg_progress_percentage,
    summary,
    status,
    generated_at
  ) values (
    p_student_id,
    p_month,
    p_year,
    v_sessions_count,
    v_total_hours,
    v_avg_progress,
    v_summary_text,
    'ready',
    now()
  )
  on conflict (student_id, period_year, period_month)
  do update set
    total_sessions = excluded.total_sessions,
    total_hours = excluded.total_hours,
    avg_progress_percentage = excluded.avg_progress_percentage,
    summary = excluded.summary,
    status = 'ready',
    generated_at = now(),
    updated_at = now()
  returning id into v_report_id;

  -- Create notification for student
  perform public.create_system_notification(
    p_student_id,
    'Laporan Belajar Bulanan Siap',
    format('Laporan evaluasi belajar bulan %s/%s telah berhasil diperbarui.', p_month, p_year),
    'report',
    '/student/reports'
  );

  return v_report_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- 3. STATE MACHINE TRANSITION GUARDS
-- -----------------------------------------------------------------------------

-- Payment State Transition Guard
create or replace function public.guard_payment_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Terminal states cannot regress
  if old.status in ('paid', 'refunded', 'cancelled') and new.status in ('pending', 'awaiting_payment', 'awaiting_verification') then
    raise exception 'Transisi status pembayaran tidak sah: % -> %.', old.status, new.status using errcode = '22023';
  end if;

  if old.status = 'paid' and new.status not in ('paid', 'refunded', 'partially_refunded') then
    raise exception 'Pembayaran yang sudah lunas tidak dapat diubah ke status %.', new.status using errcode = '22023';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_payment_status on public.payments;
create trigger trg_guard_payment_status
  before update of status on public.payments
  for each row execute function public.guard_payment_status_transition();

-- Booking State Transition Guard
create or replace function public.guard_booking_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Completed / Cancelled bookings cannot revert to pending or confirmed
  if old.status in ('completed', 'cancelled', 'rejected') and new.status in ('pending', 'confirmed') then
    raise exception 'Sesi bimbingan yang telah selesai atau dibatalkan tidak dapat diaktifkan kembali.' using errcode = '22023';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_booking_status on public.bookings;
create trigger trg_guard_booking_status
  before update of status on public.bookings
  for each row execute function public.guard_booking_status_transition();

-- -----------------------------------------------------------------------------
-- 4. PERFORMANCE & FOREIGN KEY QUERY INDEX AUDIT
-- -----------------------------------------------------------------------------
create index if not exists idx_bookings_student_status
  on public.bookings(student_id, status);

create index if not exists idx_bookings_tutor_status
  on public.bookings(tutor_id, status);

create index if not exists idx_payments_student_status
  on public.payments(student_id, status);

create index if not exists idx_payments_tutor_status
  on public.payments(tutor_id, status);

create index if not exists idx_payments_awaiting_verification
  on public.payments(status) where status = 'awaiting_verification';

create index if not exists idx_reviews_tutor_status
  on public.reviews(tutor_id, status);

create index if not exists idx_learning_sessions_student
  on public.learning_sessions(student_id, started_at desc);

create index if not exists idx_learning_sessions_tutor
  on public.learning_sessions(tutor_id, started_at desc);

create index if not exists idx_audit_logs_actor_created
  on public.audit_logs(actor_user_id, created_at desc);

create index if not exists idx_student_learning_paths_student
  on public.student_learning_paths(student_id, status);

-- -----------------------------------------------------------------------------
-- 5. FUNCTION PRIVILEGES & LEAST PRIVILEGE GRANTS
-- -----------------------------------------------------------------------------
revoke execute on function public.mark_notification_read(uuid) from public, anon;
revoke execute on function public.mark_all_notifications_read() from public, anon;
revoke execute on function public.create_system_notification(uuid, text, text, text, text) from public, anon, authenticated;
revoke execute on function public.generate_monthly_learning_report(uuid, integer, integer) from public, anon;

grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;
grant execute on function public.generate_monthly_learning_report(uuid, integer, integer) to authenticated;

grant select, update on table public.notifications to authenticated;
grant select on table public.monthly_learning_reports to authenticated;
