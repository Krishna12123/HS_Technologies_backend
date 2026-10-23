import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FrontDeskService } from './front-desk.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Front Desk & Visitor Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('front-desk')
export class FrontDeskController {
  constructor(private readonly service: FrontDeskService) {}

  @Get('visitors')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'FRONT_DESK')
  @ApiOperation({ summary: 'List all visitor logs' })
  async getVisitors() {
    return this.service.getVisitors();
  }

  @Post('visitors')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'FRONT_DESK')
  @ApiOperation({ summary: 'Check in a school visitor and assign badge' })
  async checkInVisitor(
    @Body() body: { visitorName: string; phone: string; purpose: string; personToMeet: string; badgeNumber: string },
  ) {
    return this.service.checkInVisitor(body);
  }

  @Patch('visitors/:id/checkout')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'FRONT_DESK')
  @ApiOperation({ summary: 'Check out a visitor log' })
  async checkOutVisitor(@Param('id') id: string) {
    return this.service.checkOutVisitor(id);
  }
}
