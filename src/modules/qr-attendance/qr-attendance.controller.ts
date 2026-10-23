import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QrAttendanceService } from './qr-attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@ApiTags('QR Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance/qr')
export class QrAttendanceController {
  constructor(private readonly service: QrAttendanceService) {}

  @Post('generate')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Generate time-bounded (60s TTL) dynamic QR code token for classroom' })
  async generate(@Body() body: { classId: string; sectionId: string }) {
    return this.service.generateToken(body.classId, body.sectionId);
  }

  @Post('verify')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'Verify scanned QR code and record student presence' })
  async verify(@Body() body: { token: string }, @CurrentUser() user: AuthenticatedUser) {
    return this.service.verifyAndRecord(body.token, user.userId);
  }
}
