import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReconciliationService } from './reconciliation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Payment Reconciliation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ReconciliationController {
  constructor(private readonly service: ReconciliationService) {}

  @Post('payments/:id/reconcile')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Reconcile gateway transaction with bank statement ledger' })
  async reconcilePayment(
    @Param('id') paymentId: string,
    @Body() body: { bankReference: string; notes?: string },
  ) {
    return this.service.reconcilePayment(paymentId, body.bankReference, body.notes);
  }
}
