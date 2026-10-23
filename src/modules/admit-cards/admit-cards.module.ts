import { Module } from '@nestjs/common';
import { AdmitCardsController } from './admit-cards.controller';
import { AdmitCardsService } from './admit-cards.service';
import { StudentsModule } from '../students/students.module';
import { ExaminationsModule } from '../examinations/examinations.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { InMemoryFeeRepository } from '../../infrastructure/repositories/in-memory/in-memory-fee.repository';
import { MockDocumentGenerator } from '../../infrastructure/document-generation/mock-document-generator';

@Module({
  imports: [StudentsModule, ExaminationsModule, AttendanceModule],
  controllers: [AdmitCardsController],
  providers: [
    AdmitCardsService,
    {
      provide: 'IFeeRepository',
      useClass: InMemoryFeeRepository,
    },
    {
      provide: 'IDocumentGenerator',
      useClass: MockDocumentGenerator,
    },
  ],
  exports: [AdmitCardsService],
})
export class AdmitCardsModule {}
