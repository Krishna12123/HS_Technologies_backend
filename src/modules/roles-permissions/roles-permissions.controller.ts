import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesPermissionsService } from './roles-permissions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class RolesPermissionsController {
  constructor(private readonly service: RolesPermissionsService) {}

  @Get('roles')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HR_STAFF')
  @ApiOperation({ summary: 'List all ERP system roles and capabilities' })
  async getRoles() {
    return this.service.getRoles();
  }

  @Get('permissions')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  @ApiOperation({ summary: 'List all granular security permissions' })
  async getPermissions() {
    return this.service.getPermissions();
  }
}
