# Testing Strategy & Quality Assurance — Laits Edu Tech LMS

## 1. Testing Pyramid Overview

The testing strategy validates system correctness across multiple layers:

```text
                  / \
                 / E2E \           (Role-based UI flows & Route Guards)
                /-------\
               / Integr. \         (RPCs, Services, State Machines, Reports)
              /-----------\
             /  Unit Tests \       (Scoring, Validation, Formatters, Logger)
            /---------------\
```

---

## 2. Test Suites Implemented

| Test Suite | File | Tests | Focus |
| :--- | :--- | :---: | :--- |
| **Validation Schemas** | `src/lib/validation.test.ts` | 20 | Zod input schemas for auth, bookings, schedules, reviews, payments |
| **Logger & Sanitization**| `src/lib/logger.test.ts` | 3 | Sensitive key redaction, correlation IDs, environment log gating |
| **Error Handling** | `src/utils/errors.test.ts` | 6 | Error categorization, PostgreSQL code mapping, SQL detail suppression |
| **Security & RBAC Matrix**| `src/tests/security-rbac.test.ts`| 8 | Student vs Tutor vs Admin privilege isolation, RouteGuard matrix |
| **Critical User Journeys**| `src/tests/critical-journeys.test.ts`| 13 | Scoring normalization, booking state machine, payment state transitions |
| **Health Diagnostics** | `src/services/healthService.test.ts` | 1 | Health check execution and secret suppression |
| **Notifications Service**| `src/services/notificationService.test.ts`| 4 | Pagination, unread counts, RPC mark-as-read calls |
| **Monthly Report Service**| `src/services/monthlyReportService.test.ts`| 2 | Report generation RPC and idempotent retrieval |
| **Assessment Scoring** | `src/utils/scoring.test.ts` | 9 | Likert calculation, reverse scoring `(6 - value)`, weight calculations |
| **Marketplace Filtering**| `src/utils/marketplace.test.ts` | 22 | Tutor search, rating filters, hourly rate sort, experience checks |
| **Booking Types** | `src/types/booking.test.ts` | 10 | Status transitions, booking durations, price calculations |
| **PDF Generation** | `src/services/pdf/pdfGenerator.test.ts` | 3 | Multi-page PDF generation, font embedding, layout stability |
| **Format Utilities** | `src/utils/format.test.ts` | 9 | Currency formatting, date formats, Indonesian localized strings |
| **Report Generation** | `src/services/personalityReportService.test.ts`| 6 | Idempotent report generation, signed URLs, ownership validation |
| **Tutor Recommendations**| `src/services/tutorRecommendationService.test.ts`| 3 | Scoring recommendations based on assessment results |
| **Total** | **15 Test Files** | **119 Tests** | **All Passing (100% Green)** |

---

## 3. Running Verification Commands

### Run Unit & Integration Tests:
```bash
npm test
```
*Executes all 15 Vitest test suites.*

### Run Static Analysis & Linting:
```bash
npm run lint
```
*Validates zero ESLint errors across components, services, and tests.*

### Run TypeScript Typechecking:
```bash
npm run typecheck
```
*Compiles the TypeScript project strictly (`tsc -b`) with zero type errors.*

### Run Production Build:
```bash
npm run build
```
*Typechecks and generates the code-split, minified production assets in `dist/`.*

---

## 4. Manual Smoke Testing Checklist

* [ ] **Landing Page**: Loads smoothly without horizontal overflow.
* [ ] **Student Registration**: Validates required student fields, prevents short passwords.
* [ ] **Student Login**: Authenticates valid credentials, sanitizes redirect state.
* [ ] **Personality Assessment**: Completes 20 questions, autosaves progress, yields accurate personality archetype.
* [ ] **Personality Report**: Generates or downloads PDF without missing fonts.
* [ ] **Tutor Discovery**: Debounced search responds within 300ms, filter by subject and price.
* [ ] **Booking Creation**: Confirms slot, prevents booking collisions.
* [ ] **Payment Flow**: Submits payment proof to private storage, displays awaiting verification badge.
* [ ] **Tutor Dashboard**: Displays confirmed sessions and availability schedule.
* [ ] **Admin Portal**: Displays analytics, lists pending payments, verifies or rejects with required audit reason.
* [ ] **Health Probe**: Visiting `/health` returns healthy checks for frontend, config, and database.
