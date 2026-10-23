import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExaminationsService } from './examinations.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { CreateExamScheduleDto } from './dto/create-schedule.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Examinations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exams')
export class ExaminationsController {
  constructor(private readonly service: ExaminationsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT')
  @ApiOperation({ summary: 'List all examinations' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT')
  @ApiOperation({ summary: 'Get exam details' })
  async findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Create an examination event' })
  async create(@Body() createExamDto: CreateExamDto) {
    return this.service.create(createExamDto);
  }

  @Get(':id/schedules')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT')
  @ApiOperation({ summary: 'Get timetable slots for an examination' })
  async getSchedules(@Param('id') id: string) {
    return this.service.getSchedules(id);
  }

  @Post(':id/schedules')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Schedule an exam subject slot with conflict collision detection' })
  async addSchedule(@Param('id') id: string, @Body() dto: CreateExamScheduleDto) {
    return this.service.addSchedule(id, dto);
  }
}
