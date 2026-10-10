-- =============================================================================
-- LAITS EDU TECH — CLEANUP AKUN DEMO & PEMBUATAN AKUN MEGA ADMIN (WILDAN)
-- =============================================================================
-- Jalankan skrip ini langsung di Supabase Dashboard -> SQL Editor
-- (https://supabase.com/dashboard/project/_/sql)
-- =============================================================================

-- =============================================================================
-- LANGKAH 1: HAPUS SEMUA AKUN UJI COBA / DEMO SEED
-- =============================================================================
DO $$
BEGIN
  -- Hapus semua akun demo yang berakhiran @laits.edu dari auth.users
  -- (Penghapusan ini akan cascade ke profiles, tutor_profiles, student_profiles, dll)
  DELETE FROM auth.users 
  WHERE email IN (
    'fauzan.student@laits.edu',
    'aisyah.student@laits.edu',
    'rizky.student@laits.edu',
    'nabila.student@laits.edu',
    'budi.student@laits.edu',
    'farhan.tutor@laits.edu',
    'sarah.tutor@laits.edu',
    'hendra.tutor@laits.edu',
    'admin@laits.edu'
  ) OR email LIKE '%@laits.edu';

  RAISE NOTICE 'Semua akun uji coba demo telah berhasil dibersihkan.';
END $$;


-- =============================================================================
-- LANGKAH 2: BUAT FUNGSI PEMBUATAN AKUN TUTOR (admin_create_tutor)
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
  -- 1. Verifikasi hak akses: hanya admin dan super_admin
  v_caller_role := public.current_user_role();
  IF v_caller_role IS NULL OR v_caller_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Akses ditolak. Hanya administrator yang dapat mendaftarkan akun tutor.' USING errcode = '42501';
  END IF;

  -- 2. Validasi input
  IF p_email IS NULL OR trim(p_email) = '' OR p_password IS NULL OR length(p_password) < 6 THEN
    RAISE EXCEPTION 'Email dan password valid (minimal 6 karakter) diperlukan.' USING errcode = '22023';
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE email = lower(trim(p_email))) THEN
    RAISE EXCEPTION 'Email % sudah terdaftar di sistem.', p_email USING errcode = '23505';
  END IF;

  -- 3. Enkripsi password
  v_hash := extensions.crypt(p_password, extensions.gen_salt('bf', 10));

  -- 4. Masukkan ke auth.users (email langsung dikonfirmasi, kolom string wajib diisi string kosong untuk GoTrue)
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
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    phone,
    phone_change,
    phone_change_token,
    email_change_token_current,
    reauthentication_token,
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
    '',
    '',
    '',
    '',
    nullif(trim(p_phone), ''),
    '',
    '',
    '',
    '',
    now(),
    now()
  );

  -- 4b. Daftarkan ke auth.identities (Krusial untuk Supabase GoTrue agar bisa login email)
  INSERT INTO auth.identities (
    provider_id,
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    v_new_user_id::text,
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
  );

  -- 5. Profil utama role 'tutor'
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

  -- 6. Profil tutor marketplace
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

  -- 7. Hubungkan ke mata pelajaran jika dipilih
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


-- =============================================================================
-- LANGKAH 3: BUAT AKUN MEGA ADMIN (wildanuye22@gmail.com)
-- =============================================================================
DO $$
DECLARE
  v_admin_email    TEXT := 'wildanuye22@gmail.com';
  v_admin_password TEXT := 'Kakapro453@';
  v_admin_name     TEXT := 'Mega Admin Wildan';

  v_admin_id   UUID;
  v_admin_hash TEXT;
BEGIN
  SELECT id INTO v_admin_id FROM auth.users WHERE email = lower(trim(v_admin_email));
  v_admin_hash := extensions.crypt(v_admin_password, extensions.gen_salt('bf', 10));

  IF v_admin_id IS NULL THEN
    v_admin_id := gen_random_uuid();
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
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      lower(trim(v_admin_email)),
      v_admin_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_admin_name),
      'authenticated',
      'authenticated',
      now(),
      now()
    );
  ELSE
    -- Jika akun sudah pernah terdaftar, perbarui password & konfirmasi email
    UPDATE auth.users
    SET encrypted_password = v_admin_hash,
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_user_meta_data = jsonb_build_object('full_name', v_admin_name),
        updated_at = now()
    WHERE id = v_admin_id;
  END IF;

  -- Pastikan profil berstatus 'super_admin'
  INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
  VALUES (v_admin_id, v_admin_name, lower(trim(v_admin_email)), 'super_admin', now(), now())
  ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    full_name = excluded.full_name,
    email = excluded.email;

  RAISE NOTICE 'Akun Mega Admin berhasil dibuat/diaktifkan: %', v_admin_email;
END $$;


-- =============================================================================
-- LANGKAH 4: PERBAIKI / SINKRONKAN AKUN AUTH (FERGUS HARYAWAN & USER LAINNYA)
-- =============================================================================
-- Memperbaiki kolom string NULL pada auth.users yang menyebabkan error 500 "Database error querying schema" pada GoTrue,
-- dan memastikan rekaman auth.identities sinkron.
DO $$
BEGIN
  -- 1. Bersihkan kolom token/string NULL pada auth.users (JANGAN sentuh kolom phone karena memiliki UNIQUE constraint)
  UPDATE auth.users
  SET 
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    reauthentication_token = COALESCE(reauthentication_token, '')
  WHERE confirmation_token IS NULL
     OR recovery_token IS NULL
     OR email_change_token_new IS NULL
     OR email_change IS NULL
     OR phone_change IS NULL
     OR phone_change_token IS NULL
     OR email_change_token_current IS NULL
     OR reauthentication_token IS NULL;

  -- 2. Sinkronkan auth.identities
  INSERT INTO auth.identities (
    provider_id,
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  SELECT 
    u.id::text,
    u.id,
    u.id,
    jsonb_build_object(
      'sub', u.id::text,
      'email', u.email,
      'email_verified', true,
      'full_name', coalesce(u.raw_user_meta_data->>'full_name', '')
    ),
    'email',
    now(),
    now(),
    now()
  FROM auth.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.identities i WHERE i.user_id = u.id
  );

  RAISE NOTICE 'Semua akun auth dan identitas berhasil diperbaiki dan disinkronkan.';
END $$;


-- =============================================================================
-- LANGKAH 5: IZINKAN SISWA MEMBACA PROFIL TUTOR (KATALOG TUTOR PRIVAT)
-- =============================================================================
DROP POLICY IF EXISTS "profiles: read own or admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles: read own, admin, or tutor" ON public.profiles;

CREATE POLICY "profiles: read own, admin, or tutor"
  ON public.profiles FOR SELECT
  TO authenticated, anon
  USING (
    id = (select auth.uid())
    OR (select public.is_admin())
    OR role = 'tutor'
  );

