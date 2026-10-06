-- =============================================================================
-- LAITS EDU TECH — CLEANUP AKUN DEMO & PEMBUATAN AKUN MEGA ADMIN
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
-- LANGKAH 2: BUAT FUNGSI RPC admin_create_tutor
-- (Memungkinkan Mega Admin membuat akun Tutor langsung dari Dashboard Web)
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

  -- 4. Masukkan ke auth.users (email langsung dikonfirmasi)
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

  -- 6. User roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_new_user_id, 'tutor')
  ON CONFLICT (user_id) DO UPDATE SET role = 'tutor';

  -- 7. Profil tutor marketplace
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

  -- 8. Hubungkan ke mata pelajaran jika dipilih
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
-- LANGKAH 3: BUAT AKUN MEGA ADMIN (SUPER ADMIN) BARU
-- =============================================================================
-- Ganti nilai di bawah ini dengan Email, Password, dan Nama yang Anda inginkan:
-- =============================================================================
DO $$
DECLARE
  -- >>> UBAH DATA DI BAWAH INI SESUAI KEINGINAN ANDA <<<
  v_admin_email    TEXT := 'megaadmin@laitsedutech.com';  -- Ganti dengan email Anda
  v_admin_password TEXT := 'MegaAdmin2026!';             -- Ganti dengan password kuat Anda
  v_admin_name     TEXT := 'Mega Administrator';         -- Ganti dengan nama Anda
  -- >>> -------------------------------------------- <<<

  v_admin_id   UUID := gen_random_uuid();
  v_admin_hash TEXT;
BEGIN
  -- Cek jika akun dengan email ini sudah ada sebelumnya
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
    -- Jika sudah ada, update password dan konfirmasi
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

  -- Pastikan user_roles berstatus 'super_admin'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_admin_id, 'super_admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';

  RAISE NOTICE 'Akun Mega Admin berhasil dibuat: %', v_admin_email;
END $$;
