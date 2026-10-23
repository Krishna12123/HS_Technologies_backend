# School ERP Backend Development Rules & Constraints

## 1. Executive Summary & Purpose
This document establishes the binding engineering rules, architectural constraints, and compliance mandates for developing the backend of the enterprise School ERP system. All developers (**K.H**, **K.S**, **V dev**) and automated processes must strictly adhere to these rules without exception.

---

## 2. Core Constraints & Prohibitions

### 2.1. Strict Prohibitions
1. **NO Database Implementation or Connection:**
   - **Do NOT** install, configure, or connect any database engine (PostgreSQL, MySQL, MongoDB, SQLite, Redis, etc.).
   - **Do NOT** add database drivers (`pg`, `mysql2`, `mongodb`, `mongoose`, etc.).
   - **Do NOT** install ORM/ODM packages (`typeorm`, `prisma`, `mikro-orm`, `sequelize`, `mongoose`, etc.).
   - **Do NOT** create database migration files, schemas, collection definitions, SQL DDL scripts, or database connection pools.
   - **Do NOT** store database credentials or database connection strings in `.env` or application code.
2. **NO Frontend Development or Redesign:**
   - The frontend is being built independently by separate teams.
   - Do not write HTML/React/Vue/Angular frontend code or alter existing UI designs.
   - Focus exclusively on REST API endpoints (`/api/v1/*`), contracts, validations, and business logic.
3. **NO Permanent In-Memory Assumption:**
   - In-memory data structures are strictly for local developer testing, mock demonstration, and unit/integration testing.
   - All mock repositories must explicitly log and warn that data is volatile and will reset upon application restart.
   - Never treat temporary in-memory state as a production-grade source of truth for financial transactions, attendance records, payroll, or audit trails.
4. **NO False External Integration Claims:**
   - Do not claim SMS, Email, Payment Gateway (Stripe/Razorpay), or Push Notification integrations are "working live" when simulated with mock adapters.
   - All external integrations must use clean provider abstractions with explicit mock adapters returning deterministic responses and logging simulation notices.

---

## 3. Technology Stack Specifications

| Component | Standard / Selection | Version / Policy |
| :--- | :--- | :--- |
| **Runtime** | Node.js | v20+ LTS / v22+ LTS |
| **Language** | TypeScript | v5.x with strict type-checking (`strict: true`) |
| **Framework** | NestJS | v10.x Modular Monolith architecture |
| **API Style** | RESTful API | Standardized URI naming, HTTP verbs, JSON payloads |
| **API Versioning**| Global URI Prefix | `/api/v1` prefix across all controllers |
| **Documentation** | Swagger / OpenAPI | `@nestjs/swagger` with DTO annotations & examples |
| **Authentication**| JWT Tokens | Short-lived Access Tokens (15m) + Rotating Refresh Tokens (7d) |
| **Authorization** | RBAC | Role-Based Access Control via custom `@Roles()` decorator & Guards |
| **Validation** | Class Validator | `class-validator` & `class-transformer` with strict whitelisting |
| **Testing** | Jest & Supertest | Unit tests, Mock Repository tests, and Controller E2E tests |
| **Queues / Jobs** | Queue Abstraction | Generic `QueueService` interface with In-Memory dev provider, BullMQ-ready |
| **Logging** | Structured Logger | JSON-compatible logging with Correlation IDs (`x-request-id`) |
| **Deployment** | Docker & CI/CD | Multi-stage Dockerfile, docker-compose, and GitHub Actions CI workflow |

---

## 4. Architectural Rules (Repository Pattern & Database Independence)

### 4.1. Clean Architecture Separation of Concerns
1. **Controllers** must solely handle HTTP request mapping, parameter extraction, invoking application services, and returning standardized API responses. Controllers must **NEVER** import or access repository interfaces or mock data directly.
2. **Application Services** must encapsulate all business logic, orchestration, validation rules, state transitions, and calculations. Services must depend **strictly on Repository Interfaces** via NestJS Dependency Injection tokens (e.g., `@Inject('IUserRepository') private readonly userRepo: IUserRepository`).
3. **Domain Models & DTOs** must be defined purely as TypeScript classes and interfaces, completely independent of any ORM decorators or persistence technologies.
4. **Repository Interfaces (`I*Repository`)** define pure asynchronous contracts (`Promise<T>`) for data access operations, concurrency checks, and transactional unit-of-work handling.
5. **Mock/In-Memory Adapters** implement these repository interfaces. They must be isolated in `src/infrastructure/repositories/in-memory/` and bound in NestJS modules using symbol/string tokens.

### 4.2. Future Database Integration Handover Rule
- Swapping the in-memory adapters with real ORM/Database repositories in the future **must require zero changes to Application Services and Controllers**.
- Every repository interface must explicitly declare expected error behaviors (e.g., `EntityNotFoundException`, `ConflictException`, `ConcurrencyException`).

---

## 5. Security & Authentication Rules

### 5.1. Authentication Architecture
1. **Password Security:** All user passwords must be hashed using `bcrypt` (or `argon2`) with a minimum of 10 salt rounds. Plaintext passwords must **never** be logged, returned in responses, or held in unhashed memory structures.
2. **Tokens:**
   - **Access Token:** Short lifespan (15 minutes), containing `sub` (userId), `email`, `role`, and `schoolId`.
   - **Refresh Token:** Long lifespan (7 days), hashed when stored in memory, supporting rotation and explicit invalidation upon logout.
3. **Login Protection:** Implement rate-limiting guards on `/api/v1/auth/login` to prevent brute-force attacks.

### 5.2. Role-Based Access Control (RBAC) Matrix
The system recognizes 10 distinct user roles. Access to endpoints must be guarded with `@Roles(...)` and `@UseGuards(JwtAuthGuard, RolesGuard)`.

1. **Super Admin:** Multi-tenant platform administrator; full system access.
2. **School Admin:** Head of school operations; manages staff, academic settings, students, and masters.
3. **Accountant:** Manages fee structures, invoices, payment reconciliations, expenses, and financial accounts.
4. **Teacher:** Manages attendance, timetable, syllabus, marks entry, and student reports.
5. **HR / Payroll Staff:** Manages staff records, salary structures, payroll runs, payslips, and staff leaves.
6. **Librarian:** Manages book catalog, issue/return circulation, library members, and overdue fines.
7. **Transport Manager:** Manages routes, vehicle allocations, drivers, and transport fees.
8. **Front Desk Staff:** Manages visitor logs, phone logs, front desk enquiries, and postal dispatch.
9. **Parent:** Read-only access to their enrolled wards' attendance, marks, report cards, fee ledgers, and online payment checkout.
10. **Student:** Read-only access to their own timetable, attendance, exams, results, library loans, and school notices.

---

## 6. Financial & Payment Security Rules

Payment workflows require strict compliance with financial integrity standards:
1. **Server-Side Initiation Only:** Payment sessions (`/api/v1/payments/checkout`) must be initialized server-side. The payable amount must be calculated directly from the invoice ledger, never trusted from client-provided amounts.
2. **Webhook Signature Verification:** Webhook payloads must be verified against cryptographic HMAC signatures before processing.
3. **Idempotency Enforcement:** Every payment transaction and webhook event must accept an `Idempotency-Key` or event ID to prevent duplicate credit/debit operations.
4. **Strict State Machine:** Payments must transition through explicit states:
   `PENDING -> IN_VERIFICATION -> COMPLETED | FAILED | REFUSED -> REFUNDED`.
5. **Receipt Generation Guard:** Receipts (`GET /api/v1/receipts/:id/download`) must only be issued for payments verified as `COMPLETED`.
6. **Never Trust Frontend Redirects:** Payment status cannot be marked as paid based solely on frontend query parameters or client-side callbacks.

---

## 7. Operational & API Standards

### 7.1. Unified Response Envelope
All controller endpoints must return responses adhering to the unified envelope:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {
    "requestId": "uuid-v4",
    "timestamp": "2026-10-23T18:00:00.000Z",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 7.2. Error Handling Envelope
Exceptions intercepted by the global `HttpExceptionFilter` must return:
```json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed or business rule violation",
  "details": [],
  "meta": {
    "requestId": "uuid-v4",
    "timestamp": "2026-10-23T18:00:00.000Z"
  }
}
```

### 7.3. Input Validation
- All incoming payloads must be typed DTOs decorated with `class-validator` rules.
- NestJS `ValidationPipe` must be configured with `{ whitelist: true, forbidNonWhitelisted: true, transform: true }`.

---

## 8. Development Discipline & Quality Gates
1. **Compilation:** Code must compile cleanly with `npm run build` without any TypeScript errors.
2. **Linting:** Code must pass standard ESLint rules.
3. **Testing:** All core business services (Fee calculation, Examination marks, Attendance validation, Payroll, Inventory stock checks) must have automated unit tests executed via Jest.
4. **Safety:** Sensitive secrets (passwords, tokens, payment secrets) must **never** be logged.
