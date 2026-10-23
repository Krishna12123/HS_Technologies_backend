import { Module } from '@nestjs/common';
import { QrAttendanceController } from './qr-attendance.controller';
import { QrAttendanceService } from './qr-attendance.service';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [AttendanceModule],
  controllers: [QrAttendanceController],
  providers: [QrAttendanceService],
  exports: [QrAttendanceService],
})
export class QrAttendanceModule {}
