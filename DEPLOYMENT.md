# Deployment Guide & Environment Hardening — Laits Edu Tech LMS

## 1. Environments

The application operates across three distinct tiers:

```text
Local Development  -->  Staging Environment  -->  Production
(localhost:5173)       (staging.laits.id)        (laits.id)
```

Each tier connects to an isolated Supabase project and database instance to prevent contamination of production metrics, revenue, or user profiles.

---

## 2. Environment Variables

All client-accessible variables require the `VITE_` prefix. Server-side secrets must **never** be prefixed with `VITE_`.

### `.env.example`
```bash
# Public Supabase Connection
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application URLs
VITE_APP_URL=https://laits.id

# Server-Only Secrets (Forbidden in Frontend Bundle)
# SUPABASE_SERVICE_ROLE_KEY=sbp_secret_key...
```

*Note: Environment validation in `src/lib/env.ts` will halt the application if `VITE_SUPABASE_URL` is malformed or if server secrets are mistakenly exposed in the client.*

---

## 3. Database Migration Deployment

Before deploying frontend code, database migrations must be applied sequentially via the Supabase CLI:

```bash
# 1. Login to Supabase CLI
npx supabase login

# 2. Link to target project (Staging or Production)
npx supabase link --project-ref <your-project-ref>

# 3. Apply pending migrations in order
npx supabase db push
```

### Migration Verification:
Ensure migration `20261006000004_phase7_production_hardening.sql` is applied:
```sql
SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 1;
```

---

## 4. Frontend Build & Deployment

### Build Command:
```bash
npm run build
```
Generates production bundles in `dist/`.

### Deployment Providers:
* **Vercel / Cloudflare Pages / Netlify**:
  * Build Command: `npm run build`
  * Output Directory: `dist`
  * Node.js Version: `>= 20.x`
  * Single Page App (SPA) Redirect Rule: `/* -> /index.html 200`

---

## 5. Post-Deployment Smoke Test Procedure

Immediately following deployment:
1. Navigate to `https://<domain>/health` and confirm that all checks return `pass`.
2. Perform test login on Staging using verified test accounts.
3. Verify that student dashboard loads without console exceptions.
4. Verify notification dropdown retrieves unread count.
5. Verify tutor marketplace search queries function with 300ms debounce.

---

## 6. Rollback Strategy

### Frontend Rollback:
* Instant Rollback via Deployment Dashboard: Revert to previous successful immutable deployment artifact in Vercel / Cloudflare with zero downtime.

### Database Rollback:
* Forward-Fix Principle: Do not roll back migrations destructively. If an issue is discovered, deploy an incremental fix migration.
* Catastrophic Failure: If critical data corruption occurs, initiate Supabase Point-in-Time Recovery (PITR) to the timestamp before deployment.
