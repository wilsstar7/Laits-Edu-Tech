# Database Architecture & Migration Discipline — Laits Edu Tech LMS

## 1. PostgreSQL Schema Overview

The database engine is PostgreSQL 15+ hosted on Supabase. The schema consists of 33 tables partitioned across distinct functional domains:

```text
Domain                 Tables
---------------------  -------------------------------------------------------------
Auth & User Identity   profiles, user_roles, student_profiles, tutor_profiles,
                       tutor_documents, subjects, tutor_subjects
Personality Engine     assessments, assessment_dimensions, assessment_questions,
                       assessment_options, assessment_sessions, assessment_answers,
                       assessment_results, assessment_result_dimensions,
                       personality_types, personality_type_rules, personality_reports
Learning Journeys      student_learning_paths, student_goals, learning_progress,
                       learning_sessions
Marketplace & Booking  tutor_availabilities, bookings
Payments & Billing     payments, payment_proofs, payment_events, invoices
Feedback & Community   reviews
Operations & Audit     notifications, monthly_learning_reports, audit_logs
```

---

## 2. Migration Discipline

Migrations are strictly sequential, immutable once deployed to shared environments, and non-destructive:

```text
Migration File                              Domain
------------------------------------------  ----------------------------------------
20261005000001_phase1_initial_schema.sql    Core tables, profiles, roles, subjects
20261005000002_phase1_auth_rbac_rls.sql     Auth triggers, profile triggers, RLS
20261006000001_phase2_assessment_engine.sql Assessment schema, scoring RPC, rules
20261006000002_phase3_reports_storage.sql   Personality PDF reports table & storage
20261006000003_phase4_marketplace_...sql    Bookings, GiST exclusion, payments, reviews
20261006000004_phase7_production_...sql     Phase 7 hardening: notifications, monthly
                                            reports, status triggers, query indexes
```

### Rule of Discipline:
* Never edit an existing migration applied to staging/production.
* Always generate a new, timestamped migration file for alterations, new tables, or new indexes.

---

## 3. Phase 7 Hardening Features

### 3.1 New Tables Added
1. **`public.notifications`**:
   * Stores user notifications with attributes: `user_id`, `title`, `message`, `type`, `link_url`, `is_read`, `read_at`.
   * Indexes: `idx_notifications_user_unread (user_id, is_read, created_at DESC)` for O(1) unread badge lookups.
   * RLS enabled: Users query and update only their own notifications.
2. **`public.monthly_learning_reports`**:
   * Stores aggregated monthly learning metrics: `student_id`, `period_month`, `period_year`, `total_sessions`, `total_hours`, `avg_progress_percentage`, `summary`, `status`.
   * Composite Unique Constraint: `UNIQUE(student_id, period_year, period_month)` ensuring idempotent report generation.

### 3.2 State Machine Invariant Triggers
1. **`guard_payment_status_transition()`**:
   * Enforces legal transitions:
     * `pending` -> `awaiting_verification`, `expired`, `rejected`.
     * `awaiting_verification` -> `verified`, `rejected`.
     * `verified` -> `refunded`.
   * Blocks status regression from `verified` back to `pending`.
   * Rejects modification on terminal states (`rejected`, `expired`, `refunded`).
2. **`guard_booking_status_transition()`**:
   * Blocks illegal regressions (e.g., `completed` -> `pending` or `cancelled` -> `confirmed`).

### 3.3 Anti-Double-Booking Protection
* Enforced via PostgreSQL GiST Exclusion Constraint on `bookings`:
  ```sql
  CONSTRAINT no_overlapping_tutor_bookings EXCLUDE USING gist (
    tutor_id WITH =,
    tstzrange(scheduled_start, scheduled_end) WITH &&
  ) WHERE (status IN ('pending', 'confirmed'))
  ```
  Guarantees that two concurrent booking requests for the same tutor slot cannot succeed simultaneously, eliminating race conditions.

### 3.4 Key Query Indexes Added in Phase 7
* `idx_bookings_student_status` on `bookings(student_id, status)`
* `idx_bookings_tutor_status` on `bookings(tutor_id, status)`
* `idx_payments_student_status` on `payments(student_id, status)`
* `idx_payments_tutor_status` on `payments(tutor_id, status)`
* `idx_payments_awaiting_verification` on `payments(status, created_at DESC)`
* `idx_reviews_tutor_status` on `reviews(tutor_id, status)`
* `idx_learning_sessions_student` on `learning_sessions(student_id, session_date DESC)`
* `idx_learning_sessions_tutor` on `learning_sessions(tutor_id, session_date DESC)`
* `idx_audit_logs_actor_created` on `audit_logs(actor_id, created_at DESC)`
* `idx_student_learning_paths_student` on `student_learning_paths(student_id, status)`

---

## 4. Stored Procedures & RPCs

* **`generate_monthly_learning_report(p_student_id, p_year, p_month)`**: Atomically aggregates completed sessions for the target month and upserts into `monthly_learning_reports`.
* **`mark_notification_read(p_notification_id)`**: Atomically marks a single notification as read if owned by `auth.uid()`.
* **`mark_all_notifications_read()`**: Atomically marks all unread notifications of `auth.uid()` as read.
* **`submit_and_score_assessment(...)`**: Scores assessment answers server-side with dimension normalization.

---

## 5. Phase 8 Advanced Learning & Engagement Architecture

### 5.1 Migration File
`20261006000005_phase8_learning_engagement_growth.sql`

### 5.2 Schema Hierarchy & New Tables
Phase 8 introduces 19 interconnected tables organized under the hierarchy:
```text
Course -> Section -> Lesson -> Materials -> Quiz & Assignment -> Progress & Streak -> Certificates
```

1. **Content Management**:
   - `courses`: Catalogs structured courses with status state machine (`draft`, `published`, `archived`), level, duration, and subject foreign keys.
   - `course_objectives`: Relational learning objectives per course.
   - `course_sections`: Ordered curriculum modules with `UNIQUE(course_id, sort_order)`.
   - `lessons`: Multimodal lessons (`text`, `video`, `pdf`, `audio`, `link`, `mixed`) with estimated duration.
   - `lesson_materials`: Sub-materials and downloadable resources referencing Supabase Storage or external links.

2. **Enrollment & Progress Tracking**:
   - `course_enrollments`: Tracks active student enrollments, completion timestamps, and enrollment source with idempotency (`UNIQUE(student_id, course_id)`).
   - `lesson_progress`: Fine-grained lesson progression tracking (`not_started`, `in_progress`, `completed`).

3. **Evaluation (Quiz & Assignment)**:
   - `assignments`: Lesson assignments with deadlines and scoring rubrics.
   - `assignment_submissions`: Student submission answers and tutor feedback grading.
   - `quizzes`: Lesson evaluation quizzes with passing thresholds and attempt limitations.
   - `quiz_questions`: Ordered quiz items (`single_choice`, `multiple_choice`, `true_false`).
   - `quiz_options`: Answers where `is_correct` is concealed server-side and evaluated only in PostgreSQL.
   - `quiz_attempts`: Audit trail of each student attempt with calculated score and pass state.

4. **Student Engagement & Recognition**:
   - `learning_goals`: Self-directed targets (`sessions`, `courses`, `lessons`, `minutes`) with dynamic completion calculation.
   - `student_streaks`: Daily learning activity streak tracking consecutive calendar dates.
   - `achievements`: System milestone badges.
   - `student_achievements`: Awarded badges with idempotent constraint `UNIQUE(student_id, achievement_id)`.
   - `certificates`: Digital completion certificates issued automatically upon 100% course completion with unique verification number.

5. **Communication & Announcements**:
   - `announcements`: Broadcast announcements with audience targeting (`all`, `students`, `tutors`, `admins`) and automatic notification dispatch.

### 5.3 PostgreSQL Security Definer RPCs in Phase 8
* **`complete_lesson(p_lesson_id)`**: Transactionally marks lesson as completed, recalculates course enrollment progress percentage, marks course completed if 100%, issues certificate if eligible, records daily streak activity, and logs audit events.
* **`submit_quiz_attempt(p_quiz_id, p_answers)`**: Trusted server-side grading calculating raw score, checking passing threshold against `quizzes.passing_score`, and recording activity.
* **`publish_announcement(p_announcement_id)`**: Transitions announcement from draft to published and fans out system notifications idempotently.
* **`verify_certificate_public(p_certificate_number)`**: Public-safe RPC returning verified student display name, course title, and completion date without leaking private metadata.
* **`record_learning_activity(p_student_id, p_activity_type, p_reference_id)`**: Updates consecutive day streak counter idempotently per calendar day.

