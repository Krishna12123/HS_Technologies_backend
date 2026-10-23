import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdmissionsService } from './admissions.service';
import { AdmissionApplicationDto } from './dto/admission-application.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/roles.decorator';

@ApiTags('Admissions')
@Controller('admissions')
export class AdmissionsController {
  constructor(private readonly service: AdmissionsService) {}

  @Public()
  @Post('apply')
  @ApiOperation({ summary: 'Public endpoint to submit a student admission application' })
  async apply(@Body() dto: AdmissionApplicationDto) {
    return this.service.submitApplication(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'FRONT_DESK')
  @ApiOperation({ summary: 'List all admission applications' })
  async findAll() {
    return this.service.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'FRONT_DESK')
  @ApiOperation({ summary: 'Get admission application details' })
  async findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/enroll')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Approve application and convert candidate into enrolled student' })
  async enroll(@Param('id') id: string) {
    return this.service.enrollCandidate(id);
  }
}
