# 4-Day Development Schedule & Work Breakdown Structure (WBS)

## 1. Project Overview & Team Allocation

- **Total Duration:** 4 Days (96 Working Hours cumulative per developer)
- **Target:** Production-ready, database-independent School ERP Backend (NestJS / TypeScript)
- **Engineering Team:**
  - **K.H:** Lead Backend & Security Architect — Core Infrastructure, Identity, People & Operations
  - **K.S:** Senior Backend Engineer — Academics, Examinations, Documents & Logistics
  - **V dev:** Senior Backend & FinTech Engineer — Finance, Payments, Payroll, Inventory & Executive Analytics

---

## 2. Daily Schedule Matrix

```mermaid
gantt
    title 4-Day Backend Sprint Roadmap
    dateFormat  YYYY-MM-DD
    section K.H (Security & People)
    Day 1: Project Setup, Auth, RBAC, Users, Base Repos    :kh1, 2026-10-24, 1d
    Day 2: Students, Admissions, Staff, Classes, Masters    :kh2, 2026-10-25, 1d
    Day 3: Attendance, QR Attendance, Leaves, Timetable    :kh3, 2026-10-26, 1d
    Day 4: Front Desk, Audit Logs, Integration & E2E       :kh4, 2026-10-27, 1d
    section K.S (Academics & Logistics)
    Day 1: Academics, Subjects, Exam Scheduling Engine     :ks1, 2026-10-24, 1d
    Day 2: Marks Entry, Grading, Results & Reports         :ks2, 2026-10-25, 1d
    Day 3: Document Gen Port, Admit Cards, Certificates     :ks3, 2026-10-26, 1d
    Day 4: Library Circulation, Transport Routes & Stops   :ks4, 2026-10-27, 1d
    section V dev (Finance & Analytics)
    Day 1: Fee Masters, Invoicing, Student Fee Ledgers      :vd1, 2026-10-24, 1d
    Day 2: Payment Gateway, Webhooks, Idempotency, Receipts :vd2, 2026-10-25, 1d
    Day 3: Payroll Engine, Payslips, Accounts & Expenses   :vd3, 2026-10-26, 1d
    Day 4: Inventory, Dashboard KPIs, Health, CI/CD Docker  :vd4, 2026-10-27, 1d
```

---

## 3. Day-by-Day Detailed Developer Responsibilities

### DAY 1: Foundation, Identity, Scheduling & Invoicing

#### Developer 1: K.H (Core Infrastructure, Security & Base Repositories)
- **Daily Focus:** Foundational NestJS framework setup, cross-cutting layers, JWT authentication, and RBAC matrix.
- **Tasks & Modules:**
  1. Initialize NestJS core project with TypeScript, ESLint, Prettier, Swagger OpenAPI.
  2. Implement `common/` layer:
     - `TransformResponseInterceptor` (`{ success, statusCode, message, data, meta }`).
     - `HttpExceptionFilter` (standardized error payload).
     - `LoggingInterceptor` with correlation ID (`x-request-id`).
     - `JwtAuthGuard`, `RolesGuard`, and `@Roles()` decorator.
  3. Define base repository contracts (`IRepository<T>`, `IUnitOfWork`).
  4. Implement `modules/auth/`:
     - Password hashing (`bcrypt` 10 rounds).
     - `POST /api/v1/auth/login` (rate-limited, returns access + refresh token).
     - `POST /api/v1/auth/refresh` (token rotation).
     - `POST /api/v1/auth/logout` (revocation).
     - `GET /api/v1/auth/me`.
  5. Implement `modules/users/` and `modules/roles-permissions/`:
     - 10 roles configuration and permission mapping.
     - `GET /api/v1/users`, `POST /api/v1/users`, `GET /api/v1/users/:id`, `PATCH /api/v1/users/:id`.
     - `GET /api/v1/roles`, `GET /api/v1/permissions`.
- **Deliverables & Tests:**
  - Auth unit tests (login, invalid password, token expiry, refresh token rotation).
  - RBAC guard tests verifying 10 roles permissions.

#### Developer 2: K.S (Academics & Examination Foundations)
- **Daily Focus:** Academic curriculum catalog, syllabus management, and exam scheduling conflict detection.
- **Tasks & Modules:**
  1. Implement `modules/academics/`:
     - Subjects catalog, subject types (Core, Elective, Practical), syllabus milestones.
     - Class-subject teacher allocations.
     - `GET /api/v1/academics/subjects`, `POST /api/v1/academics/subjects`.
     - `GET /api/v1/academics/syllabus`, `POST /api/v1/academics/syllabus`.
  2. Implement `modules/examinations/`:
     - Exam periods (Term 1, Midterm, Final), exam types, grading criteria.
     - `POST /api/v1/exams`, `GET /api/v1/exams`, `GET /api/v1/exams/:id`.
     - Exam scheduling engine: `POST /api/v1/exams/:id/schedules`.
     - **Business Rule:** Collision detection preventing room double-booking or assigning the same teacher to invigilate multiple exams simultaneously.
- **Deliverables & Tests:**
  - Exam scheduling conflict detector unit tests (time overlap, teacher clash, hall capacity).

#### Developer 3: V dev (Fee Structure & Invoicing Engine)
- **Daily Focus:** Fee masters, recurring fee schedules, student ledgers, and automated invoicing.
- **Tasks & Modules:**
  1. Implement `modules/fee-management/`:
     - Fee heads (Tuition, Transport, Science Lab, Sports, Admission).
     - Fee structures by Class and Academic Year.
     - Concession/scholarship rules and instalment plans.
     - `GET /api/v1/fee-structures`, `POST /api/v1/fee-structures`.
  2. Implement `modules/fee-ledger/`:
     - Student fee accounts, real-time balance tracking (debit/credit ledger).
     - Automated invoice generation engine for terms and annual charges.
     - `GET /api/v1/invoices`, `POST /api/v1/invoices`, `GET /api/v1/invoices/:id`.
     - `GET /api/v1/fee-accounts/:studentId`.
     - **Business Rule:** Real-time computation of outstanding balance = `Total Invoiced - Total Concessions - Total Verified Payments`.
- **Deliverables & Tests:**
  - Unit tests for fee structure validation and ledger balance calculations.

---

### DAY 2: People Management, Marks Processing & Payment Processing

#### Developer 1: K.H (Students, Admissions, Staff & School Structure)
- **Daily Focus:** Complete student admissions pipeline, staff management, academic sessions, and classes.
- **Tasks & Modules:**
  1. Implement `modules/students/` & `modules/admissions/`:
     - Student profile creation, admission number sequencing, sibling mapping.
     - Admission enquiry conversion into enrolled student.
     - `GET /api/v1/students`, `POST /api/v1/students`, `GET /api/v1/students/:id`, `PATCH /api/v1/students/:id`.
     - `POST /api/v1/admissions/enroll`.
  2. Implement `modules/staff/`:
     - Staff profiles, departments, designations, employment contracts.
     - `GET /api/v1/staff`, `POST /api/v1/staff`, `GET /api/v1/staff/:id`, `PATCH /api/v1/staff/:id`.
  3. Implement `modules/academic-years/`, `modules/classes-sections/`, `modules/masters-settings/`:
     - Academic sessions, terms, active year toggling.
     - Classes, sections, class capacity enforcement, section head teacher assignment.
     - Master configurations (school branding, house system, blood groups).
- **Deliverables & Tests:**
  - Unique admission number validation tests, class capacity limit tests.

#### Developer 2: K.S (Marks Entry, Result Computation & Grading Engine)
- **Daily Focus:** Subject-wise marks submission, statistical validation, CGPA calculation, and report generation.
- **Tasks & Modules:**
  1. Implement `modules/results-grading/`:
     - Marks entry endpoints: `POST /api/v1/exams/:id/marks`, `GET /api/v1/exams/:id/marks`.
     - Marks validation: Min/Max marks enforcement, grade boundaries (A1: 91-100, A2: 81-90, etc.).
     - Pass/Fail evaluation, grace marks calculation.
     - Result publishing workflow: `POST /api/v1/results/:id/publish`.
     - Student report card summary: `GET /api/v1/exams/:id/results/student/:studentId`.
- **Deliverables & Tests:**
  - Grading algorithm tests (edge scores 0, 100, negative marks rejection, GPA/percentage rounding).

#### Developer 3: V dev (Payment Gateway, Webhooks, Idempotency & Reconciliation)
- **Daily Focus:** Secure financial transactions, server-side checkout, webhook signature verification, and receipts.
- **Tasks & Modules:**
  1. Implement `infrastructure/payment-gateways/`:
     - `IPaymentGatewayProvider` interface and `MockPaymentGatewayProvider`.
  2. Implement `modules/payments/`:
     - `POST /api/v1/payments/checkout` (calculates server-side payable amount, issues idempotency key).
     - `GET /api/v1/payments`, `GET /api/v1/payments/:id/status`.
     - `POST /api/v1/payments/:id/refund`.
  3. Implement Webhook processing:
     - `POST /api/v1/webhooks/payments/:provider`.
     - HMAC SHA-256 signature verification, duplicate webhook deduplication.
     - Automatic ledger updating upon verified payment.
  4. Implement `modules/reconciliation/` & Receipts:
     - `POST /api/v1/payments/:id/reconcile`.
     - `GET /api/v1/receipts/:id/download` (only available for COMPLETED payments).
- **Deliverables & Tests:**
  - Idempotency tests, invalid signature rejection tests, duplicate webhook safety tests.

---

### DAY 3: School Operations, Documents & Payroll Engine

#### Developer 1: K.H (Attendance, QR Codes, Leaves & School Bell)
- **Daily Focus:** Student/staff attendance, secure QR code verification, leave approval hierarchy, and bells.
- **Tasks & Modules:**
  1. Implement `modules/attendance/`:
     - Daily student & staff attendance marking (Present, Absent, Late, Half-Day).
     - Duplicate attendance check prevention.
     - `GET /api/v1/attendance`, `POST /api/v1/attendance`, `GET /api/v1/attendance/reports`.
  2. Implement `modules/qr-attendance/`:
     - Dynamic time-limited QR token generation (60-second TTL).
     - `POST /api/v1/attendance/qr/generate`, `POST /api/v1/attendance/qr/verify`.
     - Cryptographic verification to prevent attendance spoofing.
  3. Implement `modules/leave-management/`:
     - Leave types (Casual, Sick, Earned, Maternity).
     - Multi-level approval workflow (Applied -> Approved / Rejected).
     - `GET /api/v1/leaves`, `POST /api/v1/leaves`, `PATCH /api/v1/leaves/:id/status`.
  4. Implement `modules/school-bell/` & `modules/messaging/`:
     - Period timetable events and automated bell schedules.
     - Notice board announcements and parent broadcasts.
- **Deliverables & Tests:**
  - QR token expiration tests, duplicate daily attendance prevention tests, leave approval state machine tests.

#### Developer 2: K.S (Document Generation, Admit Cards & Certificates)
- **Daily Focus:** Printable artifact generators, admit cards with fee clearance checks, and transfer certificates.
- **Tasks & Modules:**
  1. Implement `infrastructure/document-generation/`:
     - `IDocumentGenerator` interface and `MockDocumentGenerator`.
  2. Implement `modules/admit-cards/`:
     - `GET /api/v1/admit-cards/:examId/student/:studentId`.
     - **Business Rule:** Admit card generation blocked if student attendance < 75% or has overdue fee balance.
  3. Implement `modules/id-cards-certificates/`:
     - Student & staff ID card generation: `GET /api/v1/id-cards/student/:id`.
     - Transfer Certificate (TC) generation: `POST /api/v1/certificates/transfer`.
     - Bonafide & Character certificates: `POST /api/v1/certificates/bonafide`.
- **Deliverables & Tests:**
  - Unit tests for admit card eligibility blocker (attendance & fee checks).

#### Developer 3: V dev (Payroll Engine & Accounts Expenses)
- **Daily Focus:** Staff salary structures, automated monthly payroll batches, payslips, and school accounting.
- **Tasks & Modules:**
  1. Implement `modules/payroll/`:
     - Salary masters (Basic Pay, HRA, DA, Special Allowance, PF, Professional Tax, TDS).
     - Monthly payroll batch execution: `POST /api/v1/payroll/runs`.
     - Approval workflow: `POST /api/v1/payroll/runs/:id/approve`.
     - Digital payslip generation: `GET /api/v1/payroll/slips/:id`.
  2. Implement `modules/accounts-expenses/`:
     - Chart of accounts (Assets, Liabilities, Income, Expenses).
     - Expense vouchers, vendor invoicing, petty cash disbursements.
     - `GET /api/v1/accounts/expenses`, `POST /api/v1/accounts/expenses`.
     - `GET /api/v1/accounts/reports/income-vs-expense`.
- **Deliverables & Tests:**
  - Payroll calculation tests (correct allowance addition, statutory deductions, net pay accuracy).

---

### DAY 4: Logistics, Analytics, Hardening, CI/CD & Final Delivery

#### Developer 1: K.H (Front Desk, Audit Trail, Security Hardening & Integration)
- **Daily Focus:** Visitor logs, front desk operations, immutable audit logging, security review, and E2E validation.
- **Tasks & Modules:**
  1. Implement `modules/front-desk/`:
     - Visitor check-in/out badges, phone call logs, postal dispatches, front-desk enquiries.
     - `GET /api/v1/front-desk/visitors`, `POST /api/v1/front-desk/visitors`, `PATCH /api/v1/front-desk/visitors/:id/checkout`.
  2. Implement `modules/audit-logs/`:
     - Immutable event recording (`userId`, `ipAddress`, `action`, `resource`, `timestamp`).
     - `GET /api/v1/audit-logs`.
  3. Security Hardening:
     - Helmet security headers, CORS origins whitelisting, rate limiting rules, payload size limits.
  4. Lead end-to-end integration with K.S & V dev.
- **Deliverables & Tests:**
  - Security suite tests and audit log retention tests.

#### Developer 2: K.S (Library Circulation, Transport Logistics & Academic E2E)
- **Daily Focus:** Book cataloging, circulation engine with overdue fines, transport routes, and fleet allocation.
- **Tasks & Modules:**
  1. Implement `modules/library/`:
     - Book catalog management (ISBN, Title, Author, Copies count).
     - Book issue, renewal, and return: `POST /api/v1/library/loans`, `POST /api/v1/library/loans/:id/return`.
     - Overdue fine calculation: `GET /api/v1/library/overdue`.
     - **Business Rule:** Prevent loan if student already holds max allowed books (e.g., 3 books) or has unpaid overdue fines.
  2. Implement `modules/transport/`:
     - Routes, stops, fare stages, vehicles, driver allocation.
     - Student route allocation: `POST /api/v1/transport/allocations`.
     - **Business Rule:** Capacity enforcement preventing overbooking bus seats.
  3. E2E tests for academic year transitions and logistics.
- **Deliverables & Tests:**
  - Library borrowing limits and overdue calculation tests; transport capacity overload tests.

#### Developer 3: V dev (Inventory, Dashboard KPIs, Health Probes, Docker & CI/CD)
- **Daily Focus:** Inventory movements, consolidated executive dashboard, health probes, Docker packaging, and CI/CD.
- **Tasks & Modules:**
  1. Implement `modules/inventory/`:
     - Inventory items, categories, reorder levels.
     - Stock movements (INWARD, OUTWARD, ADJUSTMENT, WRITE_OFF).
     - `GET /api/v1/inventory/items`, `POST /api/v1/inventory/items`, `POST /api/v1/inventory/stock-movements`.
  2. Implement `modules/dashboard/` & `modules/reports/`:
     - Executive summary API: `GET /api/v1/dashboard/summary` (Enrollment, Attendance %, Collected Fees, Dues, Staff Attendance).
     - Comprehensive reports: `GET /api/v1/reports`.
  3. Implement `modules/health/`:
     - System health and readiness probes: `GET /api/v1/health`.
  4. Infrastructure & Deployment:
     - Multi-stage `Dockerfile`, `docker-compose.yml`, GitHub Actions workflow (`.github/workflows/ci.yml`).
     - `.env.example` with documented environment variables.
- **Deliverables & Tests:**
  - Inventory negative stock prevention tests, dashboard aggregation tests, Docker build verification.

---

## 4. Daily Synchronization & Quality Checkpoints

| Time | Event | Objective |
| :--- | :--- | :--- |
| **09:00 - 09:20** | **Daily Standup** | 20-min sync: review previous day commits, blockers, API contract dependencies. |
| **13:00 - 13:15** | **Midday Checkpoint** | Interface compatibility check between modules. |
| **17:00 - 18:00** | **Code Review & Merge** | Peer review pull requests against `rule.md` standards; execute test suites. |
| **18:00 - 18:30** | **Daily Tag & Build** | Tag daily release milestone and ensure clean build. |
