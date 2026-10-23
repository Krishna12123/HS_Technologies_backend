import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AcademicsService, Subject, SyllabusItem } from './academics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Academics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academics')
export class AcademicsController {
  constructor(private readonly service: AcademicsService) {}

  @Get('subjects')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'List academic curriculum subjects' })
  async getSubjects() {
    return this.service.getSubjects();
  }

  @Post('subjects')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Define a new curriculum subject' })
  async createSubject(@Body() body: Omit<Subject, 'id'>) {
    return this.service.createSubject(body);
  }

  @Get('syllabus')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'Get syllabus modules with optional filters' })
  @ApiQuery({ name: 'subjectId', required: false })
  @ApiQuery({ name: 'classId', required: false })
  async getSyllabus(@Query('subjectId') subjectId?: string, @Query('classId') classId?: string) {
    return this.service.getSyllabus(subjectId, classId);
  }

  @Post('syllabus')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Add a new syllabus milestone' })
  async addSyllabusItem(@Body() body: Omit<SyllabusItem, 'id'>) {
    return this.service.addSyllabusItem(body);
  }
}
