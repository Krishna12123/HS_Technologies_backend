import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IdCardsCertificatesService } from './id-cards-certificates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('ID Cards & Certificates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('certificates')
export class IdCardsCertificatesController {
  constructor(private readonly service: IdCardsCertificatesService) {}

  @Get('id-cards/student/:studentId')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT')
  @ApiOperation({ summary: 'Generate printable student ID card' })
  async generateStudentIdCard(@Param('studentId') studentId: string) {
    return this.service.generateStudentIdCard(studentId);
  }

  @Get('id-cards/staff/:staffId')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HR_STAFF')
  @ApiOperation({ summary: 'Generate printable staff ID card' })
  async generateStaffIdCard(@Param('staffId') staffId: string) {
    return this.service.generateStaffIdCard(staffId);
  }

  @Post('transfer')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Issue Transfer Certificate (TC) and update student status to TRANSFERRED' })
  async generateTransferCertificate(@Body() body: { studentId: string; reason: string }) {
    return this.service.generateTransferCertificate(body.studentId, body.reason);
  }

  @Post('bonafide')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'FRONT_DESK')
  @ApiOperation({ summary: 'Issue Bonafide Certificate for active student' })
  async generateBonafideCertificate(@Body() body: { studentId: string }) {
    return this.service.generateBonafideCertificate(body.studentId);
  }
}
