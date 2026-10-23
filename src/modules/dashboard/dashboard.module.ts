import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { StudentsModule } from '../students/students.module';
import { StaffModule } from '../staff/staff.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { FeeManagementModule } from '../fee-management/fee-management.module';
import { LibraryModule } from '../library/library.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    StudentsModule,
    StaffModule,
    AttendanceModule,
    FeeManagementModule,
    LibraryModule,
    InventoryModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
