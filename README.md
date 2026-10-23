# Enterprise School ERP Backend (Database-Independent Architecture)

![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.x-blue)
![NestJS](https://img.shields.io/badge/NestJS-v10.x-red)
![Architecture](https://img.shields.io/badge/Architecture-Modular%20Monolith-orange)
![Persistence](https://img.shields.io/badge/Persistence-In--Memory%20Repository%20Pattern-yellow)

## 1. System Overview

This project is the complete, secure, enterprise-grade backend for a **School ERP** system. Designed as a **Modular Monolith** using **NestJS** and **TypeScript**, it follows clean hexagonal architecture principles.

### Key Architectural Tenet: Database Independence
The backend is completely decoupled from any physical database engine or ORM.
- **Controllers** communicate exclusively with **Application Services**.
- **Services** depend strictly on **Domain Repository Interfaces** (`IUserRepository`, `IStudentRepository`, `IFeeRepository`, etc.) via NestJS Dependency Injection.
- High-fidelity **In-Memory Mock Adapters** provide complete local functionality, validation, and automated testing.
- When production database integration begins (Phase 2), **not a single line of business logic or controller code will need to be rewritten**.

---

## 2. Key Documentation Files
- [`rule.md`](file:///Users/krishnashukla/Desktop/HS_Technologies/rule.md): Strict development rules, constraints, RBAC matrix, and financial security mandates.
- [`architecture.md`](file:///Users/krishnashukla/Desktop/HS_Technologies/architecture.md): Technical architecture specification, domain boundaries, hexagonal ports & adapters, and database handover plan.
- [`days.md`](file:///Users/krishnashukla/Desktop/HS_Technologies/days.md): 4-day sprint work breakdown structure divided between **K.H**, **K.S**, and **V dev**.
- [`protocol.md`](file:///Users/krishnashukla/Desktop/HS_Technologies/protocol.md): The Master Engineering Protocol joining rules, architecture, and schedule into a unified handbook.

---

## 3. Technology Stack

- **Runtime:** Node.js (v20+ LTS)
- **Language:** TypeScript 5.x
- **Framework:** NestJS 10.x
- **API Style:** REST API with global versioning prefix `/api/v1`
- **Documentation:** Interactive Swagger / OpenAPI available at `/api/docs`
- **Security:** JWT Access Tokens (15m) + Refresh Token Rotation (7d), RBAC with 10 roles
- **Testing:** Automated unit and E2E suites via Jest & Supertest
- **Containerization:** Multi-stage Dockerfile and docker-compose

---

## 4. Local Development Quickstart

### Prerequisites
- Node.js v20+ or v22+
- npm v10+

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
Copy the template `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Step 3: Run the Application
```bash
# Development mode with live reload
npm run start:dev

# Or standard production build
npm run build
npm run start:prod
```

Once started:
- **API Base URL:** `http://localhost:3000/api/v1`
- **Interactive Swagger UI:** `http://localhost:3000/api/docs`
- **Health Probe:** `http://localhost:3000/api/v1/health`

---

## 5. Development Test Credentials

The in-memory mock repository automatically seeds representative test accounts with password `Password@123`:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@schoolerp.internal` | `Password@123` |
| **School Admin** | `principal@schoolerp.internal` | `Password@123` |
| **Teacher** | `teacher@schoolerp.internal` | `Password@123` |
| **Accountant** | `accountant@schoolerp.internal` | `Password@123` |
| **Parent** | `parent@schoolerp.internal` | `Password@123` |
| **Student** | `student@schoolerp.internal` | `Password@123` |

---

## 6. Running Automated Tests

```bash
# Execute unit test suites
npm run test

# Run tests with code coverage report
npm run test:cov
```

---

## 7. Future Database Integration Handover

To plug in a persistent database (PostgreSQL, MySQL, etc.):
1. Create concrete repository implementations under `src/infrastructure/repositories/database/` implementing the respective `I*Repository` interfaces.
2. In each NestJS domain module (e.g., `students.module.ts`), update the provider token:
   ```typescript
   {
     provide: 'IStudentRepository',
     useClass: PostgresStudentRepository, // replaced InMemoryStudentRepository
   }
   ```
3. No domain service or controller changes are required.
