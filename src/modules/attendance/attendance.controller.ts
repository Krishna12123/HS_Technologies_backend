import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { RecordAttendanceDto } from './dto/record-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'HR_STAFF')
  @ApiOperation({ summary: 'Query daily attendance records' })
  @ApiQuery({ name: 'date', required: false, example: '2026-10-24' })
  @ApiQuery({ name: 'targetType', required: false, enum: ['STUDENT', 'STAFF'] })
  async findAll(@Query('date') date?: string, @Query('targetType') targetType?: 'STUDENT' | 'STAFF') {
    return this.service.findAll(date, targetType);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'HR_STAFF')
  @ApiOperation({ summary: 'Record single student or staff attendance (enforces duplicate prevention)' })
  async record(@Body() dto: RecordAttendanceDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.recordAttendance(dto, user.userId);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'HR_STAFF')
  @ApiOperation({ summary: 'Update an existing attendance record status' })
  async update(
    @Param('id') id: string,
    @Body() body: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks?: string },
  ) {
    return this.service.updateAttendance(id, body.status, body.remarks);
  }

  @Get('reports')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'HR_STAFF')
  @ApiOperation({ summary: 'Get daily aggregated attendance metrics' })
  @ApiQuery({ name: 'date', required: false, example: '2026-10-24' })
  async getReports(@Query('date') date?: string) {
    const reportDate = date || new Date().toISOString().split('T')[0];
    return this.service.getReports(reportDate);
  }
}
