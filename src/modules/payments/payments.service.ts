import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import {
  IFeeRepository,
  PaymentTransactionEntity,
} from '../../infrastructure/repositories/interfaces/fee-repository.interface';
import { IPaymentGatewayProvider } from '../../infrastructure/payment-gateways/payment-gateway.interface';
import { IDocumentGenerator } from '../../infrastructure/document-generation/document-generator.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('IFeeRepository')
    private readonly feeRepository: IFeeRepository,
    @Inject('IPaymentGatewayProvider')
    private readonly paymentGateway: IPaymentGatewayProvider,
    @Inject('IDocumentGenerator')
    private readonly documentGenerator: IDocumentGenerator,
  ) {}

  async createCheckoutSession(invoiceId: string, idempotencyKey: string, customerEmail: string) {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header or property is required.');
    }

    // Idempotency check: Return existing payment if already submitted with this key
    const existingPayment = await this.feeRepository.findPaymentByIdempotencyKey(idempotencyKey);
    if (existingPayment) {
      return {
        isExisting: true,
        paymentId: existingPayment.id,
        transactionRef: existingPayment.transactionRef,
        status: existingPayment.status,
      };
    }

    const invoice = await this.feeRepository.findInvoiceById(invoiceId);
    if (!invoice) {
      throw new NotFoundException(`Invoice '${invoiceId}' not found`);
    }

    if (invoice.status === 'PAID' || invoice.outstandingBalance <= 0) {
      throw new BadRequestException('This invoice has already been fully settled.');
    }

    // Amount strictly calculated server-side
    const payableAmount = invoice.outstandingBalance;
    const transactionRef = `TX-${uuidv4().substring(0, 8).toUpperCase()}`;

    const session = await this.paymentGateway.createCheckoutSession({
      invoiceId: invoice.id,
      studentId: invoice.studentId,
      amount: payableAmount,
      currency: 'INR',
      idempotencyKey,
      customerEmail,
    });

    const payment = await this.feeRepository.recordPayment({
      transactionRef,
      invoiceId: invoice.id,
      studentId: invoice.studentId,
      amount: payableAmount,
      paymentMethod: 'ONLINE_GATEWAY',
      status: 'PENDING',
      gatewayProvider: session.provider,
      idempotencyKey,
      gatewayTransactionId: session.sessionId,
      schoolId: 'SCH-001',
    });

    return {
      paymentId: payment.id,
      transactionRef,
      payableAmount,
      checkoutUrl: session.checkoutUrl,
      expiresAt: session.expiresAt,
    };
  }

  async getPaymentStatus(id: string) {
    const payment = await this.feeRepository.findPaymentById(id);
    if (!payment) {
      throw new NotFoundException(`Payment transaction '${id}' not found`);
    }
    return payment;
  }

  async handleWebhook(provider: string, signature: string, payload: any) {
    // Webhook signature verification
    const verification = await this.paymentGateway.verifyWebhook(payload, signature);
    if (!verification.isValid) {
      throw new BadRequestException('Invalid webhook cryptographic signature');
    }

    const payment = await this.feeRepository.findPaymentByIdempotencyKey(payload.idempotencyKey || verification.transactionId);
    if (!payment) {
      throw new NotFoundException('Associated payment record not found for webhook event');
    }

    // Duplicate webhook protection
    if (payment.status === 'COMPLETED') {
      return { received: true, alreadyProcessed: true };
    }

    if (verification.status === 'COMPLETED') {
      const receiptNo = `REC-2026-${uuidv4().substring(0, 6).toUpperCase()}`;
      await this.feeRepository.updatePaymentStatus(payment.id, 'COMPLETED', receiptNo);

      // Settle invoice server-side
      const invoice = await this.feeRepository.findInvoiceById(payment.invoiceId);
      if (invoice) {
        const newPaidAmount = invoice.paidAmount + payment.amount;
        const newBalance = Math.max(0, invoice.netPayableAmount - newPaidAmount);
        const newStatus = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

        await this.feeRepository.updateInvoice(invoice.id, {
          paidAmount: newPaidAmount,
          outstandingBalance: newBalance,
          status: newStatus,
        });
      }
    } else {
      await this.feeRepository.updatePaymentStatus(payment.id, 'FAILED');
    }

    return { received: true, status: verification.status };
  }

  async generateReceipt(paymentId: string) {
    const payment = await this.feeRepository.findPaymentById(paymentId);
    if (!payment) {
      throw new NotFoundException(`Payment '${paymentId}' not found`);
    }

    // Receipt Guard: Receipt only generated after verified payment!
    if (payment.status !== 'COMPLETED') {
      throw new BadRequestException(
        `Cannot issue receipt: Payment status is '${payment.status}'. Receipts are strictly issued for COMPLETED payments.`,
      );
    }

    return this.documentGenerator.generatePdf({
      title: `Fee Payment Receipt - ${payment.receiptNumber || payment.transactionRef}`,
      templateType: 'RECEIPT',
      data: {
        receiptNumber: payment.receiptNumber,
        transactionRef: payment.transactionRef,
        invoiceId: payment.invoiceId,
        studentId: payment.studentId,
        amountPaid: payment.amount,
        paymentMethod: payment.paymentMethod,
        date: payment.updatedAt,
      },
    });
  }
}
