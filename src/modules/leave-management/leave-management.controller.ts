import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LeaveManagementService, LeaveApplication } from './leave-management.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@ApiTags('Leave Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leaves')
export class LeaveManagementController {
  constructor(private readonly service: LeaveManagementService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HR_STAFF', 'TEACHER')
  @ApiOperation({ summary: 'List leave applications' })
  @ApiQuery({ name: 'applicantType', required: false, enum: ['STUDENT', 'STAFF'] })
  @ApiQuery({ name: 'status', required: false })
  async findAll(@Query('applicantType') applicantType?: 'STUDENT' | 'STAFF', @Query('status') status?: string) {
    return this.service.findAll(applicantType, status);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HR_STAFF', 'TEACHER', 'PARENT', 'STUDENT')
  @ApiOperation({ summary: 'Submit a new leave application' })
  async apply(@Body() body: Omit<LeaveApplication, 'id' | 'status' | 'appliedAt'>) {
    return this.service.applyLeave(body);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HR_STAFF')
  @ApiOperation({ summary: 'Approve or reject a leave application' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED' },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.updateStatus(id, body.status, user.userId);
  }
}
