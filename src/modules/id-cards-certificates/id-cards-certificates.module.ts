import { Module } from '@nestjs/common';
import { IdCardsCertificatesController } from './id-cards-certificates.controller';
import { IdCardsCertificatesService } from './id-cards-certificates.service';
import { StudentsModule } from '../students/students.module';
import { StaffModule } from '../staff/staff.module';
import { MockDocumentGenerator } from '../../infrastructure/document-generation/mock-document-generator';

@Module({
  imports: [StudentsModule, StaffModule],
  controllers: [IdCardsCertificatesController],
  providers: [
    IdCardsCertificatesService,
    {
      provide: 'IDocumentGenerator',
      useClass: MockDocumentGenerator,
    },
  ],
  exports: [IdCardsCertificatesService],
})
export class IdCardsCertificatesModule {}
