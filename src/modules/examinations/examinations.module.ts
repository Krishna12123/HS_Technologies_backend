import { Module } from '@nestjs/common';
import { ExaminationsController } from './examinations.controller';
import { ExaminationsService } from './examinations.service';
import { InMemoryExamRepository } from '../../infrastructure/repositories/in-memory/in-memory-exam.repository';

@Module({
  controllers: [ExaminationsController],
  providers: [
    ExaminationsService,
    {
      provide: 'IExamRepository',
      useClass: InMemoryExamRepository,
    },
  ],
  exports: [ExaminationsService, 'IExamRepository'],
})
export class ExaminationsModule {}
