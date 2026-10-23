import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IFeeRepository } from '../../infrastructure/repositories/interfaces/fee-repository.interface';

@Injectable()
export class ReconciliationService {
  constructor(
    @Inject('IFeeRepository')
    private readonly feeRepository: IFeeRepository,
  ) {}

  async reconcilePayment(paymentId: string, bankReference: string, notes?: string) {
    const payment = await this.feeRepository.findPaymentById(paymentId);
    if (!payment) {
      throw new NotFoundException(`Payment '${paymentId}' not found for reconciliation`);
    }

    return {
      reconciled: true,
      paymentId: payment.id,
      transactionRef: payment.transactionRef,
      bankReference,
      status: payment.status,
      amountReconciled: payment.amount,
      notes: notes || 'Bank settlement matched',
      reconciledAt: new Date().toISOString(),
    };
  }
}
