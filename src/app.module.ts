import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

// Cross-cutting Providers
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Domain Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesPermissionsModule } from './modules/roles-permissions/roles-permissions.module';
import { StudentsModule } from './modules/students/students.module';
import { AdmissionsModule } from './modules/admissions/admissions.module';
import { StaffModule } from './modules/staff/staff.module';
import { AcademicYearsModule } from './modules/academic-years/academic-years.module';
import { ClassesSectionsModule } from './modules/classes-sections/classes-sections.module';
import { MastersSettingsModule } from './modules/masters-settings/masters-settings.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { QrAttendanceModule } from './modules/qr-attendance/qr-attendance.module';
import { AcademicsModule } from './modules/academics/academics.module';
import { ExaminationsModule } from './modules/examinations/examinations.module';
import { ResultsGradingModule } from './modules/results-grading/results-grading.module';
import { AdmitCardsModule } from './modules/admit-cards/admit-cards.module';
import { IdCardsCertificatesModule } from './modules/id-cards-certificates/id-cards-certificates.module';
import { LeaveManagementModule } from './modules/leave-management/leave-management.module';
import { SchoolBellModule } from './modules/school-bell/school-bell.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { FrontDeskModule } from './modules/front-desk/front-desk.module';
import { FeeManagementModule } from './modules/fee-management/fee-management.module';
import { FeeLedgerModule } from './modules/fee-ledger/fee-ledger.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReconciliationModule } from './modules/reconciliation/reconciliation.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { AccountsExpensesModule } from './modules/accounts-expenses/accounts-expenses.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { LibraryModule } from './modules/library/library.module';
import { TransportModule } from './modules/transport/transport.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UsersModule,
    RolesPermissionsModule,
    StudentsModule,
    AdmissionsModule,
    StaffModule,
    AcademicYearsModule,
    ClassesSectionsModule,
    MastersSettingsModule,
    AttendanceModule,
    QrAttendanceModule,
    AcademicsModule,
    ExaminationsModule,
    ResultsGradingModule,
    AdmitCardsModule,
    IdCardsCertificatesModule,
    LeaveManagementModule,
    SchoolBellModule,
    MessagingModule,
    FrontDeskModule,
    FeeManagementModule,
    FeeLedgerModule,
    PaymentsModule,
    ReconciliationModule,
    PayrollModule,
    AccountsExpensesModule,
    InventoryModule,
    LibraryModule,
    TransportModule,
    DashboardModule,
    ReportsModule,
    AuditLogsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalHttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
