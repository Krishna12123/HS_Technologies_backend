import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global REST API prefix: /api/v1
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Global DTO Validation and Transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS Policy
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',');
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable Graceful Shutdown hooks
  app.enableShutdownHooks();

  // Swagger / OpenAPI Specification Setup
  const config = new DocumentBuilder()
    .setTitle('School ERP Backend API')
    .setDescription(
      `Enterprise School ERP Backend REST APIs.
      
      Architectural Specifications:
      - Modular Monolith Architecture
      - Clean Hexagonal Architecture (Repository Pattern)
      - Volatile In-Memory Dev/Testing Adapters (Database Independent)
      - RBAC Security with JWT Token Rotation
      - Versioned Base URL: /api/v1`,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT Access Token',
        in: 'header',
      },
      'bearer',
    )
    .addTag('Authentication', 'JWT login, session refresh, logout, profile')
    .addTag('Users', 'User accounts CRUD and status management')
    .addTag('Roles & Permissions', 'RBAC matrix and access control catalogs')
    .addTag('Students', 'Student admission records, attendance, fee ledger')
    .addTag('Admissions', 'Student admission applications & enrollment workflow')
    .addTag('Staff', 'Teaching and operational staff profiles')
    .addTag('Academic Years', 'Academic sessions and active term toggle')
    .addTag('Classes & Sections', 'Classes, sections, and classroom capacity')
    .addTag('Masters & Settings', 'School profile and institutional configuration')
    .addTag('Attendance', 'Student/Staff attendance with duplicate check protection')
    .addTag('QR Attendance', 'Cryptographic time-bounded (60s TTL) QR check-in')
    .addTag('Academics', 'Subject catalog and syllabus milestones')
    .addTag('Examinations', 'Exams and scheduling with conflict detection')
    .addTag('Results & Grading', 'Marks entry, grade computation, result cards')
    .addTag('Admit Cards', 'Hall tickets with fee dues and attendance clearance check')
    .addTag('ID Cards & Certificates', 'Student/Staff ID cards and Transfer Certificates')
    .addTag('Leave Management', 'Student and staff leave application workflow')
    .addTag('School Bell & Timetable Events', 'Automated bell triggers and periods')
    .addTag('Messaging & Parent-Student Communication', 'Broadcast announcements and notices')
    .addTag('Front Desk & Visitor Management', 'Visitor badges and check-in/out')
    .addTag('Fee Management & Fee Structures', 'Fee heads, classes, instalment plans')
    .addTag('Fee Ledger & Invoices', 'Invoicing engine and real-time student balances')
    .addTag('Payments & Checkout', 'Server-side checkout, idempotency, webhook signatures, receipts')
    .addTag('Payment Reconciliation', 'Bank statement settlement reconciliation')
    .addTag('Payroll & Salary Calculations', 'Salary structures, monthly runs, payslips')
    .addTag('Accounts & Expenses', 'Expenditure vouchers and income vs expense reports')
    .addTag('Inventory & Stock Management', 'Stock movements and negative stock protection')
    .addTag('Library Management & Circulation', 'Book loans, borrowing limits, overdue fines')
    .addTag('Transport & Fleet Management', 'Bus routes, seat capacity enforcement, student allocation')
    .addTag('Dashboard & Executive Analytics', 'Executive statistics and institutional KPIs')
    .addTag('Reports Engine', 'Statutory and analytical reporting catalog')
    .addTag('Audit Logs', 'Chronological immutable system action audit trail')
    .addTag('Health & Readiness Probes', 'Liveness and environment probe')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`=============================================================`);
  logger.log(`🚀 School ERP Backend successfully started on port ${port}`);
  logger.log(`📖 Swagger API Documentation available at: http://localhost:${port}/api/docs`);
  logger.log(`🔒 Environment Mode: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`💾 Persistence Adapter: IN-MEMORY REPOSITORY (Database Independent)`);
  logger.log(`=============================================================`);
}

bootstrap();
