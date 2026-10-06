# Operations & Reliability Runbook — Laits Edu Tech LMS

## 1. Observability Architecture

### 1.1 Centralized Structured Logger
All log outputs must use `src/lib/logger.ts` instead of raw `console.log()`:
* **Log Levels**: `debug`, `info`, `warn`, `error`.
* **Production Gating**: `debug` level statements are suppressed in production builds.
* **Sensitive Redaction**: Passwords, tokens, service keys, and payment credentials are automatically masked into `[REDACTED]`.
* **Tracing**: Correlation IDs generated with `generateCorrelationId()` tie related transactions across services.

### 1.2 System Health Probes
A dedicated health check endpoint is implemented at `/health`:
* **Frontend State**: Confirms Vite application initialization.
* **Configuration State**: Validates environment variables and URL formats.
* **Auth Gateway**: Pings `Supabase Auth` health endpoint (`/auth/v1/health`).
* **Database Responsiveness**: Executes a lightweight query against `public.subjects` and measures roundtrip latency.
* **Safe Output**: Health reports expose only status strings and latencies, never connection strings or credentials.

---

## 2. Backup & Recovery Strategy

| Layer | Backup Type | Frequency | Retention | Provider / Tool |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL Database** | Point-in-Time Recovery (PITR) & Daily Snapshots | Continuous WAL + Daily 00:00 UTC | 30 Days (Production) | Supabase Managed Backup |
| **Storage Buckets** | Multi-region Object Replication | Continuous | Indefinite | Supabase S3-compatible Storage |
| **Database Migrations** | Version Controlled Git SQL | Per Commit / Release | Permanent | GitHub Repository |
| **Environment Config** | Encrypted Secret Store | Per Deployment Change | Immutable Versions | Vercel / Cloudflare Secret Manager |

### Recovery Verification Procedure:
1. Restore backup to a staging database instance.
2. Run database migration tests: `npm test`.
3. Verify table counts and row hashes on critical tables (`profiles`, `bookings`, `payments`).
4. Validate that RLS policies and triggers are intact.

---

## 3. Disaster Recovery (DR) Scenarios

### Scenario A: Bad Migration Applied
1. **Detection**: Health check latency alert or failing queries post-deployment.
2. **Containment**: Halt CI/CD deployment pipelines immediately.
3. **Recovery**: Deploy a forward-fixing migration script (never edit applied migrations). If data corruption occurs, restore table state using Point-in-Time Recovery (PITR) to the timestamp before the migration.
4. **Verification**: Execute `npm test` and verify `/health`.

### Scenario B: Database Outage or Corruption
1. **Detection**: `/health` reports `status: "degraded"` or `databaseQuery: "fail"`.
2. **Containment**: Display graceful maintenance notice to end users.
3. **Recovery**: Trigger Point-in-Time Recovery (PITR) via Supabase Dashboard to the last healthy transaction log.
4. **Verification**: Run diagnostic queries and execute critical user journey tests.

### Scenario C: Credential or Key Compromise
1. **Detection**: Anomalous API activity in Supabase log inspector.
2. **Containment**: Rotate `SUPABASE_SERVICE_ROLE_KEY` and database passwords immediately in Supabase Dashboard.
3. **Recovery**: Update staging and production environment variable secret stores. Invalidate all active user sessions (`auth.admin.signOut()`).
4. **Verification**: Verify that old credentials fail and new sessions succeed.

---

## 4. Data Retention Policies

* **Audit Logs (`audit_logs`)**: Retained for **365 days** for regulatory and operational accountability.
* **Payment Events & Invoices (`payments`, `invoices`)**: Retained **indefinitely** for accounting compliance.
* **Notifications (`notifications`)**: Unread notifications retained indefinitely; read notifications older than **180 days** eligible for archival.
* **Generated Reports (`personality_reports`, `monthly_learning_reports`)**: Retained indefinitely as student academic records.
