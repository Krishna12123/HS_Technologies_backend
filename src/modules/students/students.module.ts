import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { InMemoryStudentRepository } from '../../infrastructure/repositories/in-memory/in-memory-student.repository';
import { InMemoryAttendanceRepository } from '../../infrastructure/repositories/in-memory/in-memory-attendance.repository';
import { InMemoryFeeRepository } from '../../infrastructure/repositories/in-memory/in-memory-fee.repository';

@Module({
  controllers: [StudentsController],
  providers: [
    StudentsService,
    {
      provide: 'IStudentRepository',
      useClass: InMemoryStudentRepository,
    },
    {
      provide: 'IAttendanceRepository',
      useClass: InMemoryAttendanceRepository,
    },
    {
      provide: 'IFeeRepository',
      useClass: InMemoryFeeRepository,
    },
  ],
  exports: [StudentsService, 'IStudentRepository'],
})
export class StudentsModule {}
