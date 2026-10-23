import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@ApiTags('Messaging & Parent-Student Communication')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('messaging')
export class MessagingController {
  constructor(private readonly service: MessagingService) {}

  @Get('notices')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT')
  @ApiOperation({ summary: 'Get notice board announcements targeted to current user role' })
  async getNotices(@CurrentUser() user: AuthenticatedUser) {
    return this.service.getNotices(user.role);
  }

  @Post('broadcast')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Send institution-wide announcement broadcast' })
  async broadcastNotice(
    @Body() body: { title: string; content: string; targetRole: string; channel: 'EMAIL' | 'SMS' | 'PUSH' | 'PORTAL' },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.broadcastNotice(body.title, body.content, body.targetRole, body.channel, user.userId);
  }
}
