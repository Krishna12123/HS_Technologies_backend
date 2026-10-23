import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SchoolBellService, BellSchedule } from './school-bell.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('School Bell & Timetable Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('school-bell')
export class SchoolBellController {
  constructor(private readonly service: SchoolBellService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'List automated school bell schedules and timetable events' })
  async findAll() {
    return this.service.findAll();
  }

  @Post()
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Create automated bell trigger configuration' })
  async create(@Body() body: Omit<BellSchedule, 'id'>) {
    return this.service.create(body);
  }
}
