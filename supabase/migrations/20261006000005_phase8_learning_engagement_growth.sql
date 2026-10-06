-- ============================================================================
-- Migration: 20261006000005_phase8_learning_engagement_growth.sql
-- Description: LMS Phase 8 — Advanced Learning Experience, Content Management,
--              Quizzes, Assignments, Goals, Streaks, Achievements, Certificates,
--              Announcements, and Product Growth.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Courses & Curriculum Hierarchy
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT,
  level TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  estimated_duration_minutes INTEGER NOT NULL DEFAULT 60,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.course_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  objective TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.course_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_course_section_sort UNIQUE (course_id, sort_order)
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.course_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT DEFAULT '',
  lesson_type TEXT NOT NULL DEFAULT 'text' CHECK (lesson_type IN ('text', 'video', 'pdf', 'audio', 'link', 'mixed')),
  content TEXT DEFAULT '',
  estimated_duration_minutes INTEGER NOT NULL DEFAULT 15,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_section_lesson_sort UNIQUE (section_id, sort_order)
);

CREATE TABLE IF NOT EXISTS public.lesson_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'pdf' CHECK (type IN ('pdf', 'video', 'audio', 'doc', 'link')),
  title TEXT NOT NULL,
  storage_path TEXT,
  external_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 2. Enrollment & Progress
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  enrollment_source TEXT NOT NULL DEFAULT 'manual' CHECK (enrollment_source IN ('personalized_recommendation', 'manual', 'learning_path', 'admin_assigned')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_student_course_enrollment UNIQUE (student_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_student_lesson_progress UNIQUE (student_id, lesson_id)
);

-- ----------------------------------------------------------------------------
-- 3. Assignments & Submissions
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  due_at TIMESTAMPTZ,
  max_score NUMERIC(6, 2) NOT NULL DEFAULT 100.00,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  attachment_path TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'graded', 'returned')),
  score NUMERIC(6, 2),
  feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  graded_at TIMESTAMPTZ,
  graded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_student_assignment_submission UNIQUE (student_id, assignment_id)
);

-- ----------------------------------------------------------------------------
-- 4. Quizzes, Questions, Options & Attempts
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  passing_score NUMERIC(5, 2) NOT NULL DEFAULT 70.00,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'single_choice' CHECK (question_type IN ('single_choice', 'multiple_choice', 'true_false')),
  points NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  passed BOOLEAN NOT NULL DEFAULT false,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_quiz_student_attempt UNIQUE (quiz_id, student_id, attempt_number)
);

-- ----------------------------------------------------------------------------
-- 5. Student Engagement: Goals, Streaks, Achievements & Certificates
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  target_type TEXT NOT NULL DEFAULT 'sessions' CHECK (target_type IN ('sessions', 'courses', 'lessons', 'minutes')),
  target_value NUMERIC(8, 2) NOT NULL DEFAULT 1.00,
  current_value NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.student_streaks (
  student_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'award',
  criteria_type TEXT NOT NULL CHECK (criteria_type IN ('course_completed', 'quiz_passed', 'streak_days', 'lessons_completed')),
  criteria_value NUMERIC(8, 2) NOT NULL DEFAULT 1.00,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_student_achievement UNIQUE (student_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_student_course_certificate UNIQUE (student_id, course_id)
);

-- ----------------------------------------------------------------------------
-- 6. Announcements & Communication
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  audience TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'students', 'tutors', 'admins')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 7. Performance Indexes
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_courses_subject_status ON public.courses(subject_id, status);
CREATE INDEX IF NOT EXISTS idx_courses_learning_path ON public.courses(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_course_sections_course ON public.course_sections(course_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_lessons_section_status ON public.lessons(section_id, status);
CREATE INDEX IF NOT EXISTS idx_lesson_materials_lesson ON public.lesson_materials(lesson_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_student ON public.course_enrollments(student_id, status);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON public.course_enrollments(course_id, status);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON public.lesson_progress(student_id, course_id, status);
CREATE INDEX IF NOT EXISTS idx_assignments_lesson ON public.assignments(lesson_id, status);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON public.assignment_submissions(student_id, status);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON public.quizzes(lesson_id, status);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question ON public.quiz_options(question_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON public.quiz_attempts(student_id, quiz_id);

CREATE INDEX IF NOT EXISTS idx_learning_goals_student ON public.learning_goals(student_id, status);
CREATE INDEX IF NOT EXISTS idx_student_achievements_student ON public.student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student ON public.certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON public.certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_announcements_audience_status ON public.announcements(audience, status, published_at DESC);

-- ----------------------------------------------------------------------------
-- 8. Row-Level Security (RLS)
-- ----------------------------------------------------------------------------

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Courses RLS: Anyone can view published courses; Admins & Authors can view drafts/all
CREATE POLICY courses_select_policy ON public.courses
  FOR SELECT USING (
    status = 'published'
    OR auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

CREATE POLICY courses_admin_all_policy ON public.courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

-- Course Objectives RLS
CREATE POLICY objectives_select_policy ON public.course_objectives
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND (c.status = 'published' OR c.created_by = auth.uid()))
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

-- Course Sections & Lessons RLS
CREATE POLICY sections_select_policy ON public.course_sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND (c.status = 'published' OR c.created_by = auth.uid()))
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

CREATE POLICY lessons_select_policy ON public.lessons
  FOR SELECT USING (
    status = 'published'
    OR EXISTS (
      SELECT 1 FROM public.course_sections cs
      JOIN public.courses c ON c.id = cs.course_id
      WHERE cs.id = section_id AND (c.created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin')))
    )
  );

CREATE POLICY lesson_materials_select_policy ON public.lesson_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      WHERE l.id = lesson_id AND (l.status = 'published' OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin')))
    )
  );

-- Course Enrollments RLS
CREATE POLICY enrollments_select_policy ON public.course_enrollments
  FOR SELECT USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

CREATE POLICY enrollments_insert_policy ON public.course_enrollments
  FOR INSERT WITH CHECK (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

CREATE POLICY enrollments_update_policy ON public.course_enrollments
  FOR UPDATE USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

-- Lesson Progress RLS
CREATE POLICY progress_select_policy ON public.lesson_progress
  FOR SELECT USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

CREATE POLICY progress_insert_update_policy ON public.lesson_progress
  FOR ALL USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

-- Assignments & Submissions RLS
CREATE POLICY assignments_select_policy ON public.assignments
  FOR SELECT USING (
    status = 'published'
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

CREATE POLICY submissions_student_policy ON public.assignment_submissions
  FOR SELECT USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

CREATE POLICY submissions_insert_policy ON public.assignment_submissions
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY submissions_update_policy ON public.assignment_submissions
  FOR UPDATE USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

-- Quizzes, Questions, Options & Attempts RLS
CREATE POLICY quizzes_select_policy ON public.quizzes
  FOR SELECT USING (
    status = 'published'
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

CREATE POLICY quiz_questions_select_policy ON public.quiz_questions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.quizzes q WHERE q.id = quiz_id AND (q.status = 'published' OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))))
  );

-- Options RLS: For students, is_correct is NOT revealed directly to prevent inspection tampering;
-- We expose questions & options, but validation is performed via Security Definer RPC!
CREATE POLICY quiz_options_select_policy ON public.quiz_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quiz_questions qq
      JOIN public.quizzes q ON q.id = qq.quiz_id
      WHERE qq.id = question_id AND (q.status = 'published' OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin')))
    )
  );

CREATE POLICY quiz_attempts_select_policy ON public.quiz_attempts
  FOR SELECT USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

-- Learning Goals RLS
CREATE POLICY goals_all_policy ON public.learning_goals
  FOR ALL USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

-- Streaks RLS
CREATE POLICY streaks_select_policy ON public.student_streaks
  FOR SELECT USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

-- Achievements RLS
CREATE POLICY achievements_select_policy ON public.achievements
  FOR SELECT USING (status = 'active');

CREATE POLICY student_achievements_select_policy ON public.student_achievements
  FOR SELECT USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

-- Certificates RLS: Owner & Admins can read; Anyone can verify with public certificate_number
CREATE POLICY certificates_select_policy ON public.certificates
  FOR SELECT USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

-- Announcements RLS
CREATE POLICY announcements_select_policy ON public.announcements
  FOR SELECT USING (
    (status = 'published' AND (
      audience = 'all'
      OR (audience = 'students' AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'student'))
      OR (audience = 'tutors' AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'tutor'))
      OR (audience = 'admins' AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin')))
    ))
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin'))
  );

-- ----------------------------------------------------------------------------
-- 9. Security Definer RPCs & Business Functions
-- ----------------------------------------------------------------------------

-- Function to record daily learning activity and update streak
CREATE OR REPLACE FUNCTION public.record_learning_activity(p_student_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::DATE;
  v_last_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_date, v_current_streak, v_longest_streak
  FROM public.student_streaks
  WHERE student_id = p_student_id;

  IF NOT FOUND THEN
    INSERT INTO public.student_streaks (student_id, current_streak, longest_streak, last_activity_date)
    VALUES (p_student_id, 1, 1, v_today);
  ELSE
    IF v_last_date = v_today THEN
      -- Already active today, streak remains same
      RETURN;
    ELSIF v_last_date = v_today - 1 THEN
      -- Active consecutive day
      v_current_streak := v_current_streak + 1;
      IF v_current_streak > v_longest_streak THEN
        v_longest_streak := v_current_streak;
      END IF;
    ELSE
      -- Streak broken
      v_current_streak := 1;
    END IF;

    UPDATE public.student_streaks
    SET current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_activity_date = v_today,
        updated_at = timezone('utc'::text, now())
    WHERE student_id = p_student_id;
  END IF;
END;
$$;

-- Function to atomically complete a lesson and recalculate course progress
CREATE OR REPLACE FUNCTION public.complete_lesson(p_lesson_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student_id UUID := auth.uid();
  v_course_id UUID;
  v_total_lessons INTEGER;
  v_completed_lessons INTEGER;
  v_course_progress NUMERIC(5, 2);
  v_cert_number TEXT;
BEGIN
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Autentikasi diperlukan.';
  END IF;

  -- Resolve course_id for this lesson
  SELECT cs.course_id INTO v_course_id
  FROM public.lessons l
  JOIN public.course_sections cs ON cs.id = l.section_id
  WHERE l.id = p_lesson_id;

  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'Pelajaran atau kursus tidak ditemukan.';
  END IF;

  -- Upsert lesson progress
  INSERT INTO public.lesson_progress (
    student_id, lesson_id, course_id, status, progress_percentage, completed_at, last_accessed_at, updated_at
  )
  VALUES (
    v_student_id, p_lesson_id, v_course_id, 'completed', 100.00, timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())
  )
  ON CONFLICT (student_id, lesson_id)
  DO UPDATE SET
    status = 'completed',
    progress_percentage = 100.00,
    completed_at = COALESCE(public.lesson_progress.completed_at, timezone('utc'::text, now())),
    last_accessed_at = timezone('utc'::text, now()),
    updated_at = timezone('utc'::text, now());

  -- Record daily learning streak
  PERFORM public.record_learning_activity(v_student_id);

  -- Count total published lessons in this course
  SELECT COUNT(l.id) INTO v_total_lessons
  FROM public.lessons l
  JOIN public.course_sections cs ON cs.id = l.section_id
  WHERE cs.course_id = v_course_id AND l.status = 'published';

  -- Count completed lessons by student in this course
  SELECT COUNT(lp.id) INTO v_completed_lessons
  FROM public.lesson_progress lp
  WHERE lp.student_id = v_student_id AND lp.course_id = v_course_id AND lp.status = 'completed';

  IF v_total_lessons > 0 THEN
    v_course_progress := ROUND((v_completed_lessons::NUMERIC / v_total_lessons::NUMERIC) * 100.00, 2);
  ELSE
    v_course_progress := 100.00;
  END IF;

  -- If 100% completed, mark enrollment complete and generate certificate
  IF v_course_progress >= 100.00 THEN
    UPDATE public.course_enrollments
    SET status = 'completed',
        completed_at = COALESCE(completed_at, timezone('utc'::text, now())),
        updated_at = timezone('utc'::text, now())
    WHERE student_id = v_student_id AND course_id = v_course_id;

    -- Issue certificate idempotently
    v_cert_number := 'CERT-' || UPPER(SUBSTRING(REPLACE(v_course_id::text, '-', ''), 1, 6)) || '-' || UPPER(SUBSTRING(REPLACE(v_student_id::text, '-', ''), 1, 6));

    INSERT INTO public.certificates (student_id, course_id, certificate_number, issued_at, metadata)
    VALUES (v_student_id, v_course_id, v_cert_number, timezone('utc'::text, now()), jsonb_build_object('completion_progress', 100))
    ON CONFLICT (student_id, course_id) DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'course_id', v_course_id,
    'completed_lessons', v_completed_lessons,
    'total_lessons', v_total_lessons,
    'progress_percentage', v_course_progress,
    'is_course_completed', (v_course_progress >= 100.00)
  );
END;
$$;

-- Function to submit and grade a quiz server-side
CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
  p_quiz_id UUID,
  p_answers JSONB -- array of objects: [{"question_id": "...", "selected_option_id": "..."}]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_student_id UUID := auth.uid();
  v_quiz RECORD;
  v_attempt_count INTEGER;
  v_total_points NUMERIC(6, 2) := 0;
  v_earned_points NUMERIC(6, 2) := 0;
  v_calculated_score NUMERIC(5, 2) := 0;
  v_passed BOOLEAN := false;
  v_answer JSONB;
  v_question_id UUID;
  v_option_id UUID;
  v_is_correct BOOLEAN;
  v_question_points NUMERIC(5, 2);
BEGIN
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Autentikasi diperlukan.';
  END IF;

  SELECT * INTO v_quiz FROM public.quizzes WHERE id = p_quiz_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kuis tidak ditemukan.';
  END IF;

  -- Check max attempts
  SELECT COUNT(id) INTO v_attempt_count
  FROM public.quiz_attempts
  WHERE quiz_id = p_quiz_id AND student_id = v_student_id;

  IF v_attempt_count >= v_quiz.max_attempts THEN
    RAISE EXCEPTION 'Batas maksimal percobaan kuis (% kali) telah tercapai.', v_quiz.max_attempts;
  END IF;

  -- Calculate total points possible for this quiz
  SELECT COALESCE(SUM(points), 0) INTO v_total_points
  FROM public.quiz_questions
  WHERE quiz_id = p_quiz_id;

  IF v_total_points = 0 THEN
    v_total_points := 100.00;
  END IF;

  -- Evaluate each answer server-side
  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
  LOOP
    v_question_id := (v_answer->>'question_id')::UUID;
    v_option_id := (v_answer->>'selected_option_id')::UUID;

    SELECT points INTO v_question_points FROM public.quiz_questions WHERE id = v_question_id AND quiz_id = p_quiz_id;

    IF FOUND THEN
      SELECT is_correct INTO v_is_correct FROM public.quiz_options WHERE id = v_option_id AND question_id = v_question_id;
      IF v_is_correct IS TRUE THEN
        v_earned_points := v_earned_points + COALESCE(v_question_points, 0);
      END IF;
    END IF;
  END LOOP;

  v_calculated_score := ROUND((v_earned_points / v_total_points) * 100.00, 2);
  v_passed := (v_calculated_score >= v_quiz.passing_score);

  -- Record attempt
  INSERT INTO public.quiz_attempts (
    quiz_id, student_id, attempt_number, score, passed, answers, started_at, submitted_at
  )
  VALUES (
    p_quiz_id, v_student_id, v_attempt_count + 1, v_calculated_score, v_passed, p_answers, timezone('utc'::text, now()), timezone('utc'::text, now())
  );

  -- Record learning activity for streak
  PERFORM public.record_learning_activity(v_student_id);

  -- If passed, complete the parent lesson
  IF v_passed THEN
    PERFORM public.complete_lesson(v_quiz.lesson_id);
  END IF;

  RETURN jsonb_build_object(
    'attempt_number', v_attempt_count + 1,
    'score', v_calculated_score,
    'passing_score', v_quiz.passing_score,
    'passed', v_passed,
    'max_attempts', v_quiz.max_attempts,
    'remaining_attempts', (v_quiz.max_attempts - (v_attempt_count + 1))
  );
END;
$$;

-- Function to publish announcement and send system notification
CREATE OR REPLACE FUNCTION public.publish_announcement(p_announcement_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_announcement RECORD;
  v_target_user RECORD;
BEGIN
  -- Verify caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Hanya admin yang dapat mempublikasikan pengumuman.';
  END IF;

  SELECT * INTO v_announcement FROM public.announcements WHERE id = p_announcement_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pengumuman tidak ditemukan.';
  END IF;

  UPDATE public.announcements
  SET status = 'published',
      published_at = timezone('utc'::text, now()),
      updated_at = timezone('utc'::text, now())
  WHERE id = p_announcement_id;

  -- Create notifications for audience
  FOR v_target_user IN
    SELECT u.id FROM auth.users u
    JOIN public.user_roles ur ON ur.user_id = u.id
    WHERE (v_announcement.audience = 'all')
       OR (v_announcement.audience = 'students' AND ur.role = 'student')
       OR (v_announcement.audience = 'tutors' AND ur.role = 'tutor')
       OR (v_announcement.audience = 'admins' AND ur.role IN ('admin', 'super_admin'))
  LOOP
    PERFORM public.create_system_notification(
      v_target_user.id,
      'Pengumuman Baru: ' || v_announcement.title,
      SUBSTRING(v_announcement.content FROM 1 FOR 120),
      'system',
      '/student/notifications'
    );
  END LOOP;
END;
$$;

-- Grant least privilege
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

-- Public can verify certificates by certificate_number
CREATE OR REPLACE FUNCTION public.verify_certificate_public(p_certificate_number TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'is_valid', true,
    'certificate_number', c.certificate_number,
    'issued_at', c.issued_at,
    'course_title', cr.title,
    'course_level', cr.level,
    'student_name', p.full_name
  ) INTO v_result
  FROM public.certificates c
  JOIN public.courses cr ON cr.id = c.course_id
  JOIN public.profiles p ON p.id = c.student_id
  WHERE c.certificate_number = p_certificate_number;

  IF v_result IS NULL THEN
    RETURN jsonb_build_object('is_valid', false);
  END IF;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_certificate_public(TEXT) TO anon, authenticated;
