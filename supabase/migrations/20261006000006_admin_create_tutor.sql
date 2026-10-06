-- =============================================================================
-- Migration: 20261006000006_admin_create_tutor.sql
-- Description: RPC function for Mega Admin to securely register and initialize Tutor accounts.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.admin_create_tutor(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_phone TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_hourly_rate NUMERIC DEFAULT 100000.00,
  p_education TEXT DEFAULT NULL,
  p_subject_ids UUID[] DEFAULT '{}'::UUID[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
DECLARE
  v_caller_role public.user_role;
  v_new_user_id UUID := gen_random_uuid();
  v_hash TEXT;
  v_sub_id UUID;
  v_tutor_profile_id UUID;
BEGIN
  -- 1. Check authorization: only admin and super_admin
  v_caller_role := public.current_user_role();
  IF v_caller_role IS NULL OR v_caller_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Akses ditolak. Hanya administrator yang dapat mendaftarkan akun tutor.' USING errcode = '42501';
  END IF;

  -- 2. Validate input
  IF p_email IS NULL OR trim(p_email) = '' OR p_password IS NULL OR length(p_password) < 6 THEN
    RAISE EXCEPTION 'Email dan password valid (minimal 6 karakter) diperlukan.' USING errcode = '22023';
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE email = lower(trim(p_email))) THEN
    RAISE EXCEPTION 'Email % sudah terdaftar di sistem.', p_email USING errcode = '23505';
  END IF;

  -- 3. Hash password using pgcrypto blowfish
  v_hash := extensions.crypt(p_password, extensions.gen_salt('bf', 10));

  -- 4. Insert into auth.users (email pre-confirmed)
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    role,
    aud,
    created_at,
    updated_at
  )
  VALUES (
    v_new_user_id,
    '00000000-0000-0000-0000-000000000000',
    lower(trim(p_email)),
    v_hash,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name),
    'authenticated',
    'authenticated',
    now(),
    now()
  );

  -- 4b. Insert into auth.identities (Required by Supabase GoTrue for email login)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  SELECT
    v_new_user_id,
    v_new_user_id,
    jsonb_build_object(
      'sub', v_new_user_id::text,
      'email', lower(trim(p_email)),
      'email_verified', true,
      'full_name', p_full_name
    ),
    'email',
    now(),
    now(),
    now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities WHERE user_id = v_new_user_id
  );

  -- 5. Upsert into public.profiles
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    phone,
    created_at,
    updated_at
  )
  VALUES (
    v_new_user_id,
    p_full_name,
    lower(trim(p_email)),
    'tutor',
    p_phone,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'tutor',
    full_name = excluded.full_name,
    phone = excluded.phone;


  -- 7. Upsert into public.tutor_profiles
  INSERT INTO public.tutor_profiles (
    user_id,
    bio,
    phone,
    education_background,
    hourly_rate,
    is_verified,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    v_new_user_id,
    coalesce(p_bio, 'Tutor resmi Laits Edu Tech.'),
    p_phone,
    p_education,
    coalesce(p_hourly_rate, 100000.00),
    true,
    true,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    bio = coalesce(excluded.bio, tutor_profiles.bio),
    phone = coalesce(excluded.phone, tutor_profiles.phone),
    education_background = coalesce(excluded.education_background, tutor_profiles.education_background),
    hourly_rate = coalesce(excluded.hourly_rate, tutor_profiles.hourly_rate),
    is_verified = true,
    is_active = true
  RETURNING id INTO v_tutor_profile_id;

  -- 8. Link subjects if provided
  IF p_subject_ids IS NOT NULL AND array_length(p_subject_ids, 1) > 0 THEN
    FOREACH v_sub_id IN ARRAY p_subject_ids
    LOOP
      INSERT INTO public.tutor_subjects (tutor_id, subject_id)
      VALUES (v_tutor_profile_id, v_sub_id)
      ON CONFLICT (tutor_id, subject_id) DO NOTHING;
    END LOOP;
  END IF;

  RETURN v_new_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_tutor TO authenticated;
