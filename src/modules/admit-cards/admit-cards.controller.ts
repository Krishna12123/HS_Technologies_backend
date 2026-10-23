import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdmitCardsService } from './admit-cards.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Admit Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admit-cards')
export class AdmitCardsController {
  constructor(private readonly service: AdmitCardsService) {}

  @Get(':examId/student/:studentId')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT')
  @ApiOperation({ summary: 'Generate examination admit card (validates attendance & fee clearance)' })
  async generateAdmitCard(
    @Param('examId') examId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.service.generateAdmitCard(examId, studentId);
  }
}
