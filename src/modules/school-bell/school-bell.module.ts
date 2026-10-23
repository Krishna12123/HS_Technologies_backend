import { Module } from '@nestjs/common';
import { SchoolBellController } from './school-bell.controller';
import { SchoolBellService } from './school-bell.service';

@Module({
  controllers: [SchoolBellController],
  providers: [SchoolBellService],
  exports: [SchoolBellService],
})
export class SchoolBellModule {}
