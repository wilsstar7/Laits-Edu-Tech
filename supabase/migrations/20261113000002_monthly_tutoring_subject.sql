begin;

alter table public.payments
  add column monthly_subject_name text check (
    monthly_subject_name is null or
    (monthly_session_count is not null and char_length(monthly_subject_name) between 1 and 100)
  );

drop function public.create_monthly_tutoring_payment(integer, text, uuid, integer);

create function public.create_monthly_tutoring_payment(
  p_session_count integer,
  p_requested_tutor_name text,
  p_request_id uuid,
  p_expected_rate integer,
  p_subject_id uuid
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
  v_subject_name text;
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

  select name into v_subject_name
  from public.subjects
  where id = p_subject_id and is_active
  for share;
  if not found then
    raise exception 'Pilih mata pelajaran yang masih aktif.' using errcode = '22023';
  end if;

  select * into strict v_settings from public.private_tutoring_settings where id;
  if p_expected_rate is distinct from v_settings.rate_per_session then
    raise exception 'Tarif telah berubah. Muat ulang halaman dan periksa total tagihan.' using errcode = '22023';
  end if;
  v_amount := p_session_count::bigint * v_settings.rate_per_session;

  insert into public.payments (
    student_id, amount, expires_at, monthly_session_count, monthly_session_rate,
    requested_tutor_name, transfer_bank_name, transfer_account_number,
    transfer_account_holder, monthly_request_id, monthly_subject_name
  ) values (
    v_student, v_amount, v_due, p_session_count, v_settings.rate_per_session,
    nullif(trim(p_requested_tutor_name), ''), v_settings.bank_name, v_settings.account_number,
    v_settings.account_holder, p_request_id, v_subject_name
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

revoke execute on function public.create_monthly_tutoring_payment(integer, text, uuid, integer, uuid)
  from public, anon;
grant execute on function public.create_monthly_tutoring_payment(integer, text, uuid, integer, uuid)
  to authenticated;

commit;
