import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { InMemoryAttendanceRepository } from '../../infrastructure/repositories/in-memory/in-memory-attendance.repository';

@Module({
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    {
      provide: 'IAttendanceRepository',
      useClass: InMemoryAttendanceRepository,
    },
  ],
  exports: [AttendanceService, 'IAttendanceRepository'],
})
export class AttendanceModule {}
