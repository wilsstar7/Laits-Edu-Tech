begin;

create table public.private_tutoring_settings (
  id boolean primary key default true check (id),
  rate_per_session integer not null check (rate_per_session between 1 and 1000000000),
  bank_name text not null check (char_length(trim(bank_name)) between 1 and 100),
  account_number text not null check (account_number ~ '^[0-9]{4,34}$'),
  account_holder text not null check (char_length(trim(account_holder)) between 1 and 100)
);

alter table public.private_tutoring_settings enable row level security;
revoke all on public.private_tutoring_settings from public, anon, authenticated;
grant select, update on public.private_tutoring_settings to authenticated;

create policy private_tutoring_settings_read
  on public.private_tutoring_settings for select to authenticated
  using ((select public.current_user_role()) = 'student' or (select public.is_admin()));

create policy private_tutoring_settings_update
  on public.private_tutoring_settings for update to authenticated
  using ((select public.is_super_admin()))
  with check ((select public.is_super_admin()));

insert into public.private_tutoring_settings (rate_per_session, bank_name, account_number, account_holder)
values (100000, 'Bank Syariah Indonesia (BSI)', '7148992011', 'Yayasan Zeinbox Indonesia');

alter table public.payments
  alter column booking_id drop not null,
  alter column tutor_id drop not null,
  add column monthly_session_count integer check (monthly_session_count between 1 and 31),
  add column monthly_session_rate integer check (monthly_session_rate > 0),
  add column requested_tutor_name text check (char_length(requested_tutor_name) <= 100),
  add column assigned_tutor_id uuid references public.tutor_profiles(id) on delete set null,
  add column transfer_bank_name text,
  add column transfer_account_number text,
  add column transfer_account_holder text,
  add column monthly_request_id uuid,
  add constraint payments_monthly_request_unique unique (student_id, monthly_request_id),
  add constraint payments_program_shape check (
    (booking_id is not null and tutor_id is not null and monthly_session_count is null)
    or
    (booking_id is null and tutor_id is null and monthly_session_count is not null
      and monthly_session_rate is not null and monthly_request_id is not null
      and transfer_bank_name is not null and transfer_account_number is not null
      and transfer_account_holder is not null
      and amount = monthly_session_count::bigint * monthly_session_rate)
  );

alter table public.invoices alter column booking_id drop not null;

create index payments_paid_monthly_assignment_idx
  on public.payments (assigned_tutor_id nulls first, created_at desc, id)
  where monthly_session_count is not null and status = 'paid';

-- Preserve booking history and status RPCs while retiring student-created bookings.
revoke execute on function public.create_booking(uuid, uuid, timestamptz, timestamptz, text, text)
  from public, anon, authenticated;
drop policy if exists bookings_insert_own_student on public.bookings;
drop policy if exists bookings_update_party on public.bookings;

-- Proofs are submitted through the existing state transition RPC.
drop policy if exists proofs_student_insert on public.payment_proofs;

create function public.create_monthly_tutoring_payment(
  p_session_count integer,
  p_requested_tutor_name text,
  p_request_id uuid,
  p_expected_rate integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student uuid := auth.uid();
  v_settings public.private_tutoring_settings%rowtype;
  v_payment uuid;
  v_amount bigint;
  v_due timestamptz := now() + interval '24 hours';
begin
  if v_student is null or public.current_user_role() is distinct from 'student'::public.user_role then
    raise exception 'Hanya siswa yang dapat membuat tagihan.' using errcode = '42501';
  end if;

  if p_session_count is null or p_session_count not between 1 and 31
    or p_request_id is null or char_length(trim(p_requested_tutor_name)) > 100 then
    raise exception 'Masukkan 1 sampai 31 sesi dan nama tutor maksimal 100 karakter.' using errcode = '22023';
  end if;

  select id into v_payment from public.payments
  where student_id = v_student and monthly_request_id = p_request_id;
  if found then return v_payment; end if;

  select * into strict v_settings from public.private_tutoring_settings where id;
  if p_expected_rate is distinct from v_settings.rate_per_session then
    raise exception 'Tarif telah berubah. Muat ulang halaman dan periksa total tagihan.' using errcode = '22023';
  end if;
  v_amount := p_session_count::bigint * v_settings.rate_per_session;

  insert into public.payments (
    student_id, amount, expires_at, monthly_session_count, monthly_session_rate,
    requested_tutor_name, transfer_bank_name, transfer_account_number,
    transfer_account_holder, monthly_request_id
  ) values (
    v_student, v_amount, v_due, p_session_count, v_settings.rate_per_session,
    nullif(trim(p_requested_tutor_name), ''), v_settings.bank_name, v_settings.account_number,
    v_settings.account_holder, p_request_id
  ) on conflict (student_id, monthly_request_id) do nothing returning id into v_payment;

  if v_payment is null then
    select id into strict v_payment from public.payments
    where student_id = v_student and monthly_request_id = p_request_id;
    return v_payment;
  end if;

  insert into public.invoices (payment_id, invoice_number, student_id, subtotal, total, due_at)
  values (v_payment, 'INV-BLN-' || upper(replace(v_payment::text, '-', '')), v_student, v_amount, v_amount, v_due);

  insert into public.payment_events (payment_id, event_type, source)
  values (v_payment, 'payment_created', 'student');

  return v_payment;
end;
$$;

create function public.assign_monthly_tutor(p_payment_id uuid, p_tutor_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat menetapkan tutor.' using errcode = '42501';
  end if;

  perform 1 from public.tutor_profiles where id = p_tutor_id and is_active for share;
  if not found then
    raise exception 'Tutor aktif tidak ditemukan.' using errcode = '22023';
  end if;

  update public.payments set assigned_tutor_id = p_tutor_id
  where id = p_payment_id and monthly_session_count is not null and status = 'paid';
  if not found then
    raise exception 'Tutor hanya dapat ditetapkan untuk tagihan bulanan yang lunas.' using errcode = '22023';
  end if;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'payment.tutor_assigned', 'payment', p_payment_id::text,
          jsonb_build_object('tutor_id', p_tutor_id));
end;
$$;

alter function public.admin_verify_payment(uuid, text, text) rename to verify_booking_payment;
revoke execute on function public.verify_booking_payment(uuid, text, text) from public, anon, authenticated;

create function public.admin_verify_payment(
  p_payment_id uuid, p_decision text, p_rejection_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.payments%rowtype;
begin
  if not public.is_super_admin() then
    raise exception 'Hanya Super Admin yang dapat memverifikasi pembayaran.' using errcode = '42501';
  end if;

  select * into v_payment from public.payments where id = p_payment_id for update;
  if not found or v_payment.status <> 'awaiting_verification' then
    raise exception 'Tagihan tidak sedang menunggu verifikasi.' using errcode = '22023';
  end if;

  if v_payment.monthly_session_count is null then
    perform public.verify_booking_payment(p_payment_id, p_decision, p_rejection_reason);
    return;
  end if;

  if p_decision is null or p_decision not in ('approve', 'reject') then
    raise exception 'Keputusan verifikasi tidak valid.' using errcode = '22023';
  end if;

  if p_decision = 'approve' then
    update public.payments set status = 'paid', paid_at = now() where id = p_payment_id;
    update public.invoices set status = 'paid' where payment_id = p_payment_id;
  else
    update public.payments set status = 'failed', failed_at = now() where id = p_payment_id;
  end if;

  update public.payment_proofs
  set status = case when p_decision = 'approve' then 'approved' else 'rejected' end,
      verified_at = now(), verified_by = auth.uid(),
      rejection_reason = case when p_decision = 'reject'
        then coalesce(nullif(trim(p_rejection_reason), ''), 'Bukti pembayaran tidak valid atau tidak sesuai.')
        else null end
  where payment_id = p_payment_id and status = 'pending';

  insert into public.payment_events (payment_id, event_type, source)
  values (p_payment_id, case when p_decision = 'approve' then 'payment_approved' else 'payment_rejected' end, 'admin');
end;
$$;

alter function public.submit_payment_proof(uuid, text, text, text, bigint) rename to record_payment_proof;
revoke execute on function public.record_payment_proof(uuid, text, text, text, bigint) from public, anon, authenticated;

create function public.submit_payment_proof(
  p_payment_id uuid, p_file_path text, p_original_file_name text, p_mime_type text, p_file_size bigint
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.payments%rowtype;
begin
  select * into v_payment from public.payments where id = p_payment_id for update;
  if not found or auth.uid() is distinct from v_payment.student_id then
    raise exception 'Tagihan tidak ditemukan.' using errcode = '42501';
  end if;
  if v_payment.status not in ('awaiting_payment', 'failed') then
    raise exception 'Tagihan tidak menerima bukti pembayaran.' using errcode = '22023';
  end if;
  return public.record_payment_proof(p_payment_id, p_file_path, p_original_file_name, p_mime_type, p_file_size);
end;
$$;

revoke execute on function public.create_monthly_tutoring_payment(integer, text, uuid, integer),
  public.assign_monthly_tutor(uuid, uuid), public.admin_verify_payment(uuid, text, text),
  public.submit_payment_proof(uuid, text, text, text, bigint) from public, anon;
grant execute on function public.create_monthly_tutoring_payment(integer, text, uuid, integer),
  public.assign_monthly_tutor(uuid, uuid), public.admin_verify_payment(uuid, text, text),
  public.submit_payment_proof(uuid, text, text, text, bigint) to authenticated;

commit;
