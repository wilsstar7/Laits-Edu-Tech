-- =============================================================================
-- LAITS EDU TECH — DATABASE SEED (DEVELOPMENT / DEMO ONLY)
-- =============================================================================
-- WARNING: This seed is for local development and test environments only.
-- NEVER execute these demo user seeds in production.
-- Password for all demo accounts: Password123!
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CATALOG: SUBJECTS (General & Religious)
-- -----------------------------------------------------------------------------
insert into public.subjects (id, name, category, description, is_active)
values
  -- General Subjects
  ('00000000-0000-0000-0000-000000000101', 'Matematika', 'general', 'Matematika Dasar, Aljabar, Geometri, dan Kalkulus untuk SD hingga SMA.', true),
  ('00000000-0000-0000-0000-000000000102', 'Bahasa Inggris', 'general', 'Grammar, vocabulary, speaking conversation, dan persiapan ujian bahasa inggris.', true),
  ('00000000-0000-0000-0000-000000000103', 'Fisika', 'general', 'Konsep mekanika, gelombang, optik, listrik magnet, dan fisika modern.', true),
  ('00000000-0000-0000-0000-000000000104', 'Kimia', 'general', 'Struktur atom, stoikiometri, larutan asam-basa, ikatan kimia, dan kimia organik.', true),
  ('00000000-0000-0000-0000-000000000105', 'Biologi', 'general', 'Sains biologi, anatomi tumbuhan dan hewan, genetika, serta ekosistem alam.', true),

  -- Religious Subjects
  ('00000000-0000-0000-0000-000000000201', 'Al-Qur''an & Tajwid', 'religious', 'Kaidah membaca Al-Qur''an secara tartil dengan kaidah makharijul huruf yang tepat.', true),
  ('00000000-0000-0000-0000-000000000202', 'Tahfidz', 'religious', 'Program bimbingan setoran hafalan Al-Qur''an intensif dan mutqin.', true),
  ('00000000-0000-0000-0000-000000000203', 'Hadits', 'religious', 'Pemahaman hadits-hadits pilihan (Arba''in Nawawiyah) dan akhlak islami.', true),
  ('00000000-0000-0000-0000-000000000204', 'Fiqih', 'religious', 'Kaidah fiqih ibadah harian, thaharah, shalat, puasa, dan muamalah dasar.', true),
  ('00000000-0000-0000-0000-000000000205', 'Bahasa Arab', 'religious', 'Kaidah tata bahasa Nahwu, Shorof, dan percakapan bahasa Arab dasar.', true)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  is_active = excluded.is_active;

-- -----------------------------------------------------------------------------
-- 2. DEMO USERS (auth.users)
--    Uses standard Supabase auth schema with bcrypt hash of 'Password123!'
-- -----------------------------------------------------------------------------
do $$
declare
  v_hash text := extensions.crypt('Password123!', extensions.gen_salt('bf', 10));
begin

  -- Demo Student 1: Ahmad Fauzan
  insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
  values (
    'a1000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'fauzan.student@laits.edu',
    v_hash,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ahmad Fauzan","date_of_birth":"2008-04-12","grade":"10","school":"SMA Negeri 1 Jakarta","city":"Jakarta Selatan"}',
    'authenticated',
    'authenticated',
    now(),
    now()
  ) on conflict (id) do nothing;

  -- Demo Student 2: Siti Aisyah
  insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
  values (
    'a1000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'aisyah.student@laits.edu',
    v_hash,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Siti Aisyah","date_of_birth":"2009-08-25","grade":"9","school":"SMP Islam Terpadu Nurul Fikri","city":"Depok"}',
    'authenticated',
    'authenticated',
    now(),
    now()
  ) on conflict (id) do nothing;

  -- Demo Student 3: Rizky Pratama
  insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
  values (
    'a1000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'rizky.student@laits.edu',
    v_hash,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Rizky Pratama","date_of_birth":"2007-11-03","grade":"11","school":"SMA Negeri 8 Jakarta","city":"Jakarta Timur"}',
    'authenticated',
    'authenticated',
    now(),
    now()
  ) on conflict (id) do nothing;

  -- Demo Student 4: Nabila Zahra
  insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
  values (
    'a1000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000004',
    'nabila.student@laits.edu',
    v_hash,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Nabila Zahra","date_of_birth":"2008-02-18","grade":"10","school":"SMA Labschool Kebayoran","city":"Jakarta Selatan"}',
    'authenticated',
    'authenticated',
    now(),
    now()
  ) on conflict (id) do nothing;

  -- Demo Student 5: Budi Santoso
  insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
  values (
    'a1000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    ' ',
    v_hash,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Budi Santoso","date_of_birth":"2010-06-30","grade":"8","school":"SMP Negeri 115 Jakarta","city":"Jakarta Selatan"}',
    'authenticated',
    'authenticated',
    now(),
    now()
  ) on conflict (id) do nothing;

  -- Demo Tutor 1: Ust. Dr. Farhan Hakim
  insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
  values (
    'b1000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'farhan.tutor@laits.edu',
    v_hash,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ust. Dr. Farhan Hakim, M.Pd"}',
    'authenticated',
    'authenticated',
    now(),
    now()
  ) on conflict (id) do nothing;

  -- Demo Tutor 2: Sarah Amanda, S.Si
  insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
  values (
    'b1000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'sarah.tutor@laits.edu',
    v_hash,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sarah Amanda, S.Si"}',
    'authenticated',
    'authenticated',
    now(),
    now()
  ) on conflict (id) do nothing;

  -- Demo Tutor 3: Hendra Wijaya, M.Sc
  insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
  values (
    'b1000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'hendra.tutor@laits.edu',
    v_hash,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Hendra Wijaya, M.Sc"}',
    'authenticated',
    'authenticated',
    now(),
    now()
  ) on conflict (id) do nothing;

  -- Demo Admin: Administrator
  insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at)
  values (
    'c1000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'admin@laits.edu',
    v_hash,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Super Administrator Laits"}',
    'authenticated',
    'authenticated',
    now(),
    now()
  ) on conflict (id) do nothing;

end $$;

-- -----------------------------------------------------------------------------
-- 3. PROFILES (DEMO DATA)
-- -----------------------------------------------------------------------------
insert into public.profiles (id, full_name, email, role, phone)
values
  ('a1000000-0000-0000-0000-000000000001', 'Ahmad Fauzan', 'fauzan.student@laits.edu', 'student', '081234567801'),
  ('a1000000-0000-0000-0000-000000000002', 'Siti Aisyah', 'aisyah.student@laits.edu', 'student', '081234567802'),
  ('a1000000-0000-0000-0000-000000000003', 'Rizky Pratama', 'rizky.student@laits.edu', 'student', '081234567803'),
  ('a1000000-0000-0000-0000-000000000004', 'Nabila Zahra', 'nabila.student@laits.edu', 'student', '081234567804'),
  ('a1000000-0000-0000-0000-000000000005', 'Budi Santoso', 'budi.student@laits.edu', 'student', '081234567805'),
  ('b1000000-0000-0000-0000-000000000001', 'Ust. Dr. Farhan Hakim, M.Pd', 'farhan.tutor@laits.edu', 'tutor', '081198765401'),
  ('b1000000-0000-0000-0000-000000000002', 'Sarah Amanda, S.Si', 'sarah.tutor@laits.edu', 'tutor', '081198765402'),
  ('b1000000-0000-0000-0000-000000000003', 'Hendra Wijaya, M.Sc', 'hendra.tutor@laits.edu', 'tutor', '081198765403'),
  ('c1000000-0000-0000-0000-000000000001', 'Super Administrator Laits', 'admin@laits.edu', 'super_admin', '081100000001')
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  phone = excluded.phone;

-- -----------------------------------------------------------------------------
-- 4. STUDENT PROFILES (DEMO DATA)
-- -----------------------------------------------------------------------------
insert into public.student_profiles (user_id, date_of_birth, gender, school, grade, city, parent_name, parent_phone)
values
  ('a1000000-0000-0000-0000-000000000001', '2008-04-12', 'male', 'SMA Negeri 1 Jakarta', '10', 'Jakarta Selatan', 'Bapak Suryono', '081211112201'),
  ('a1000000-0000-0000-0000-000000000002', '2009-08-25', 'female', 'SMP Islam Terpadu Nurul Fikri', '9', 'Depok', 'Ibu Rahmawati', '081211112202'),
  ('a1000000-0000-0000-0000-000000000003', '2007-11-03', 'male', 'SMA Negeri 8 Jakarta', '11', 'Jakarta Timur', 'Bapak Gunawan', '081211112203'),
  ('a1000000-0000-0000-0000-000000000004', '2008-02-18', 'female', 'SMA Labschool Kebayoran', '10', 'Jakarta Selatan', 'Ibu Kartika', '081211112204'),
  ('a1000000-0000-0000-0000-000000000005', '2010-06-30', 'male', 'SMP Negeri 115 Jakarta', '8', 'Jakarta Selatan', 'Bapak Danu', '081211112205')
on conflict (user_id) do update set
  date_of_birth = excluded.date_of_birth,
  gender = excluded.gender,
  school = excluded.school,
  grade = excluded.grade,
  city = excluded.city,
  parent_name = excluded.parent_name,
  parent_phone = excluded.parent_phone;

-- -----------------------------------------------------------------------------
-- 5. TUTOR PROFILES (DEMO DATA)
-- -----------------------------------------------------------------------------
insert into public.tutor_profiles (user_id, bio, phone, education_background, experience, teaching_style, hourly_rate, rating)
values
  (
    'b1000000-0000-0000-0000-000000000001',
    'Pengajar berpengalaman studi Islam, Al-Qur''an tartil bersanad, dan Bahasa Arab dengan pengalaman lebih dari 10 tahun.',
    '081198765401',
    'S3 Pendidikan Islam UIN Syarif Hidayatullah Jakarta',
    'Dosen Ilmu Tarbiyah dan Instruktur Tahsin Al-Qur''an',
    'Pendekatan sabar, talaqqi interaktif, dan fokus pada makharijul huruf',
    150000.00,
    4.95
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    'Spesialis pengajar Matematika & Fisika persiapan UTBK SNBT dan olimpiade sains.',
    '081198765402',
    'S1 Matematika Universitas Indonesia',
    '5 tahun tutor privat olimpiade & bimbel ternama Jakarta',
    'Metode visualisasi konsep, logika deduktif, dan latihan soal berbasis variasi',
    125000.00,
    4.88
  ),
  (
    'b1000000-0000-0000-0000-000000000003',
    'Master Kimia & Sains dengan fokus pengajaran adaptif dan aplikatif untuk pemahaman mendalam.',
    '081198765403',
    'S2 Kimia Institut Teknologi Bandung (ITB)',
    '7 tahun pengajar IPA dan tutor kurikulum Cambridge & Merdeka',
    'Problem-based learning, eksperimen konseptual sederhana, dan diskusi aktif',
    140000.00,
    4.90
  )
on conflict (user_id) do update set
  bio = excluded.bio,
  phone = excluded.phone,
  education_background = excluded.education_background,
  experience = excluded.experience,
  teaching_style = excluded.teaching_style,
  hourly_rate = excluded.hourly_rate;
