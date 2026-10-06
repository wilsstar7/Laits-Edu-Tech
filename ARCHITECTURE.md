# System Architecture — Laits Edu Tech LMS

## 1. Architectural Overview

Laits Edu Tech is an integrated Learning Management System (LMS) designed for personalized student learning journeys, personality assessments, and tutor matching.

The architecture emphasizes:
* **Stateless Frontend**: React 19 + TypeScript SPA built with Vite.
* **Serverless Backend Infrastructure**: Supabase (PostgreSQL 15+, PostgREST, GoTrue Auth, Realtime, Storage).
* **Security at the Database Layer**: Row Level Security (RLS) policies, atomic stored procedures (RPCs), and PostgreSQL trigger-based state machine enforcement.
* **Resilient Client Architecture**: Code-splitting with `React.lazy`, client-side debounce, centralized structured logging, and crash-safe React Error Boundaries.

```text
+-----------------------------------------------------------------------------------+
|                                Client Layer (SPA)                                 |
|  React 19 + Vite + TypeScript + Tailwind CSS + Lucide React + React Router v7     |
+-----------------------------------------------------------------------------------+
            |                           |                         |
       REST / Auth                  Realtime                   Storage
            |                           |                         |
            v                           v                         v
+-----------------------+   +-----------------------+   +---------------------------+
|    Supabase Auth      |   |   PostgREST API       |   |      Supabase Storage     |
| (GoTrue, JWT Sessions)|   | (Row-Level Security)  |   | (Private/Public Buckets)  |
+-----------------------+   +-----------------------+   +---------------------------+
                                        |                             |
                                        v                             |
+-------------------------------------------------------------------v---------------+
|                           PostgreSQL Database (Engine)                             |
|                                                                                   |
|  - Relational Schema (33 production tables)                                       |
|  - Multi-tenant Row-Level Security (RLS)                                          |
|  - Transactional Stored Procedures (RPCs)                                         |
|  - Transition Invariant Triggers (Payments & Bookings State Machines)             |
|  - GiST Exclusion Constraint (Anti-double-booking)                                |
|  - Automated Audit Trail (audit_logs table)                                       |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Subsystems

### 2.1 Authentication & Session Management
* Managed via Supabase GoTrue with secure refresh token rotation.
* Sensitive authentication tokens are stored in scoped browser storage (`laits-auth`) and never logged or exposed to third-party scripts.
* Route guards verify roles on the client (`RoleGuard`), but the primary security boundary resides in PostgreSQL RLS.

### 2.2 Personality Assessment Engine
* Questions and scoring logic evaluate cognitive and behavioral learning styles (Explorer, Strategist, etc.).
* Calculation occurs via PostgreSQL RPC (`submit_and_score_assessment`) and trusted mathematical helpers (`src/utils/scoring.ts`), preventing clients from tampering with raw or normalized scores.

### 2.3 Tutor Marketplace & Scheduling
* Dynamic discovery with 300ms debounced queries and multi-axis filtering (subjects, ratings, rates, experience).
* Availability schedules stored in `tutor_availabilities`.
* Double-booking prevention enforced via PostgreSQL `EXCLUDE USING gist` constraint on active booking time intervals.

### 2.4 Payment & Verification Workflow
* State machine transitions (`pending` -> `awaiting_verification` -> `verified` / `rejected`).
* Enforced via trigger `guard_payment_status_transition()` preventing illegal status regressions.
* Payment proofs stored in protected storage with short-lived signed URLs.

### 2.5 Notifications & Operational Reporting
* Centralized notifications stored in `public.notifications` with real-time unread badges and atomic mark-as-read RPCs (`mark_notification_read`, `mark_all_notifications_read`).
* Monthly learning reports generated idempotently via RPC `generate_monthly_learning_report(...)` aggregating verified completed tutoring sessions.

### 2.6 Observability & Error Handling
* Centralized structured logger (`src/lib/logger.ts`) with production debug-gating and automatic recursive redaction of credentials, tokens, and secrets.
* Standardized error categorization (`src/utils/errors.ts`) mapping PostgreSQL error codes to friendly Indonesian messages while suppressing SQL internals.
* System diagnostics endpoint (`/health`) verifying frontend status, configuration validity, auth gateway ping, and database read latency.

---

## 3. Directory Structure

```text
laits-edu-tech/
|-- src/
|   |-- components/          # Reusable UI components, modals, form controls, guards
|   |   |-- auth/            # LoginForm, RegisterForm, RoleGuard, ProtectedRoute
|   |   |-- dashboard/       # Dashboard widgets, stats cards
|   |   |-- layout/          # AppShell, Navbar, NotificationButton, Sidebar
|   |   |-- report/          # Personality & Monthly report components
|   |   |-- ui/              # Button, Badge, Modal, ErrorBoundary
|   |-- hooks/               # Custom React hooks (useAuth, useDebounce, etc.)
|   |-- lib/                 # Core utilities (env, supabase, logger, validation)
|   |-- pages/               # Route-level page components (lazy-loaded)
|   |   |-- admin/           # Admin dashboard, payments, reviews, operations
|   |   |-- student/         # Student dashboard, marketplace, notifications
|   |   |-- tutor/           # Tutor schedule, availability, sessions
|   |-- routes/              # AppRoutes router configuration with code-splitting
|   |-- services/            # Data access services wrapping Supabase RPCs/tables
|   |-- types/               # TypeScript type definitions and Database schema types
|   |-- utils/               # Pure utility functions (scoring, format, errors)
|   `-- tests/               # Integration, RBAC, and journey test suites
|-- supabase/
|   |-- migrations/          # Incremental, ordered SQL migrations
|   `-- seed.sql             # Development and staging seed data
|-- ARCHITECTURE.md          # System architecture documentation (this document)
|-- SECURITY.md              # Security hardening, RBAC, and storage policies
|-- DATABASE.md              # Database schema, indexes, and triggers
|-- OPERATIONS.md            # SRE runbooks, health checks, backup & recovery
|-- TESTING.md               # Automated testing strategies and QA procedures
`-- DEPLOYMENT.md            # Staging & Production deployment guide
```
