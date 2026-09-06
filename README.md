# S.M.V Coaching Zone

A real, modular, full-stack **Coaching Management + Online Education Platform**, built with Next.js
(App Router), TypeScript, PostgreSQL, and Prisma. This is **Version 1**: a genuinely working core,
built so later modules can be added to the same codebase without a rewrite.

> **Testing disclosure:** This project was built in a sandboxed environment with no network access
> and no running PostgreSQL instance, so `npm install`, `next build`, and a live database could not
> be executed here. Every file was written by hand and passed an extensive manual verification pass
> (see "What was checked" below) — import resolution, bracket/brace balance across all 178 source
> files, Prisma schema relation/type integrity, RBAC boundary checks, client/server component
> boundary checks, and a cross-check of every client `fetch()` call against its API route. Two real
> bugs were found and fixed this way (see "Bugs found and fixed"). None of this substitutes for
> actually running `npm install && npm run dev` against a real database — do that as your first step
> and treat this README's checklist (below) as the test plan to run through.

---

## 1. Tech Stack

- **Next.js 14** (App Router) — single codebase for frontend + API routes
- **TypeScript** throughout
- **PostgreSQL** + **Prisma ORM**
- **NextAuth v4** (Credentials provider, JWT sessions) for authentication
- **Zod** for server-side validation on every mutation
- **Tailwind CSS** for styling
- **bcryptjs** for password hashing
- Local-disk file storage (swappable adapter — see `src/lib/storage.ts`)

No unnecessary separate backend — everything lives in one Next.js project.

---

## 2. Project Structure

```
prisma/
  schema.prisma        # Full data model (see section 5)
  seed.ts               # Demo data for local development
src/
  app/
    (public)/            # Public website (home, about, courses, admission, ...)
    admin/                # Admin dashboard (role-guarded)
    teacher/              # Teacher dashboard (role-guarded)
    student/              # Student dashboard (role-guarded)
    api/                  # All REST API route handlers
    login/, dashboard-redirect/, 403/, not-found.tsx, error.tsx
  components/
    ui/                   # Reusable primitives (Button, Input, Table, Card, ...)
    dashboard/             # Admin/teacher/student forms & widgets
    site/                  # Public site components (Navbar, forms, ...)
  lib/                    # prisma client, auth, rbac, validations, settings, storage, grading, ids
  i18n/                   # Bangla/English dictionaries
  middleware.ts            # Edge-level role route protection
```

Every feature follows the same pattern: `lib/validations.ts` (Zod schema) →
`app/api/<entity>/route.ts` + `[id]/route.ts` (REST handlers, RBAC-checked) →
`components/dashboard/<Entity>Form.tsx` (client form) → `app/admin|teacher|student/<entity>/page.tsx`
(server component page). Adding a new module means adding to this same pattern — see section 8.

---

## 3. Local Setup

### Prerequisites
- Node.js 18.18+ (Node 20/22 recommended)
- A running PostgreSQL instance (local install, Docker, or a hosted service like Neon/Supabase/Railway)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env: set DATABASE_URL to your Postgres connection string,
# and generate a real secret for NEXTAUTH_SECRET:
openssl rand -base64 32

# 3. Create the database schema
npx prisma migrate dev --name init

# 4. Seed demo data (Super Admin, Admin, Teacher, Student, sample Course/Batch/Notice/Result)
npm run seed

# 5. Start the dev server
npm run dev
```

Visit `http://localhost:3000`.

### Demo login credentials (from `npm run seed`)

All demo accounts use the password `Password123!`.

| Role        | Email                          |
|-------------|---------------------------------|
| Super Admin | superadmin@smvcoaching.test     |
| Admin       | admin@smvcoaching.test          |
| Teacher     | teacher@smvcoaching.test        |
| Student     | student@smvcoaching.test        |

**Change or remove these accounts before production.** They exist for local development
convenience only — see the warning at the top of `prisma/seed.ts`.

---

## 4. Environment Variables

See `.env.example` for the full list with comments. Required for the app to run at all:

- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — random secret for session signing (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — the app's base URL (e.g. `http://localhost:3000` or your production domain)
- `NEXT_PUBLIC_APP_URL` — used for SEO/OpenGraph absolute URLs

Optional (documented placeholders only, **not wired up** — see section 7):
- `S3_*` — for swapping local file storage for S3-compatible storage
- `BKASH_*` / `NAGAD_*` — for a future real payment gateway integration
- `SMTP_*` / `SMS_API_KEY` — for future email/SMS notification delivery

---

## 5. Database Schema Overview

`prisma/schema.prisma` is organized into 12 commented sections:

1. **Auth & People** — `User` (role-based: SUPER_ADMIN/ADMIN/TEACHER/STUDENT/GUARDIAN),
   `StudentProfile`, `TeacherProfile`, `GuardianProfile` (schema-ready scaffold, no UI yet),
   `PasswordResetToken`
2. **Academics** — `Subject`, `Course`, `CourseSubject`, `Batch`, `Enrollment`
3. **Admission** — `Admission` (with approve/reject/convert-to-student flow)
4. **Notices & Routine** — `Notice`, `Routine`
5. **Attendance** — `AttendanceSession`, `AttendanceRecord`
6. **Exams & Results (basic)** — `Exam`, `ResultEntry` (auto grade/GPA calculation)
7. **Fees & Payments** — `FeeInvoice`, `Payment` (manual entry; see section 7 for gateway notes)
8. **Study Materials** — `StudyMaterial`
9. **Public content** — `GalleryAlbum`, `GalleryImage`, `Achievement`, `Testimonial`, `ContactMessage`
10. **Site Settings** — `SiteSetting`, a key/value CMS-style table so Admin can edit almost all
    website content (hero text, about, contact info, feature toggles, SEO) without a migration
11. **Notifications** — `Notification` (in-app only; push notifications need VAPID/FCM — section 7)
12. **Question Bank & Online Exam (scaffold only)** — `Question`, `QuestionOption`. These models
    exist so a future Online Examination / Question Bank module can be added without an
    architecture change. **There is deliberately no API route or UI built on top of them yet** —
    see section 8 for how to add that module when you're ready.

Every bilingual field follows the `xBn` / `xEn` suffix convention (e.g. `titleBn`/`titleEn`).

---

## 6. Roles & Access Control

Four active roles: `SUPER_ADMIN`, `ADMIN`, `TEACHER`, `STUDENT` (plus a `GUARDIAN` role reserved
for the future Guardian/Parent module — schema-ready, no login flow wired up yet).

Authorization is enforced in **two layers**, per the "never trust client-side authorization alone"
requirement:

1. **Edge middleware** (`src/middleware.ts`) redirects unauthenticated or wrong-role users away
   from `/admin/*`, `/teacher/*`, `/student/*` before the page even renders.
2. **Every API route** independently re-checks the role via `requireRole()` /
   `getCurrentUser()` in `src/lib/rbac.ts` — the middleware is a UX convenience, not the security
   boundary. A request that reaches an API route with the wrong role gets a `403`, full stop,
   regardless of what the middleware did.

Ownership checks (e.g. a teacher can only enter marks for exams tied to their own batches) are
enforced inside the specific route/page, not just by role — see
`src/app/teacher/results/[id]/page.tsx` for an example.

---

## 7. What's Fully Working vs. What Needs External Configuration

Per the project's own "do not overpromise" requirement, here's the honest breakdown.

### Fully working, connected to the real database
Authentication & RBAC · Admin/Teacher/Student dashboards · Student management (via Admission →
Approve → Convert, with auto-generated unique Student ID) · Course/Subject/Batch management ·
Online Admission (public form → Admin review → student account creation) · Notices · Routine ·
Attendance (mark + history + percentage) · Exams & Results (marks entry with automatic grade/GPA
calculation) · Fee invoices & manual payment recording + printable receipt · Study materials
(with course/batch-scoped visibility) · Gallery, Achievements, Testimonials, Contact messages ·
Website Settings (CMS-style, editable without code changes) · Bangla/English UI switching ·
Responsive design (mobile-first dashboards, mobile nav) · File uploads (validated type/size, local
disk storage) · In-app notifications.

### Working, but with a clearly-scoped limitation
- **Public result search** — off by default (toggle in Admin → Website Settings) because it exposes
  marks by Student ID; enable only after confirming your own privacy policy.
- **Fee payments** — Admin/staff manually record a payment (cash collected, or a bKash/Nagad
  transaction the student completed and reported a reference number for). **This does not call any
  live payment gateway.**

### Schema-ready, but intentionally not built in this version
Building a half-working UI on top of these would violate the project's own "don't fake it" rule, so
instead the database is ready and nothing pretends to work that doesn't:

- **Online Examination / Question Bank** — `Question`, `QuestionOption` models exist; no exam-taking
  UI, timer, or auto-grading route exists yet. Add this as its own module (see section 8) when
  ready — it's a substantial feature (timed attempts, anti-cheating considerations, scoring) that
  deserves its own dedicated build pass rather than a stub.
- **Guardian/Parent accounts** — `GuardianProfile`, `StudentGuardian` models exist; no login flow,
  dashboard, or linking UI yet.
- **Multi-branch management, subscriptions, teacher marketplace, live/recorded video classes, AI
  study assistant / AI question generation, leaderboards** — not modeled yet; left for a future
  version per the roadmap, deliberately not stubbed.

### Requires your own external service credentials before it can work at all
- **Real bKash/Nagad payment gateway** — needs merchant credentials
  (`BKASH_APP_KEY`/`NAGAD_MERCHANT_ID` etc., placeholders in `.env.example`) plus a webhook/callback
  route that doesn't exist yet. Never fake a successful payment — build the real integration when
  you have real credentials.
- **Email/SMS notifications** (admission confirmations, fee reminders, password reset emails) —
  needs an SMTP or SMS provider. `PasswordResetToken` model + token-issuance pattern exists in the
  schema, ready for a `forgot-password` route once you have a provider to actually deliver the
  email.
- **Production file storage** — the current adapter (`src/lib/storage.ts`) writes to local disk
  under `/public/uploads`. This **will not persist** on a serverless/read-only-filesystem host like
  Vercel. Swap in an S3-compatible adapter before deploying there (the function signatures are
  already storage-agnostic to make this a drop-in swap).
- **Push notifications** — the `Notification` model + in-app list exists; browser/mobile push needs
  VAPID (web push) or FCM credentials.

---

## 8. Adding a New Module Later (e.g. "Add Online Examination")

This codebase is built so you can hand it back with a request like *"add Online Examination"* and
have it extended in place, without a rebuild. The pattern to follow, consistently used throughout:

1. **Schema**: add/extend models in `prisma/schema.prisma` (the Question Bank models are already
   there as a starting point). Run `npx prisma migrate dev --name add_online_exam`.
2. **Validation**: add Zod schemas to `src/lib/validations.ts`.
3. **API**: add `src/app/api/<entity>/route.ts` (list/create) and `[id]/route.ts` (get/update/delete),
   always starting with `await requireRole([...])` from `src/lib/rbac.ts`.
4. **UI**: add a form component in `src/components/dashboard/`, and page(s) under
   `src/app/admin/`, `src/app/teacher/`, and/or `src/app/student/` as appropriate, following the
   existing pages as templates.
5. **Nav**: add the new page to the relevant `NAV_ITEMS` array in `src/app/{admin,teacher,student}/layout.tsx`.

Existing features, data, and role permissions are never removed or restructured to add a new
module — only additive changes, exactly as the project's own long-term architecture requirement
specifies.

---

## 9. Manual Test Checklist

Run through this after `npm install` + `npm run dev` + `npm run seed`, since none of it could be
executed in the sandbox this project was built in:

1. [ ] `npm install` completes without errors
2. [ ] `npx prisma migrate dev` creates all tables successfully
3. [ ] `npm run seed` completes and prints the demo credentials
4. [ ] `npm run dev` starts without errors; homepage loads at `/`
5. [ ] Language switcher toggles বাংলা/English and persists across navigation
6. [ ] Admin login → redirected to `/admin`, dashboard stats load
7. [ ] Teacher login → redirected to `/teacher`
8. [ ] Student login → redirected to `/student`, profile/course/batch show correctly
9. [ ] Create a Course, Subject, Batch as Admin
10. [ ] Submit a public Admission application (as a logged-out visitor)
11. [ ] Approve the admission, convert to a student account, confirm a unique Student ID is generated
12. [ ] Log in as the newly created student
13. [ ] Create a Routine entry, publish it, confirm it shows on the public `/routine` page and the
    student's `/student/routine`
14. [ ] Create a Notice, publish + pin it, confirm it appears on the homepage
15. [ ] Mark attendance for a batch as Admin/Teacher, confirm the student sees their % on `/student/attendance`
16. [ ] Create an Exam, enter marks, publish it, confirm the student sees their grade on `/student/results`
17. [ ] Create a Fee Invoice, record a partial then full payment, confirm status transitions
    DUE → PARTIAL → PAID, and the student can view/print a receipt
18. [ ] Upload a Study Material (course-wide and batch-restricted), confirm visibility rules
19. [ ] Try accessing `/admin` while logged in as a Student → redirected to `/403`
20. [ ] Try calling an admin API route (e.g. `DELETE /api/courses/x`) directly as a Student → `403`
21. [ ] Log out, confirm session is cleared and protected pages redirect to `/login`
22. [ ] Test on a narrow mobile viewport — nav collapses to a hamburger menu, dashboards remain usable

---

## 10. Build & Deploy

```bash
npm run build
npm run start
```

For production:
1. Set all required environment variables on your host (never commit `.env`).
2. Run `npx prisma migrate deploy` against your production database (not `migrate dev`).
3. If deploying to a serverless/read-only-filesystem host (Vercel, etc.), swap the storage adapter
   in `src/lib/storage.ts` for S3-compatible storage first — local disk writes will not persist.
4. Either delete the seeded demo accounts or change their passwords immediately.
5. Set a strong, unique `NEXTAUTH_SECRET` (not the one from `.env.example`).

---

## 11. Deploying to Netlify

`netlify.toml` and `.nvmrc` are included so Netlify's build is explicit rather than
auto-detected — this avoids a real issue that came up during review: Netlify's auto-detection
can end up not running the project's own `npm run build` script (which does
`prisma generate && next build`), leaving `@prisma/client` without generated types and causing
TypeScript errors like "parameter implicitly has an `any` type" on pages that query Prisma. If you
ever see that error again after pulling fresh code, it means `prisma generate` didn't run before
the type-check — check the build log for the `prisma generate` step, and confirm Netlify is
running `npm run build` (not a bare `next build`).

Also set `DATABASE_URL` and `NEXTAUTH_SECRET` (and `NEXTAUTH_URL`/`NEXT_PUBLIC_APP_URL` set to
your live Netlify URL) under **Site settings → Environment variables** before deploying — the
public site and every dashboard page reads from the database on every request (see the
`force-dynamic` note in `src/app/(public)/layout.tsx`), so it needs a real, reachable
`DATABASE_URL` at runtime even though it doesn't need one at build time.

File uploads also need attention on Netlify specifically: its build output runs on serverless
functions with an ephemeral filesystem, so local-disk uploads (`src/lib/storage.ts`) will not
persist between requests/deploys there. Swap in an S3-compatible storage adapter before relying
on file uploads (profile photos, gallery, study materials, notice attachments) in production.

## 12. Known Limitations / Honesty Notes

- This was built and reviewed without a live database or package installation (no network access
  in the build sandbox). It has had a thorough **static** review (see below) but not a live
  functional test run. Budget time for the checklist in section 9 as your real first test pass.
- Public result search, when enabled, has no rate limiting yet — add one before enabling it on a
  high-traffic public deployment.
- The "Days" field on Batch/Routine (e.g. `"Sat, Mon, Wed"`) is a free-text field, not a structured
  multi-select — fine for V1, worth revisiting if you need machine-readable day filtering later.

### What was statically checked before delivery
- Every `@/`-alias import resolves to a real file (0 missing, checked programmatically).
- Brace/bracket/paren balance verified across all 178 TypeScript/TSX files.
- Every API route file exports at least one valid HTTP method handler.
- Every client-side `fetch()` call (including dynamic template-literal URLs) was cross-checked
  against the actual API route files and their exported HTTP methods.
- Full Prisma schema audit: every model has an `@id`, every field type resolves to a real
  model/enum/scalar, every `@relation` name pairs correctly on both sides, every compound unique
  key used in code (`examId_studentId`, `studentId_batchId`) matches the exact field order declared
  in `@@unique`.
- Every component using React hooks/event handlers is correctly marked `"use client"`; every
  server-only import (`next/headers`, `getServerSession`, `prisma`) was confirmed absent from
  client components.
- Fixed two real bugs found during a static-review pass:
  1. `Input`/`Textarea`/`Select` were dropping the native HTML `required` attribute while still
     rendering the label asterisk (client-side validation UX was silently broken).
  2. Editing a Teacher would always fail validation, because the disabled `email` field was still
     being read via `FormData` (browsers exclude disabled fields from `FormData`, so it sent
     `email: null`, which failed the server-side Zod schema).
- Fixed a real deploy-time bug caught on an actual Netlify build: `src/app/(public)/achievements/page.tsx`
  failed TypeScript's build-time type-check with "parameter implicitly has an `any` type" on a
  `.map()` over a Prisma query result. Applied explicit `Prisma.*GetPayload<...>` / model type
  annotations to that page and every sibling public page with the same pattern (notices, materials,
  routine, teachers, gallery, courses list, course detail, homepage — 9 files in total) as a
  defensive fix, added `netlify.toml` + `.nvmrc` to make the Netlify build command and Node version
  explicit rather than auto-detected, and replaced each page's `revalidate` export with an explicit
  `dynamic = "force-dynamic"` to match (and make visible) the safety net already enforced at
  `src/app/(public)/layout.tsx`, which prevents Next.js from ever needing a database connection
  during `next build`.
