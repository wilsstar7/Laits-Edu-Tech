# Security Architecture & Hardening — Laits Edu Tech LMS

## 1. Security Philosophy

Laits Edu Tech follows a **Zero-Trust, Secure-by-Default** engineering posture:
1. **Frontend is strictly UX**: Client-side role checks (`RoleGuard`, hidden buttons) are convenience features, never trust boundaries.
2. **PostgreSQL Row Level Security (RLS) is King**: Every single public table requires explicit RLS policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
3. **Least Privilege**: The browser client connects only with `VITE_SUPABASE_ANON_KEY`. Privileged actions execute via Security Definer RPCs with internal `auth.uid()` checks or protected administrative endpoints.
4. **Information Scrubbing**: Database errors, stack traces, and internal schema details are scrubbed before reaching client viewports.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Capability | Student | Tutor | Admin | Super Admin | Enforcement Layer |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Own Profile** | Read/Update | Read/Update | Read/Update | Read/Update | RLS: `auth.uid() = id` |
| **Personality Assessment** | Take & View | None | View Only | View Only | RLS + RPC `submit_and_score_assessment` |
| **Own Reports (PDF & Monthly)** | Read / Generate | None | Controlled View | Controlled View | RLS (`student_id = auth.uid()`) |
| **Tutor Marketplace** | View Active | View Active | View All | View All | RLS: `is_active = true` for public |
| **Booking Creation** | Create Own | Controlled | Full | Full | RLS + GiST Exclusion Constraint |
| **Manage Availability** | None | Create/Update Own | Controlled | Full | RLS: `tutor_id = auth.uid()` |
| **Payment Submission** | Submit Own | View Relevant | Review/Verify | Full | RLS + State Machine Trigger |
| **Reviews & Ratings** | Submit (Finished) | View Received | Moderate All | Moderate All | RLS + Unique Constraint `(booking_id)` |
| **Learning Progress & Sessions**| View Own | View Assigned | Full | Full | RLS (`student_id = auth.uid()`) |
| **Notifications** | View/Read Own | View/Read Own | Operational | Full | RLS + RPC `mark_notification_read` |
| **Analytics & Operations** | None | Own Stats | Full | Full | RLS + Role Check in RPC |
| **Audit Logs** | None | None | Controlled Read | Full Read/Audit | RLS: `user_roles.role IN ('admin','super_admin')` |
| **User Role Assignment** | None | None | Controlled | Full | RPC `admin_set_user_role` (Super Admin only) |

---

## 3. Row-Level Security (RLS) Policies

All 33 database tables have RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).

Key RLS rules:
* `profiles`: Users can select and update only their own profile (`auth.uid() = id`). Admins can read all profiles.
* `bookings`: Students can read their own bookings (`student_id = auth.uid()`). Tutors can read bookings where they are the assigned tutor (`tutor_id = auth.uid()`).
* `payments`: Students can view payments for their bookings. Tutors can view payments for sessions they teach. Admins can view and verify payments.
* `notifications`: Only the owner of the notification can query or mark as read (`user_id = auth.uid()`).
* `monthly_learning_reports`: Students read only their own generated reports. Idempotent composite uniqueness `(student_id, period_year, period_month)` prevents duplicate records.
* `audit_logs`: Public insert is forbidden; inserts occur only via system functions or server RPCs. Only admins can read audit logs.

---

## 4. Service Role Key & Secrets Protection

* **Client Bundle Isolation**: The service role secret (`SUPABASE_SERVICE_ROLE_KEY`) is **strictly forbidden** from client-side code and repository commits.
* **Environment Configuration**: Centralized validation in `src/lib/env.ts` detects and rejects accidental exposure of service keys prefixed with `VITE_`.
* **Repository Sanitation**: `.env*` files (except `.env.example`) are ignored in `.gitignore`. No secret credentials or private certificates are stored in version control.

---

## 5. Input Validation & Data Sanitation

* **Schema Validation**: Every form submission and API payload is validated against strict Zod schemas (`src/lib/validation.ts`):
  * `loginSchema` & `registerSchema`: Email format, password length, and required student attributes.
  * `bookingInputSchema`: Date format verification, future date checks, end time strictly after start time.
  * `tutorAvailabilityInputSchema`: Time format regex (`HH:MM`), day of week range `[0..6]`.
  * `reviewInputSchema`: Rating bound `[1..5]`, string character limit.
  * `adminVerifyPaymentSchema`: Strict decision enum (`approve` | `reject`), mandatory rejection reason for rejected claims.
* **Open Redirect Defense**:
  * In `LoginForm.tsx`, the `from` redirection state is sanitized against protocol-relative URLs (`//`), URL schemes (`http:`, `javascript:`), and directory traversal attempts (`..`).
* **XSS Defense**:
  * Pure React JSX sanitization is utilized. No `dangerouslySetInnerHTML` is used without explicit DOMPurify sanitization.

---

## 6. Storage Security

1. **Bucket Privacy**: Buckets storing sensitive files (e.g., `payment-proofs`, `personality-reports`) are marked **private**.
2. **Signed URLs**: Clients retrieve private documents exclusively via time-limited signed URLs (`createSignedUrl`) with short TTLs (typically 15-60 minutes).
3. **Upload Constraints**:
   * File type restriction: PDF, PNG, JPG, WEBP only.
   * File size limits: Max 5 MB per document.
   * Filename sanitization: `sanitizeReportFilename()` removes dangerous path characters.

---

## 7. Sensitive Logging & Error Redaction

* **Structured Logger**: `src/lib/logger.ts` recursively masks keys matching sensitive terms (`password`, `token`, `secret`, `service_role`, `authorization`, `credit_card`) into `[REDACTED]`.
* **Database Error Masking**: `src/utils/errors.ts` maps raw PostgreSQL errors (`42P01`, `23505`, etc.) into safe, user-facing Indonesian messages. Internal table names, constraint identifiers, and SQL queries are logged internally but suppressed from user viewports.
