import { Injectable, Logger } from '@nestjs/common';
import {
  IPaymentGatewayProvider,
  PaymentCheckoutRequest,
  PaymentCheckoutSession,
  WebhookVerificationResult,
} from './payment-gateway.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MockPaymentGatewayProvider implements IPaymentGatewayProvider {
  private readonly logger = new Logger(MockPaymentGatewayProvider.name);

  constructor() {
    this.logger.warn(
      '[DEV ONLY WARNING] MockPaymentGatewayProvider active. Transactions are simulated! No real monetary movement.',
    );
  }

  async createCheckoutSession(req: PaymentCheckoutRequest): Promise<PaymentCheckoutSession> {
    const sessionId = `cs_test_${uuidv4().replace(/-/g, '')}`;
    this.logger.log(`[MOCK GATEWAY] Created checkout session ${sessionId} for Invoice ${req.invoiceId} (Amount: ${req.amount})`);

    return {
      sessionId,
      checkoutUrl: `https://checkout.mock-gateway.internal/session/${sessionId}?idempotency=${req.idempotencyKey}`,
      provider: 'MOCK_STRIPE_OR_RAZORPAY',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }

  async verifyWebhook(payload: any, signature: string): Promise<WebhookVerificationResult> {
    // In mock mode, verify that signature matches 'mock-valid-signature' or contains valid event
    const isValid = signature === 'mock-valid-signature' || Boolean(payload && payload.transactionId);
    this.logger.log(`[MOCK GATEWAY] Webhook signature verification result: ${isValid}`);

    return {
      isValid,
      event: payload.event || 'payment.succeeded',
      transactionId: payload.transactionId || `tx_${uuidv4()}`,
      status: payload.status === 'FAILED' ? 'FAILED' : 'COMPLETED',
      amount: payload.amount || 0,
    };
  }

  async initiateRefund(transactionId: string, amount: number, reason: string): Promise<{ refundId: string; status: string }> {
    const refundId = `re_test_${uuidv4()}`;
    this.logger.log(`[MOCK GATEWAY] Refund ${refundId} initiated for ${transactionId} (Amount: ${amount}, Reason: ${reason})`);
    return {
      refundId,
      status: 'SUCCEEDED',
    };
  }
}
