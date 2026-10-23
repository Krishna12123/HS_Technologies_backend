import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResultsGradingService, StudentMarkInput } from './results-grading.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Results & Grading')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ResultsGradingController {
  constructor(private readonly service: ResultsGradingService) {}

  @Post('exams/:id/marks')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Submit subject marks with grade calculation' })
  async submitMarks(@Param('id') examId: string, @Body() body: { marks: StudentMarkInput[] }) {
    return this.service.submitMarks(examId, body.marks);
  }

  @Get('exams/:id/results/student/:studentId')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT')
  @ApiOperation({ summary: 'Get comprehensive student result card for an exam' })
  async getStudentResults(@Param('id') examId: string, @Param('studentId') studentId: string) {
    return this.service.getStudentExamResults(examId, studentId);
  }

  @Post('results/:id/publish')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Publish exam results to student and parent portals' })
  async publishResults(@Param('id') examId: string) {
    return this.service.publishResults(examId);
  }
}
