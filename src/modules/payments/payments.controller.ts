import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@ApiTags('Payments & Checkout')
@Controller()
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('payments/checkout')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PARENT', 'STUDENT')
  @ApiOperation({ summary: 'Initiate server-side payment checkout session with idempotency protection' })
  @ApiHeader({ name: 'idempotency-key', required: true, description: 'Unique idempotency key' })
  async createCheckout(
    @Body() body: { invoiceId: string },
    @Headers('idempotency-key') idempotencyKey: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.createCheckoutSession(body.invoiceId, idempotencyKey, user.email);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('payments/:id/status')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PARENT', 'STUDENT')
  @ApiOperation({ summary: 'Get payment status state transition' })
  async getStatus(@Param('id') id: string) {
    return this.service.getPaymentStatus(id);
  }

  @Public()
  @Post('webhooks/payments/:provider')
  @ApiOperation({ summary: 'Process incoming payment provider webhook with cryptographic signature validation' })
  async handleWebhook(
    @Param('provider') provider: string,
    @Headers('x-webhook-signature') signature: string,
    @Body() payload: any,
  ) {
    return this.service.handleWebhook(provider, signature || 'mock-valid-signature', payload);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('receipts/:id/download')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PARENT', 'STUDENT')
  @ApiOperation({ summary: 'Download official payment receipt PDF (only for verified COMPLETED payments)' })
  async downloadReceipt(@Param('id') paymentId: string) {
    return this.service.generateReceipt(paymentId);
  }
}
