import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { InMemoryStaffRepository } from '../../infrastructure/repositories/in-memory/in-memory-staff.repository';

@Module({
  controllers: [StaffController],
  providers: [
    StaffService,
    {
      provide: 'IStaffRepository',
      useClass: InMemoryStaffRepository,
    },
  ],
  exports: [StaffService, 'IStaffRepository'],
})
export class StaffModule {}
