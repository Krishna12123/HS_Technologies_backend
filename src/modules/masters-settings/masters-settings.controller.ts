import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MastersSettingsService, SchoolSettings } from './masters-settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Masters & Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('masters-settings')
export class MastersSettingsController {
  constructor(private readonly service: MastersSettingsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT', 'FRONT_DESK')
  @ApiOperation({ summary: 'Get school masters and institutional configuration' })
  async getSettings() {
    return this.service.getSettings();
  }

  @Patch()
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Update institutional configuration settings' })
  async updateSettings(@Body() body: Partial<SchoolSettings>) {
    return this.service.updateSettings(body);
  }
}
