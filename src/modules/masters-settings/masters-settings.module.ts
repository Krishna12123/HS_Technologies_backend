import { Module } from '@nestjs/common';
import { MastersSettingsController } from './masters-settings.controller';
import { MastersSettingsService } from './masters-settings.service';

@Module({
  controllers: [MastersSettingsController],
  providers: [MastersSettingsService],
  exports: [MastersSettingsService],
})
export class MastersSettingsModule {}
