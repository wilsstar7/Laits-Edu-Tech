-- =============================================================================
-- Migration: 20261006000003_phase5_payment_reviews_progress.sql
-- Description: LMS Phase 5 — Payment, Invoices, Payment Proofs, Reviews,
--              Student Learning Progress, Learning Sessions, Audit Logs,
--              and Marketplace Hardening.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Bookings Financial Snapshot Extension
-- -----------------------------------------------------------------------------
alter table public.bookings
  add column if not exists agreed_hourly_rate bigint check (agreed_hourly_rate is null or agreed_hourly_rate >= 0),
  add column if not exists total_amount bigint check (total_amount is null or total_amount >= 0);

-- Update create_booking RPC to snapshot agreed_hourly_rate and calculate total_amount atomically
create or replace function public.create_booking(
  p_tutor_id         uuid,
  p_subject_id       uuid,
  p_scheduled_start  timestamptz,
  p_scheduled_end    timestamptz,
  p_timezone         text default 'Asia/Jakarta',
  p_student_note     text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id        uuid;
  v_student_role      public.user_role;
  v_tutor             public.tutor_profiles%rowtype;
  v_subject_active    boolean;
  v_teaches_subject   boolean;
  v_duration_min      integer;
  v_day_of_week       integer;
  v_start_time        time;
  v_end_time          time;
  v_avail_matches     boolean;
  v_overlap_count     integer;
  v_booking_id        uuid;
  v_hourly_rate       bigint;
  v_total_amount      bigint;
begin
  -- 1. Authentication check
  v_student_id := auth.uid();
  if v_student_id is null then
    raise exception 'Autentikasi diperlukan untuk melakukan pemesanan.' using errcode = '42501';
  end if;

  -- 2. Role validation (only students and admins can book tutors)
  select role into v_student_role
  from public.profiles
  where id = v_student_id;

  if v_student_role not in ('student', 'admin', 'super_admin') then
    raise exception 'Hanya siswa yang dapat melakukan pemesanan sesi bimbingan.' using errcode = '42501';
  end if;

  -- 3. Verify tutor exists and is active
  select * into v_tutor
  from public.tutor_profiles
  where id = p_tutor_id;

  if v_tutor.id is null or not v_tutor.is_active then
    raise exception 'Tutor tidak ditemukan atau sedang tidak aktif.' using errcode = 'P0002';
  end if;

  -- Students cannot book themselves if they are also registered as tutors
  if v_tutor.user_id = v_student_id then
    raise exception 'Anda tidak dapat memesan sesi bimbingan dengan diri Anda sendiri.' using errcode = '22023';
  end if;

  -- 4. Verify subject exists and is active
  select is_active into v_subject_active
  from public.subjects
  where id = p_subject_id;

  if v_subject_active is null or not v_subject_active then
    raise exception 'Mata pelajaran tidak valid atau sedang dinonaktifkan.' using errcode = '22023';
  end if;

  -- 5. Verify tutor teaches this subject
  select exists (
    select 1 from public.tutor_subjects
    where tutor_id = p_tutor_id and subject_id = p_subject_id
  ) into v_teaches_subject;

  if not v_teaches_subject then
    raise exception 'Tutor tidak mengajar mata pelajaran yang dipilih.' using errcode = '22023';
  end if;

  -- 6. Validate start/end time
  if p_scheduled_start is null or p_scheduled_end is null then
    raise exception 'Waktu mulai dan selesai wajib diisi.' using errcode = '22023';
  end if;

  if p_scheduled_start <= now() then
    raise exception 'Jadwal bimbingan harus di masa mendatang.' using errcode = '22023';
  end if;

  if p_scheduled_end <= p_scheduled_start then
    raise exception 'Waktu selesai harus lebih besar dari waktu mulai.' using errcode = '22023';
  end if;

  v_duration_min := round(extract(epoch from (p_scheduled_end - p_scheduled_start)) / 60)::integer;
  if v_duration_min not in (30, 45, 60, 90, 120) then
    raise exception 'Durasi bimbingan harus 30, 45, 60, 90, atau 120 menit.' using errcode = '22023';
  end if;

  -- 7. Verify tutor availability slot covers this window
  v_day_of_week := extract(isodow from (p_scheduled_start at time zone coalesce(p_timezone, 'Asia/Jakarta')))::integer % 7;
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

  -- Calculate financial snapshot values
  v_hourly_rate := coalesce(round(v_tutor.hourly_rate), 0);
  v_total_amount := round((v_hourly_rate * v_duration_min) / 60.0);

  -- 9. Atomic insertion with price snapshot
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
    student_note,
    agreed_hourly_rate,
    total_amount
  ) values (
    v_booking_id,
    v_student_id,
    p_tutor_id,
    p_subject_id,
    p_scheduled_start,
    p_scheduled_end,
    coalesce(p_timezone, 'Asia/Jakarta'),
    'pending',
    nullif(trim(p_student_note), ''),
    v_hourly_rate,
    v_total_amount
  );

  return v_booking_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2. Payments Table
-- -----------------------------------------------------------------------------
create table if not exists public.payments (
  id                        uuid primary key default gen_random_uuid(),
  booking_id                uuid not null references public.bookings(id) on delete restrict,
  student_id                uuid not null references public.profiles(id) on delete cascade,
  tutor_id                  uuid not null references public.tutor_profiles(id) on delete cascade,
  amount                    bigint not null check (amount >= 0),
  currency                  text not null default 'IDR',
  payment_method            text not null default 'manual_transfer' check (payment_method in ('manual_transfer', 'payment_gateway')),
  provider                  text not null default 'manual',
  provider_transaction_id   text,
  status                    text not null default 'awaiting_payment' check (status in ('pending', 'awaiting_payment', 'awaiting_verification', 'paid', 'failed', 'expired', 'cancelled', 'refunded', 'partially_refunded')),
  expires_at                timestamptz not null,
  paid_at                   timestamptz,
  failed_at                 timestamptz,
  cancelled_at              timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. Payment Proofs Table
-- -----------------------------------------------------------------------------
create table if not exists public.payment_proofs (
  id                  uuid primary key default gen_random_uuid(),
  payment_id          uuid not null references public.payments(id) on delete cascade,
  student_id          uuid not null references public.profiles(id) on delete cascade,
  file_path           text not null,
  original_file_name  text not null,
  mime_type           text not null check (mime_type in ('image/jpeg', 'image/png', 'application/pdf')),
  file_size           bigint not null check (file_size > 0 and file_size <= 5242880),
  uploaded_at         timestamptz not null default now(),
  verified_at         timestamptz,
  verified_by         uuid references public.profiles(id),
  rejection_reason    text check (rejection_reason is null or char_length(rejection_reason) <= 500),
  status              text not null default 'pending' check (status in ('pending', 'approved', 'rejected'))
);

-- -----------------------------------------------------------------------------
-- 4. Invoices Table
-- -----------------------------------------------------------------------------
create table if not exists public.invoices (
  id              uuid primary key default gen_random_uuid(),
  payment_id      uuid not null unique references public.payments(id) on delete cascade,
  invoice_number  text not null unique,
  student_id      uuid not null references public.profiles(id) on delete cascade,
  booking_id      uuid not null references public.bookings(id) on delete restrict,
  subtotal        bigint not null check (subtotal >= 0),
  discount        bigint not null default 0 check (discount >= 0),
  total           bigint not null check (total >= 0),
  currency        text not null default 'IDR',
  status          text not null default 'issued' check (status in ('issued', 'paid', 'cancelled', 'refunded')),
  issued_at       timestamptz not null default now(),
  due_at          timestamptz not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_invoices_updated_at on public.invoices;
create trigger trg_invoices_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 5. Payment Events (Audit Log for Payments)
-- -----------------------------------------------------------------------------
create table if not exists public.payment_events (
  id            uuid primary key default gen_random_uuid(),
  payment_id    uuid not null references public.payments(id) on delete cascade,
  event_type    text not null check (event_type in ('payment_created', 'payment_proof_uploaded', 'payment_approved', 'payment_rejected', 'payment_expired', 'payment_failed', 'payment_refunded', 'payment_cancelled')),
  source        text not null default 'system',
  payload_hash  text,
  created_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 6. Reviews Table
-- -----------------------------------------------------------------------------
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid not null unique references public.bookings(id) on delete cascade,
  student_id    uuid not null references public.profiles(id) on delete cascade,
  tutor_id      uuid not null references public.tutor_profiles(id) on delete cascade,
  rating        integer not null check (rating >= 1 and rating <= 5),
  review_text   text check (review_text is null or char_length(review_text) <= 1000),
  status        text not null default 'published' check (status in ('published', 'hidden', 'flagged')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 7. Student Learning Paths (Enrolled Curriculum)
-- -----------------------------------------------------------------------------
create table if not exists public.student_learning_paths (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references public.profiles(id) on delete cascade,
  learning_path_id    uuid not null references public.learning_paths(id) on delete cascade,
  status              text not null default 'in_progress' check (status in ('not_started', 'in_progress', 'completed', 'paused')),
  started_at          timestamptz not null default now(),
  completed_at        timestamptz,
  progress_percentage integer not null default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(student_id, learning_path_id)
);

drop trigger if exists trg_slp_updated_at on public.student_learning_paths;
create trigger trg_slp_updated_at
  before update on public.student_learning_paths
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 8. Learning Path Progress (Subject-level Progress)
-- -----------------------------------------------------------------------------
create table if not exists public.learning_path_progress (
  id                        uuid primary key default gen_random_uuid(),
  student_learning_path_id  uuid not null references public.student_learning_paths(id) on delete cascade,
  subject_id                uuid not null references public.subjects(id) on delete cascade,
  status                    text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  progress_percentage       integer not null default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
  started_at                timestamptz,
  completed_at              timestamptz,
  updated_at                timestamptz not null default now(),
  unique(student_learning_path_id, subject_id)
);

-- -----------------------------------------------------------------------------
-- 9. Learning Sessions (Coordinated with confirmed Bookings)
-- -----------------------------------------------------------------------------
create table if not exists public.learning_sessions (
  id                uuid primary key default gen_random_uuid(),
  booking_id        uuid not null unique references public.bookings(id) on delete cascade,
  student_id        uuid not null references public.profiles(id) on delete cascade,
  tutor_id          uuid not null references public.tutor_profiles(id) on delete cascade,
  subject_id        uuid not null references public.subjects(id) on delete restrict,
  started_at        timestamptz not null,
  ended_at          timestamptz not null,
  duration_minutes  integer not null check (duration_minutes > 0),
  student_notes     text check (student_notes is null or char_length(student_notes) <= 2000),
  tutor_notes       text check (tutor_notes is null or char_length(tutor_notes) <= 2000),
  status            text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

drop trigger if exists trg_learning_sessions_updated_at on public.learning_sessions;
create trigger trg_learning_sessions_updated_at
  before update on public.learning_sessions
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 10. Audit Logs
-- -----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id              uuid primary key default gen_random_uuid(),
  actor_user_id   uuid references public.profiles(id),
  action          text not null,
  entity_type     text not null,
  entity_id       text not null,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 11. Performance Indexes
-- -----------------------------------------------------------------------------
create index if not exists idx_payments_booking on public.payments(booking_id);
create index if not exists idx_payments_student on public.payments(student_id);
create index if not exists idx_payments_tutor on public.payments(tutor_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_created on public.payments(created_at desc);

create index if not exists idx_payment_proofs_payment on public.payment_proofs(payment_id);
create index if not exists idx_payment_proofs_student on public.payment_proofs(student_id);
create index if not exists idx_payment_proofs_status on public.payment_proofs(status);

create index if not exists idx_invoices_payment on public.invoices(payment_id);
create index if not exists idx_invoices_number on public.invoices(invoice_number);
create index if not exists idx_invoices_student on public.invoices(student_id);

create index if not exists idx_reviews_booking on public.reviews(booking_id);
create index if not exists idx_reviews_tutor on public.reviews(tutor_id, status);
create index if not exists idx_reviews_student on public.reviews(student_id);

create index if not exists idx_slp_student on public.student_learning_paths(student_id, status);
create index if not exists idx_slp_path on public.student_learning_paths(learning_path_id);

create index if not exists idx_lpp_slp on public.learning_path_progress(student_learning_path_id);
create index if not exists idx_lpp_subject on public.learning_path_progress(subject_id);

create index if not exists idx_ls_booking on public.learning_sessions(booking_id);
create index if not exists idx_ls_student on public.learning_sessions(student_id, status);
create index if not exists idx_ls_tutor on public.learning_sessions(tutor_id, status);

create index if not exists idx_audit_actor on public.audit_logs(actor_user_id);
create index if not exists idx_audit_entity on public.audit_logs(entity_type, entity_id);
create index if not exists idx_audit_created on public.audit_logs(created_at desc);

-- -----------------------------------------------------------------------------
-- 12. Tutor Rating Aggregation Trigger
-- -----------------------------------------------------------------------------
create or replace function public.sync_tutor_rating_stats()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_target_tutor_id  uuid;
  v_avg_rating       numeric(3, 2);
  v_total_count      integer;
begin
  if (tg_op = 'DELETE') then
    v_target_tutor_id := old.tutor_id;
  else
    v_target_tutor_id := new.tutor_id;
  end if;

  select
    coalesce(round(avg(rating)::numeric, 2), 0.00),
    count(*)::integer
  into v_avg_rating, v_total_count
  from public.reviews
  where tutor_id = v_target_tutor_id
    and status = 'published';

  -- Update tutor_profiles bypass standard client protections via security definer
  update public.tutor_profiles
  set
    rating = v_avg_rating,
    total_reviews = v_total_count
  where id = v_target_tutor_id;

  return null;
end;
$$;

drop trigger if exists trg_sync_tutor_rating on public.reviews;
create trigger trg_sync_tutor_rating
  after insert or update or delete on public.reviews
  for each row execute function public.sync_tutor_rating_stats();

-- -----------------------------------------------------------------------------
-- 13. Row Level Security Policies
-- -----------------------------------------------------------------------------
alter table public.payments enable row level security;
alter table public.payment_proofs enable row level security;
alter table public.invoices enable row level security;
alter table public.payment_events enable row level security;
alter table public.reviews enable row level security;
alter table public.student_learning_paths enable row level security;
alter table public.learning_path_progress enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.audit_logs enable row level security;

-- Payments:
-- Students can read their own payments.
-- Tutors can read payment metadata (id, booking_id, amount, status, paid_at) for bookings assigned to them.
-- Admins have full access.
drop policy if exists "payments_read_access" on public.payments;
create policy "payments_read_access"
  on public.payments for select
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.tutor_profiles tp
      where tp.id = payments.tutor_id and tp.user_id = auth.uid()
    )
    or (select public.is_admin())
  );

-- Payment Proofs:
-- Students can only access and insert their own payment proofs.
-- Admins can access and update verification.
-- Tutors CANNOT access payment proofs.
drop policy if exists "proofs_student_access" on public.payment_proofs;
create policy "proofs_student_access"
  on public.payment_proofs for select
  using (student_id = auth.uid() or (select public.is_admin()));

drop policy if exists "proofs_student_insert" on public.payment_proofs;
create policy "proofs_student_insert"
  on public.payment_proofs for insert
  with check (student_id = auth.uid());

drop policy if exists "proofs_admin_update" on public.payment_proofs;
create policy "proofs_admin_update"
  on public.payment_proofs for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Invoices:
-- Students read their own invoices; Admins read all; Tutors no access.
drop policy if exists "invoices_read_access" on public.invoices;
create policy "invoices_read_access"
  on public.invoices for select
  using (student_id = auth.uid() or (select public.is_admin()));

-- Payment Events:
-- Students read events for their payments; Admins read all.
drop policy if exists "payment_events_read" on public.payment_events;
create policy "payment_events_read"
  on public.payment_events for select
  using (
    exists (
      select 1 from public.payments p
      where p.id = payment_events.payment_id and p.student_id = auth.uid()
    )
    or (select public.is_admin())
  );

-- Reviews:
-- Authenticated users can view published reviews.
-- Students can view their own reviews (even if hidden).
-- Tutors can view reviews addressed to them.
-- Admins can manage all.
drop policy if exists "reviews_select" on public.reviews;
create policy "reviews_select"
  on public.reviews for select
  using (
    status = 'published'
    or student_id = auth.uid()
    or exists (
      select 1 from public.tutor_profiles tp
      where tp.id = reviews.tutor_id and tp.user_id = auth.uid()
    )
    or (select public.is_admin())
  );

drop policy if exists "reviews_insert_student" on public.reviews;
create policy "reviews_insert_student"
  on public.reviews for insert
  with check (student_id = auth.uid());

drop policy if exists "reviews_admin_manage" on public.reviews;
create policy "reviews_admin_manage"
  on public.reviews for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Student Learning Paths:
-- Students can read and insert their own learning path enrollments.
drop policy if exists "slp_student_select" on public.student_learning_paths;
create policy "slp_student_select"
  on public.student_learning_paths for select
  using (student_id = auth.uid() or (select public.is_admin()));

drop policy if exists "slp_student_insert" on public.student_learning_paths;
create policy "slp_student_insert"
  on public.student_learning_paths for insert
  with check (student_id = auth.uid());

drop policy if exists "slp_student_update" on public.student_learning_paths;
create policy "slp_student_update"
  on public.student_learning_paths for update
  using (student_id = auth.uid() or (select public.is_admin()))
  with check (student_id = auth.uid() or (select public.is_admin()));

-- Learning Path Progress:
-- Students can view and update their own progress.
drop policy if exists "lpp_student_select" on public.learning_path_progress;
create policy "lpp_student_select"
  on public.learning_path_progress for select
  using (
    exists (
      select 1 from public.student_learning_paths slp
      where slp.id = learning_path_progress.student_learning_path_id
        and (slp.student_id = auth.uid() or (select public.is_admin()))
    )
  );

drop policy if exists "lpp_student_update" on public.learning_path_progress;
create policy "lpp_student_update"
  on public.learning_path_progress for update
  using (
    exists (
      select 1 from public.student_learning_paths slp
      where slp.id = learning_path_progress.student_learning_path_id
        and (slp.student_id = auth.uid() or (select public.is_admin()))
    )
  );

-- Learning Sessions:
-- Students and tutors can view sessions they participate in.
drop policy if exists "sessions_read" on public.learning_sessions;
create policy "sessions_read"
  on public.learning_sessions for select
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.tutor_profiles tp
      where tp.id = learning_sessions.tutor_id and tp.user_id = auth.uid()
    )
    or (select public.is_admin())
  );

-- Audit Logs:
-- Admin read only.
drop policy if exists "audit_logs_admin_read" on public.audit_logs;
create policy "audit_logs_admin_read"
  on public.audit_logs for select
  using ((select public.is_admin()));

-- -----------------------------------------------------------------------------
-- 14. Private Storage Bucket Setup: payment-proofs
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'application/pdf'];

-- Storage RLS on storage.objects for payment-proofs:
drop policy if exists "proofs_storage_student_upload" on storage.objects;
create policy "proofs_storage_student_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "proofs_storage_read" on storage.objects;
create policy "proofs_storage_read"
  on storage.objects for select
  using (
    bucket_id = 'payment-proofs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (select public.is_admin())
    )
  );

-- -----------------------------------------------------------------------------
-- 15. RPC Functions: Payment Lifecycle & Marketplace Hardening
-- -----------------------------------------------------------------------------

-- A. Create Payment & Invoice
create or replace function public.create_payment(
  p_booking_id      uuid,
  p_payment_method  text default 'manual_transfer'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id      uuid;
  v_booking         public.bookings%rowtype;
  v_existing_id     uuid;
  v_existing_status text;
  v_existing_expire timestamptz;
  v_payment_id      uuid;
  v_invoice_number  text;
  v_amount          bigint;
  v_expires_at      timestamptz;
begin
  v_student_id := auth.uid();
  if v_student_id is null then
    raise exception 'Autentikasi diperlukan.' using errcode = '42501';
  end if;

  select * into v_booking
  from public.bookings
  where id = p_booking_id;

  if v_booking.id is null then
    raise exception 'Data pemesanan bimbingan tidak ditemukan.' using errcode = 'P0002';
  end if;

  if v_booking.student_id <> v_student_id and not (select public.is_admin()) then
    raise exception 'Anda tidak memiliki hak akses untuk pemesanan ini.' using errcode = '42501';
  end if;

  if v_booking.status <> 'pending' then
    raise exception 'Pembayaran hanya dapat dibuat untuk pemesanan dengan status pending.' using errcode = '22023';
  end if;

  -- Check if an active unexpired payment already exists
  select id, status, expires_at into v_existing_id, v_existing_status, v_existing_expire
  from public.payments
  where booking_id = p_booking_id
    and status in ('pending', 'awaiting_payment', 'awaiting_verification', 'paid')
  order by created_at desc
  limit 1;

  if v_existing_id is not null then
    if v_existing_status = 'paid' then
      raise exception 'Pemesanan ini sudah terbayar.' using errcode = '23505';
    end if;

    if v_existing_expire > now() then
      -- Return existing active payment attempt
      return v_existing_id;
    else
      -- Mark expired
      update public.payments
      set status = 'expired'
      where id = v_existing_id;
    end if;
  end if;

  -- Amount MUST be calculated by server from booking snapshot or duration * tutor rate
  v_amount := coalesce(v_booking.total_amount, 0);
  if v_amount <= 0 then
    -- Fallback calculation if not stored
    declare
      v_duration_min integer;
      v_tutor_rate   bigint;
    begin
      v_duration_min := round(extract(epoch from (v_booking.scheduled_end - v_booking.scheduled_start)) / 60)::integer;
      select coalesce(round(hourly_rate), 0) into v_tutor_rate
      from public.tutor_profiles
      where id = v_booking.tutor_id;
      v_amount := round((v_tutor_rate * v_duration_min) / 60.0);
    end;
  end if;

  v_payment_id := gen_random_uuid();
  v_expires_at := now() + interval '24 hours';

  -- Generate sequential invoice number: INV-YYYYMMDD-XXXXXX
  v_invoice_number := 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(replace(v_payment_id::text, '-', '') from 1 for 6));

  -- Insert payment
  insert into public.payments (
    id,
    booking_id,
    student_id,
    tutor_id,
    amount,
    currency,
    payment_method,
    provider,
    status,
    expires_at
  ) values (
    v_payment_id,
    v_booking.id,
    v_booking.student_id,
    v_booking.tutor_id,
    v_amount,
    'IDR',
    coalesce(p_payment_method, 'manual_transfer'),
    'manual',
    'awaiting_payment',
    v_expires_at
  );

  -- Insert invoice
  insert into public.invoices (
    payment_id,
    invoice_number,
    student_id,
    booking_id,
    subtotal,
    discount,
    total,
    currency,
    status,
    issued_at,
    due_at
  ) values (
    v_payment_id,
    v_invoice_number,
    v_booking.student_id,
    v_booking.id,
    v_amount,
    0,
    v_amount,
    'IDR',
    'issued',
    now(),
    v_expires_at
  );

  -- Log payment event
  insert into public.payment_events (payment_id, event_type, source)
  values (v_payment_id, 'payment_created', 'system');

  -- Log audit
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  values (
    v_student_id,
    'payment.created',
    'payment',
    v_payment_id::text,
    jsonb_build_object('booking_id', v_booking.id, 'amount', v_amount, 'invoice_number', v_invoice_number)
  );

  return v_payment_id;
end;
$$;

-- B. Submit Payment Proof
create or replace function public.submit_payment_proof(
  p_payment_id          uuid,
  p_file_path           text,
  p_original_file_name  text,
  p_mime_type           text,
  p_file_size           bigint
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id  uuid;
  v_payment     public.payments%rowtype;
  v_proof_id    uuid;
begin
  v_student_id := auth.uid();
  if v_student_id is null then
    raise exception 'Autentikasi diperlukan.' using errcode = '42501';
  end if;

  select * into v_payment
  from public.payments
  where id = p_payment_id;

  if v_payment.id is null then
    raise exception 'Data pembayaran tidak ditemukan.' using errcode = 'P0002';
  end if;

  if v_payment.student_id <> v_student_id and not (select public.is_admin()) then
    raise exception 'Anda tidak memiliki hak akses atas pembayaran ini.' using errcode = '42501';
  end if;

  if v_payment.status in ('paid', 'cancelled') then
    raise exception 'Pembayaran sudah selesai atau dibatalkan.' using errcode = '22023';
  end if;

  if v_payment.expires_at <= now() then
    update public.payments set status = 'expired' where id = p_payment_id;
    raise exception 'Waktu pembayaran telah kedaluwarsa. Silakan lakukan pemesanan ulang.' using errcode = '22023';
  end if;

  v_proof_id := gen_random_uuid();

  insert into public.payment_proofs (
    id,
    payment_id,
    student_id,
    file_path,
    original_file_name,
    mime_type,
    file_size,
    status
  ) values (
    v_proof_id,
    p_payment_id,
    v_student_id,
    p_file_path,
    p_original_file_name,
    p_mime_type,
    p_file_size,
    'pending'
  );

  -- Transition payment status to awaiting_verification
  update public.payments
  set status = 'awaiting_verification'
  where id = p_payment_id;

  -- Log event & audit
  insert into public.payment_events (payment_id, event_type, source)
  values (p_payment_id, 'payment_proof_uploaded', 'student');

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  values (
    v_student_id,
    'payment_proof.uploaded',
    'payment_proof',
    v_proof_id::text,
    jsonb_build_object('payment_id', p_payment_id, 'file_name', p_original_file_name)
  );

  return v_proof_id;
end;
$$;

-- C. Admin Verify Payment (Approve or Reject)
create or replace function public.admin_verify_payment(
  p_payment_id        uuid,
  p_decision          text, -- 'approve' or 'reject'
  p_rejection_reason  text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id      uuid;
  v_payment       public.payments%rowtype;
  v_booking       public.bookings%rowtype;
  v_duration_min  integer;
begin
  v_admin_id := auth.uid();
  if v_admin_id is null or not (select public.is_admin()) then
    raise exception 'Hanya administrator yang dapat memverifikasi pembayaran.' using errcode = '42501';
  end if;

  select * into v_payment
  from public.payments
  where id = p_payment_id;

  if v_payment.id is null then
    raise exception 'Data pembayaran tidak ditemukan.' using errcode = 'P0002';
  end if;

  select * into v_booking
  from public.bookings
  where id = v_payment.booking_id;

  if p_decision = 'approve' then
    -- Transactional update:
    -- 1. Payment status = paid
    update public.payments
    set
      status = 'paid',
      paid_at = now()
    where id = p_payment_id;

    -- 2. Invoice status = paid
    update public.invoices
    set status = 'paid'
    where payment_id = p_payment_id;

    -- 3. Proof status = approved
    update public.payment_proofs
    set
      status = 'approved',
      verified_at = now(),
      verified_by = v_admin_id
    where payment_id = p_payment_id and status = 'pending';

    -- 4. Booking status = confirmed
    update public.bookings
    set
      status = 'confirmed',
      updated_at = now()
    where id = v_payment.booking_id;

    -- 5. Create or sync learning_sessions record
    v_duration_min := round(extract(epoch from (v_booking.scheduled_end - v_booking.scheduled_start)) / 60)::integer;

    insert into public.learning_sessions (
      booking_id,
      student_id,
      tutor_id,
      subject_id,
      started_at,
      ended_at,
      duration_minutes,
      status
    ) values (
      v_booking.id,
      v_booking.student_id,
      v_booking.tutor_id,
      v_booking.subject_id,
      v_booking.scheduled_start,
      v_booking.scheduled_end,
      v_duration_min,
      'scheduled'
    )
    on conflict (booking_id) do update set
      status = 'scheduled';

    -- Log payment event & audit
    insert into public.payment_events (payment_id, event_type, source)
    values (p_payment_id, 'payment_approved', 'admin');

    insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
    values (
      v_admin_id,
      'payment.approved',
      'payment',
      p_payment_id::text,
      jsonb_build_object('booking_id', v_booking.id)
    );

  elsif p_decision = 'reject' then
    -- 1. Payment status = failed
    update public.payments
    set
      status = 'failed',
      failed_at = now()
    where id = p_payment_id;

    -- 2. Proof status = rejected
    update public.payment_proofs
    set
      status = 'rejected',
      verified_at = now(),
      verified_by = v_admin_id,
      rejection_reason = coalesce(p_rejection_reason, 'Bukti pembayaran tidak valid atau tidak sesuai.')
    where payment_id = p_payment_id;

    -- Log event & audit
    insert into public.payment_events (payment_id, event_type, source)
    values (p_payment_id, 'payment_rejected', 'admin');

    insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
    values (
      v_admin_id,
      'payment.rejected',
      'payment',
      p_payment_id::text,
      jsonb_build_object('reason', p_rejection_reason)
    );
  else
    raise exception 'Keputusan verifikasi tidak valid. Gunakan approve atau reject.' using errcode = '22023';
  end if;
end;
$$;

-- D. Complete Tutoring Session
create or replace function public.complete_tutoring_session(
  p_booking_id    uuid,
  p_tutor_notes   text default null,
  p_student_notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id     uuid;
  v_booking       public.bookings%rowtype;
  v_is_tutor      boolean;
  v_is_admin      boolean;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Autentikasi diperlukan.' using errcode = '42501';
  end if;

  select * into v_booking
  from public.bookings
  where id = p_booking_id;

  if v_booking.id is null then
    raise exception 'Sesi bimbingan tidak ditemukan.' using errcode = 'P0002';
  end if;

  select exists (
    select 1 from public.tutor_profiles tp
    where tp.id = v_booking.tutor_id and tp.user_id = v_caller_id
  ) into v_is_tutor;

  v_is_admin := (select public.is_admin());

  if not v_is_tutor and not v_is_admin then
    raise exception 'Hanya tutor dari sesi ini atau administrator yang dapat menandai sesi selesai.' using errcode = '42501';
  end if;

  if v_booking.status <> 'confirmed' then
    raise exception 'Hanya sesi yang sudah terkonfirmasi yang dapat diselesaikan.' using errcode = '22023';
  end if;

  -- Update booking
  update public.bookings
  set
    status = 'completed',
    tutor_note = coalesce(nullif(trim(p_tutor_notes), ''), tutor_note),
    updated_at = now()
  where id = p_booking_id;

  -- Update or insert learning session
  update public.learning_sessions
  set
    status = 'completed',
    tutor_notes = coalesce(nullif(trim(p_tutor_notes), ''), tutor_notes),
    student_notes = coalesce(nullif(trim(p_student_notes), ''), student_notes),
    updated_at = now()
  where booking_id = p_booking_id;

  -- Audit log
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  values (
    v_caller_id,
    'session.completed',
    'booking',
    p_booking_id::text,
    jsonb_build_object('student_id', v_booking.student_id, 'tutor_id', v_booking.tutor_id)
  );
end;
$$;

-- E. Submit Student Review
create or replace function public.submit_student_review(
  p_booking_id  uuid,
  p_rating      integer,
  p_review_text text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id      uuid;
  v_booking         public.bookings%rowtype;
  v_is_paid         boolean;
  v_review_id       uuid;
  v_clean_text      text;
begin
  v_student_id := auth.uid();
  if v_student_id is null then
    raise exception 'Autentikasi diperlukan.' using errcode = '42501';
  end if;

  -- Validation: Rating range 1-5
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'Rating harus bernilai antara 1 sampai 5 bintang.' using errcode = '22023';
  end if;

  select * into v_booking
  from public.bookings
  where id = p_booking_id;

  if v_booking.id is null then
    raise exception 'Data pemesanan tidak ditemukan.' using errcode = 'P0002';
  end if;

  if v_booking.student_id <> v_student_id then
    raise exception 'Anda hanya dapat memberikan ulasan untuk sesi belajar Anda sendiri.' using errcode = '42501';
  end if;

  if v_booking.status <> 'completed' then
    raise exception 'Ulasan hanya dapat diberikan setelah sesi belajar selesai dilaksanakan.' using errcode = '22023';
  end if;

  -- Verify payment is paid
  select exists (
    select 1 from public.payments
    where booking_id = p_booking_id and status = 'paid'
  ) into v_is_paid;

  if not v_is_paid then
    raise exception 'Ulasan hanya dapat diberikan untuk sesi yang telah lunas.' using errcode = '22023';
  end if;

  -- Verify no duplicate review exists
  if exists (select 1 from public.reviews where booking_id = p_booking_id) then
    raise exception 'Anda sudah memberikan ulasan untuk sesi bimbingan ini.' using errcode = '23505';
  end if;

  v_review_id := gen_random_uuid();
  v_clean_text := nullif(trim(p_review_text), '');

  insert into public.reviews (
    id,
    booking_id,
    student_id,
    tutor_id,
    rating,
    review_text,
    status
  ) values (
    v_review_id,
    p_booking_id,
    v_student_id,
    v_booking.tutor_id,
    p_rating,
    v_clean_text,
    'published'
  );

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  values (
    v_student_id,
    'review.submitted',
    'review',
    v_review_id::text,
    jsonb_build_object('tutor_id', v_booking.tutor_id, 'rating', p_rating)
  );

  return v_review_id;
end;
$$;

-- F. Enroll in Learning Path
create or replace function public.enroll_student_learning_path(
  p_learning_path_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id  uuid;
  v_enroll_id   uuid;
  v_path_active boolean;
  v_subj_rec    record;
begin
  v_student_id := auth.uid();
  if v_student_id is null then
    raise exception 'Autentikasi diperlukan.' using errcode = '42501';
  end if;

  select is_active into v_path_active
  from public.learning_paths
  where id = p_learning_path_id;

  if v_path_active is null or not v_path_active then
    raise exception 'Alur belajar tidak ditemukan atau tidak aktif.' using errcode = 'P0002';
  end if;

  -- Check existing enrollment
  select id into v_enroll_id
  from public.student_learning_paths
  where student_id = v_student_id and learning_path_id = p_learning_path_id;

  if v_enroll_id is not null then
    return v_enroll_id;
  end if;

  v_enroll_id := gen_random_uuid();

  insert into public.student_learning_paths (
    id,
    student_id,
    learning_path_id,
    status,
    progress_percentage
  ) values (
    v_enroll_id,
    v_student_id,
    p_learning_path_id,
    'in_progress',
    0
  );

  -- Initialize subject progress rows
  for v_subj_rec in (
    select subject_id from public.learning_path_subjects
    where learning_path_id = p_learning_path_id
    order by display_order asc
  ) loop
    insert into public.learning_path_progress (
      student_learning_path_id,
      subject_id,
      status,
      progress_percentage
    ) values (
      v_enroll_id,
      v_subj_rec.subject_id,
      'not_started',
      0
    )
    on conflict (student_learning_path_id, subject_id) do nothing;
  end loop;

  return v_enroll_id;
end;
$$;

-- G. Update Subject Learning Progress
create or replace function public.update_learning_subject_progress(
  p_student_learning_path_id  uuid,
  p_subject_id                uuid,
  p_progress_percentage       integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id    uuid;
  v_slp           public.student_learning_paths%rowtype;
  v_new_avg       integer;
  v_status        text;
begin
  v_student_id := auth.uid();
  if v_student_id is null then
    raise exception 'Autentikasi diperlukan.' using errcode = '42501';
  end if;

  select * into v_slp
  from public.student_learning_paths
  where id = p_student_learning_path_id;

  if v_slp.id is null then
    raise exception 'Enrollment tidak ditemukan.' using errcode = 'P0002';
  end if;

  if v_slp.student_id <> v_student_id and not (select public.is_admin()) then
    raise exception 'Akses ditolak.' using errcode = '42501';
  end if;

  if p_progress_percentage < 0 or p_progress_percentage > 100 then
    raise exception 'Persentase progres harus antara 0 dan 100.' using errcode = '22023';
  end if;

  v_status := case
    when p_progress_percentage = 100 then 'completed'
    when p_progress_percentage > 0 then 'in_progress'
    else 'not_started'
  end;

  update public.learning_path_progress
  set
    progress_percentage = p_progress_percentage,
    status = v_status,
    completed_at = case when p_progress_percentage = 100 then now() else null end,
    started_at = coalesce(started_at, now()),
    updated_at = now()
  where student_learning_path_id = p_student_learning_path_id
    and subject_id = p_subject_id;

  -- Recompute aggregate progress across subjects in this learning path
  select coalesce(round(avg(progress_percentage))::integer, 0)
  into v_new_avg
  from public.learning_path_progress
  where student_learning_path_id = p_student_learning_path_id;

  update public.student_learning_paths
  set
    progress_percentage = v_new_avg,
    status = case when v_new_avg = 100 then 'completed' else 'in_progress' end,
    completed_at = case when v_new_avg = 100 then now() else null end,
    updated_at = now()
  where id = p_student_learning_path_id;
end;
$$;
