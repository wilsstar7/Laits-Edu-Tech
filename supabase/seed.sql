-- =============================================================================
-- LAITS EDU TECH — DATABASE SEED & CATALOG
-- =============================================================================
-- Master data catalog for production and development.
-- Does NOT include demo/trial test accounts.
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
