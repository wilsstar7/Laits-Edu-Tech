-- =============================================================================
-- PHASE 2 : DEMO ASSESSMENT DATASET (CONFIGURABLE DATABASE-DRIVEN)
-- =============================================================================
-- Includes:
--   1. 1 Active Assessment: "Learning Personality Assessment"
--   2. 5 Dimensions: Extraversion, Openness, Conscientiousness, Agreeableness, Emotional Stability
--   3. 4 Personality Types: Explorer, Planner, Analyst, Connector
--   4. Rules for Personality Determination
--   5. 20 Educational Questions with 5-point Likert options (1-5)
-- =============================================================================

do $$
declare
  v_assessment_id uuid := '00000000-0000-0000-0000-00000000a001';

  v_dim_ext_id    uuid := '00000000-0000-0000-0000-00000000d001';
  v_dim_opn_id    uuid := '00000000-0000-0000-0000-00000000d002';
  v_dim_con_id    uuid := '00000000-0000-0000-0000-00000000d003';
  v_dim_agr_id    uuid := '00000000-0000-0000-0000-00000000d004';
  v_dim_emo_id    uuid := '00000000-0000-0000-0000-00000000d005';

  v_type_exp_id   uuid := '00000000-0000-0000-0000-00000000b001';
  v_type_pln_id   uuid := '00000000-0000-0000-0000-00000000b002';
  v_type_ana_id   uuid := '00000000-0000-0000-0000-00000000b003';
  v_type_con_id   uuid := '00000000-0000-0000-0000-00000000b004';

  v_q_id          uuid;
begin
  -- ---------------------------------------------------------------------------
  -- 1. Assessment
  -- ---------------------------------------------------------------------------
  insert into public.assessments (
    id, name, slug, description, instructions, estimated_minutes, is_active, version
  ) values (
    v_assessment_id,
    'Learning Personality Assessment',
    'learning-personality-demo',
    'Asesmen pemetaan gaya belajar dan preferensi interaksi siswa untuk mendukung bimbingan belajar personal.',
    'Pilihlah salah satu opsi jawaban yang paling mencerminkan kebiasaan belajar Anda sehari-hari secara jujur.',
    12,
    true,
    1
  ) on conflict (id) do update set
    name = excluded.name,
    description = excluded.description,
    instructions = excluded.instructions,
    is_active = excluded.is_active;

  -- ---------------------------------------------------------------------------
  -- 2. Dimensions
  -- ---------------------------------------------------------------------------
  insert into public.assessment_dimensions (id, assessment_id, name, code, description, display_order)
  values
    (v_dim_ext_id, v_assessment_id, 'Interaksi Sosial Belajar', 'EXTRAVERSION', 'Kecenderungan belajar melalui diskusi aktif dan interaksi verbal dibanding refleksi mandiri.', 1),
    (v_dim_opn_id, v_assessment_id, 'Eksplorasi Konseptual', 'OPENNESS', 'Rasa ingin tahu terhadap ide baru, variasi materi pelajaran, dan pendekatan kreatif.', 2),
    (v_dim_con_id, v_assessment_id, 'Keteraturan & Perencanaan', 'CONSCIENTIOUSNESS', 'Kedisiplinan dalam jadwal, keteraturan catatan, dan ketekunan menyelesaikan target belajar.', 3),
    (v_dim_agr_id, v_assessment_id, 'Kolaborasi & Resepsi Masukan', 'AGREEABLENESS', 'Kemudahan bekerja sama dengan pengajar dan keterbukaan menerima umpan balik evaluasi.', 4),
    (v_dim_emo_id, v_assessment_id, 'Ketenangan Menghadapi Tantangan', 'EMOTIONAL_STABILITY', 'Kemampuan menjaga fokus dan ketenangan saat menghadapi soal sulit atau persiapan ujian.', 5)
  on conflict (assessment_id, code) do update set
    name = excluded.name,
    description = excluded.description,
    display_order = excluded.display_order;

  -- ---------------------------------------------------------------------------
  -- 3. Personality Types
  -- ---------------------------------------------------------------------------
  -- Type 1: Explorer
  insert into public.personality_types (
    id, assessment_id, name, code, description, strengths, challenges,
    learning_style, communication_style, motivation,
    recommended_study_method, recommended_subjects, recommended_tutor_style
  ) values (
    v_type_exp_id,
    v_assessment_id,
    'Penjelajah Konseptual (Explorer)',
    'EXPLORER',
    'Profil belajar Anda mengindikasikan rasa ingin tahu intelektual yang tinggi dan antusiasme dalam mengeksplorasi sudut pandang baru saat mempelajari suatu topik.',
    '["Cepat memahami konsep abstrak dan analogi baru", "Kreatif dalam mencari cara alternatif memecahkan masalah", "Memiliki antusiasme tinggi pada materi wawasan luas"]'::jsonb,
    '["Terkadang cepat merasa jenuh jika materi terlalu monoton atau mekanis", "Perlu perhatian ekstra untuk latihan soal rutin yang repetitif"]'::jsonb,
    'Eksploratif dan Berbasis Masalah (Problem-Based Inquiry)',
    'Ekspresif, suka mengajukan pertanyaan mendalam, dan terbuka terhadap ide baru',
    'Termotivasi ketika memahami gambaran besar dan signifikansi materi di dunia nyata',
    '["Diskusi konsep interaktif", "Pemetaan materi dengan diagram mind map", "Eksperimen studi kasus aplikasi nyata"]'::jsonb,
    '["Fisika Konseptual", "Biologi & Ekosistem", "Bahasa Inggris Komunikatif", "Sejarah & Peradaban Islam"]'::jsonb,
    '["Tutor yang dinamis dan terbuka untuk berdiskusi", "Memberikan analogi aplikatif daripada sekadar hafalan rumus", "Memberi keleluasaan dalam eksplorasi metode penyelesaian soal"]'::jsonb
  ) on conflict (assessment_id, code) do update set
    name = excluded.name,
    description = excluded.description,
    strengths = excluded.strengths,
    challenges = excluded.challenges,
    learning_style = excluded.learning_style,
    communication_style = excluded.communication_style,
    motivation = excluded.motivation,
    recommended_study_method = excluded.recommended_study_method,
    recommended_subjects = excluded.recommended_subjects,
    recommended_tutor_style = excluded.recommended_tutor_style;

  -- Type 2: Planner
  insert into public.personality_types (
    id, assessment_id, name, code, description, strengths, challenges,
    learning_style, communication_style, motivation,
    recommended_study_method, recommended_subjects, recommended_tutor_style
  ) values (
    v_type_pln_id,
    v_assessment_id,
    'Perencana Terstruktur (Planner)',
    'PLANNER',
    'Profil belajar Anda mengindikasikan kecenderungan belajar yang rapi, sistematis, dan konsisten dengan target belajar yang terukur.',
    '["Sangat teratur dalam pencatatan dan manajemen waktu belajar", "Konsisten menuntaskan tugas sesuai jadwal yang ditetapkan", "Tekun dalam mengikuti langkah-langkah metodis"]'::jsonb,
    '["Memerlukan waktu adaptasi saat terjadi perubahan mendadak pada ritme belajar", "Perlu didorong untuk lebih berani mencoba jawaban yang belum pasti"]'::jsonb,
    'Sistematis, Bertahap, dan Berorientasi Target',
    'Terstruktur, menyukai instruksi yang jelas dan checklist capaian',
    'Termotivasi oleh progres yang terlihat nyata dan penyelesaian target berkala',
    '["Penyusunan jadwal belajar mingguan berjenjang", "Latihan soal bertahap dari level dasar ke tingkat mahir", "Pencatatan rangkuman dengan bullet poin rapi"]'::jsonb,
    '["Matematika Aljabar & Geometri", "Kimia Stoikiometri", "Kaidah Tajwid & Nahwu", "Akuntansi & Tata Bahasa"]'::jsonb,
    '["Tutor yang tertib jadwal dan menyiapkan silabus terarah", "Memberikan indikator keberhasilan materi yang konkret", "Rutin mengevaluasi checklist kemajuan belajar"]'::jsonb
  ) on conflict (assessment_id, code) do update set
    name = excluded.name,
    description = excluded.description,
    strengths = excluded.strengths,
    challenges = excluded.challenges,
    learning_style = excluded.learning_style,
    communication_style = excluded.communication_style,
    motivation = excluded.motivation,
    recommended_study_method = excluded.recommended_study_method,
    recommended_subjects = excluded.recommended_subjects,
    recommended_tutor_style = excluded.recommended_tutor_style;

  -- Type 3: Analyst
  insert into public.personality_types (
    id, assessment_id, name, code, description, strengths, challenges,
    learning_style, communication_style, motivation,
    recommended_study_method, recommended_subjects, recommended_tutor_style
  ) values (
    v_type_ana_id,
    v_assessment_id,
    'Pemikir Kritis (Analyst)',
    'ANALYST',
    'Profil belajar Anda mengindikasikan kecenderungan analisis yang tajam, teliti, dan mengutamakan pembuktian logis yang kuat pada setiap materi.',
    '["Fokus konsentrasi tinggi saat membedah soal rumit", "Kritis terhadap keakuratan data dan logika penalaran", "Mandiri dalam mengevaluasi kesalahan latihan"]'::jsonb,
    '["Cenderung terlalu lama merenungkan satu soal karena perfeksionisme", "Terkadang enggan bertanya sebelum merasa mencoba maksimal sendiri"]'::jsonb,
    'Analitis, Logis, dan Reflektif Mendalam',
    'Lugas, presisi, dan menghargai penjelasan berbasis logika objektif',
    'Termotivasi oleh kepuasan memecahkan teka-teki logika dan soal-soal tingkat olimpiade',
    '["Bedah soal analisis (HOTS) langkah demi langkah", "Verifikasi logika rumus mandiri sebelum aplikasi soal", "Sesi tanya jawab mendalam satu lawan satu"]'::jsonb,
    '["Matematika Kalkulus & Logika", "Fisika Mekanika", "Fiqih Perbandingan & Ushul Fiqih", "Logika Pemrograman"]'::jsonb,
    '["Tutor yang memiliki penguasaan materi konseptual yang sangat kuat", "Siap diajak berdiskusi hingga ke akar pembuktian rumus", "Menghargai kebutuhan siswa untuk berpikir mandiri sejenak"]'::jsonb
  ) on conflict (assessment_id, code) do update set
    name = excluded.name,
    description = excluded.description,
    strengths = excluded.strengths,
    challenges = excluded.challenges,
    learning_style = excluded.learning_style,
    communication_style = excluded.communication_style,
    motivation = excluded.motivation,
    recommended_study_method = excluded.recommended_study_method,
    recommended_subjects = excluded.recommended_subjects,
    recommended_tutor_style = excluded.recommended_tutor_style;

  -- Type 4: Connector
  insert into public.personality_types (
    id, assessment_id, name, code, description, strengths, challenges,
    learning_style, communication_style, motivation,
    recommended_study_method, recommended_subjects, recommended_tutor_style
  ) values (
    v_type_con_id,
    v_assessment_id,
    'Kolaborator Sosial (Connector)',
    'CONNECTOR',
    'Profil belajar Anda mengindikasikan antusiasme tinggi saat belajar dengan interaksi hangat, saling berbagi pemahaman, dan suasana yang mendukung.',
    '["Komunikatif dan tidak ragu menyampaikan kesulitan belajar", "Sangat reseptif terhadap masukan positif dari pembimbing", "Mampu menciptakan suasana belajar yang menyenangkan"]'::jsonb,
    '["Konsentrasi mudah teralihkan jika suasana belajar terlalu kaku atau sepi", "Membutuhkan dorongan apresiasi berkala agar tetap semangat"]'::jsonb,
    'Interaktif, Kooperatif, dan Dialogis',
    'Hangat, ramah, terbuka, dan interaktif secara verbal',
    'Termotivasi oleh hubungan suportif dengan pendidik dan pengakuan atas usaha belajar',
    '["Metode belajar mengajar dua arah (peer explanation)", "Pemanfaatan sesi kuis interaktif", "Refleksi belajar mingguan bersama tutor"]'::jsonb,
    '["Bahasa Arab & Bahasa Inggris Percakapan", "Tahfidz Bersanad & Talaqqi", "Ilmu Sosial & Komunikasi", "Sains Terapan"]'::jsonb,
    '["Tutor yang hangat, sabar, dan komunikatif", "Sering memberikan afirmasi serta umpan balik apresiatif", "Menyelingi materi berat dengan interaksi penyemangat"]'::jsonb
  ) on conflict (assessment_id, code) do update set
    name = excluded.name,
    description = excluded.description,
    strengths = excluded.strengths,
    challenges = excluded.challenges,
    learning_style = excluded.learning_style,
    communication_style = excluded.communication_style,
    motivation = excluded.motivation,
    recommended_study_method = excluded.recommended_study_method,
    recommended_subjects = excluded.recommended_subjects,
    recommended_tutor_style = excluded.recommended_tutor_style;

  -- ---------------------------------------------------------------------------
  -- 4. Personality Type Rules
  -- ---------------------------------------------------------------------------
  delete from public.personality_type_rules
  where personality_type_id in (v_type_exp_id, v_type_pln_id, v_type_ana_id, v_type_con_id);

  -- Rule 1: Explorer if Openness >= 65 and Extraversion >= 55 (Priority 40)
  insert into public.personality_type_rules (personality_type_id, dimension_id, operator, threshold_value, priority)
  values
    (v_type_exp_id, v_dim_opn_id, 'gte', 65, 40),
    (v_type_exp_id, v_dim_ext_id, 'gte', 55, 40);

  -- Rule 2: Analyst if Conscientiousness >= 65 and Extraversion <= 50 (Priority 30)
  insert into public.personality_type_rules (personality_type_id, dimension_id, operator, threshold_value, priority)
  values
    (v_type_ana_id, v_dim_con_id, 'gte', 65, 30),
    (v_type_ana_id, v_dim_ext_id, 'lte', 50, 30);

  -- Rule 3: Connector if Agreeableness >= 65 and Extraversion >= 60 (Priority 20)
  insert into public.personality_type_rules (personality_type_id, dimension_id, operator, threshold_value, priority)
  values
    (v_type_con_id, v_dim_agr_id, 'gte', 65, 20),
    (v_type_con_id, v_dim_ext_id, 'gte', 60, 20);

  -- Rule 4: Planner if Conscientiousness >= 60 (Priority 10)
  insert into public.personality_type_rules (personality_type_id, dimension_id, operator, threshold_value, priority)
  values
    (v_type_pln_id, v_dim_con_id, 'gte', 60, 10);

  -- ---------------------------------------------------------------------------
  -- 5. Questions & Options (20 Educational Items)
  -- ---------------------------------------------------------------------------
  delete from public.assessment_questions where assessment_id = v_assessment_id;

  -- DIMENSION 1: EXTRAVERSION (Q1 - Q4)
  -- Q1
  v_q_id := '00000000-0000-0000-0000-00000000c001';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_ext_id, 'Saya lebih mudah memahami materi baru ketika dapat mendiskusikannya secara langsung dengan tutor atau teman.', 1, 1, false);

  -- Q2 (Reverse)
  v_q_id := '00000000-0000-0000-0000-00000000c002';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_ext_id, 'Saya merasa lebih fokus belajar sendirian di ruangan hening tanpa banyak interaksi suara.', 2, 1, true);

  -- Q3
  v_q_id := '00000000-0000-0000-0000-00000000c003';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_ext_id, 'Saya terbiasa menjelaskan kembali poin materi dengan kata-kata sendiri untuk menguji pemahaman.', 3, 1, false);

  -- Q4
  v_q_id := '00000000-0000-0000-0000-00000000c004';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_ext_id, 'Saya merasa bersemangat dan aktif mengajukan pertanyaan saat ada materi pelajaran yang belum jelas.', 4, 1, false);

  -- DIMENSION 2: OPENNESS (Q5 - Q8)
  -- Q5
  v_q_id := '00000000-0000-0000-0000-00000000c005';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_opn_id, 'Saya senang mencari tahu latar belakang dan alasan mengapa suatu rumus atau dalil dirumuskan.', 5, 1, false);

  -- Q6
  v_q_id := '00000000-0000-0000-0000-00000000c006';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_opn_id, 'Saya suka mencoba berbagai metode berbeda untuk menyelesaikan satu soal latihan yang sama.', 6, 1, false);

  -- Q7 (Reverse)
  v_q_id := '00000000-0000-0000-0000-00000000c007';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_opn_id, 'Saya lebih nyaman mengikuti satu cara pengerjaan baku yang sudah terbukti dibanding mencari cara alternatif.', 7, 1, true);

  -- Q8
  v_q_id := '00000000-0000-0000-0000-00000000c008';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_opn_id, 'Saya menikmati materi pelajaran yang menghubungkan sains dengan fenomena nyata dalam kehidupan.', 8, 1, false);

  -- DIMENSION 3: CONSCIENTIOUSNESS (Q9 - Q12)
  -- Q9
  v_q_id := '00000000-0000-0000-0000-00000000c009';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_con_id, 'Saya biasanya mencatat jadwal target belajar dan berusaha menyelesaikannya tepat waktu.', 9, 1, false);

  -- Q10
  v_q_id := '00000000-0000-0000-0000-00000000c010';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_con_id, 'Buku catatan atau rangkuman materi pelajaran saya tersusun secara rapi dan runut.', 10, 1, false);

  -- Q11 (Reverse)
  v_q_id := '00000000-0000-0000-0000-00000000c011';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_con_id, 'Saya sering baru mulai belajar atau mengerjakan tugas ketika tenggat waktu sudah sangat dekat.', 11, 1, true);

  -- Q12
  v_q_id := '00000000-0000-0000-0000-00000000c012';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_con_id, 'Saya terbiasa memeriksa kembali jawaban latihan sebelum menganggap suatu materi telah tuntas dikuasai.', 12, 1, false);

  -- DIMENSION 4: AGREEABLENESS (Q13 - Q16)
  -- Q13
  v_q_id := '00000000-0000-0000-0000-00000000c013';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_agr_id, 'Ketika tutor menunjukkan kesalahan pada jawaban saya, saya menerimanya dengan senang hati sebagai bahan belajar.', 13, 1, false);

  -- Q14
  v_q_id := '00000000-0000-0000-0000-00000000c014';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_agr_id, 'Saya merasa senang bila dapat membantu menjelaskan materi kepada teman yang sedang kesulitan memahami.', 14, 1, false);

  -- Q15 (Reverse)
  v_q_id := '00000000-0000-0000-0000-00000000c015';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_agr_id, 'Saya merasa kurang nyaman bila metode belajar yang saya sukai disarankan untuk diubah oleh pengajar.', 15, 1, true);

  -- Q16
  v_q_id := '00000000-0000-0000-0000-00000000c016';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_agr_id, 'Saya dapat beradaptasi dengan baik saat bekerja sama dalam kelompok belajar yang memiliki kemampuan beragam.', 16, 1, false);

  -- DIMENSION 5: EMOTIONAL STABILITY (Q17 - Q20)
  -- Q17
  v_q_id := '00000000-0000-0000-0000-00000000c017';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_emo_id, 'Saat menemui soal yang sangat sulit, saya tetap berusaha tenang dan menganalisis bagian mana yang bisa dikerjakan.', 17, 1, false);

  -- Q18 (Reverse)
  v_q_id := '00000000-0000-0000-0000-00000000c018';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_emo_id, 'Saya mudah merasa cemas dan kehilangan konsentrasi ketika waktu ujian tersisa sedikit.', 18, 1, true);

  -- Q19
  v_q_id := '00000000-0000-0000-0000-00000000c019';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_emo_id, 'Mendapat nilai latihan yang belum memuaskan membuat saya semakin penasaran untuk menguasai materi tersebut.', 19, 1, false);

  -- Q20 (Reverse)
  v_q_id := '00000000-0000-0000-0000-00000000c020';
  insert into public.assessment_questions (id, assessment_id, dimension_id, question_text, display_order, weight, reverse_score)
  values (v_q_id, v_assessment_id, v_dim_emo_id, 'Kelelahan belajar sering membuat saya ingin langsung berhenti tanpa menuntaskan sesi yang sudah dijadwalkan.', 20, 1, true);

  -- ---------------------------------------------------------------------------
  -- 6. Insert 5 Likert Options for Each of the 20 Questions
  -- ---------------------------------------------------------------------------
  insert into public.assessment_options (question_id, label, value, display_order)
  select
    q.id,
    opt.label,
    opt.value,
    opt.display_order
  from public.assessment_questions q
  cross join (
    values
      ('Sangat Tidak Setuju', 1, 1),
      ('Tidak Setuju', 2, 2),
      ('Netral', 3, 3),
      ('Setuju', 4, 4),
      ('Sangat Setuju', 5, 5)
  ) as opt(label, value, display_order)
  where q.assessment_id = v_assessment_id
  on conflict (question_id, value) do update set
    label = excluded.label,
    display_order = excluded.display_order;

end $$;
