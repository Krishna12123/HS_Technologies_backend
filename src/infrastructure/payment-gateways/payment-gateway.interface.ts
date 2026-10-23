export interface PaymentCheckoutRequest {
  invoiceId: string;
  studentId: string;
  amount: number;
  currency: string;
  idempotencyKey: string;
  customerEmail: string;
  returnUrl?: string;
}

export interface PaymentCheckoutSession {
  sessionId: string;
  checkoutUrl: string;
  provider: string;
  expiresAt: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  event: string;
  transactionId: string;
  status: 'COMPLETED' | 'FAILED';
  amount: number;
}

export interface IPaymentGatewayProvider {
  createCheckoutSession(req: PaymentCheckoutRequest): Promise<PaymentCheckoutSession>;
  verifyWebhook(payload: any, signature: string): Promise<WebhookVerificationResult>;
  initiateRefund(transactionId: string, amount: number, reason: string): Promise<{ refundId: string; status: string }>;
}
