import { Module } from '@nestjs/common';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { StaffModule } from '../staff/staff.module';
import { InMemoryPayrollRepository } from '../../infrastructure/repositories/in-memory/in-memory-payroll.repository';
import { MockDocumentGenerator } from '../../infrastructure/document-generation/mock-document-generator';

@Module({
  imports: [StaffModule],
  controllers: [PayrollController],
  providers: [
    PayrollService,
    {
      provide: 'IPayrollRepository',
      useClass: InMemoryPayrollRepository,
    },
    {
      provide: 'IDocumentGenerator',
      useClass: MockDocumentGenerator,
    },
  ],
  exports: [PayrollService],
})
export class PayrollModule {}
