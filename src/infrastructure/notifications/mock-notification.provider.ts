import { Injectable, Logger } from '@nestjs/common';
import { INotificationProvider, NotificationPayload } from './notification.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MockNotificationProvider implements INotificationProvider {
  private readonly logger = new Logger(MockNotificationProvider.name);

  constructor() {
    this.logger.warn(
      '[DEV ONLY WARNING] MockNotificationProvider active. Outbound notifications (Email/SMS/Push) are logged to console and not dispatched over telecommunications networks.',
    );
  }

  async sendEmail(payload: NotificationPayload): Promise<{ delivered: boolean; messageId: string }> {
    const messageId = `msg-email-${uuidv4()}`;
    this.logger.log(`[SIMULATED EMAIL] To: ${payload.to} | Subject: "${payload.subject}" | Body: "${payload.message.substring(0, 80)}..."`);
    return { delivered: true, messageId };
  }

  async sendSms(payload: NotificationPayload): Promise<{ delivered: boolean; messageId: string }> {
    const messageId = `msg-sms-${uuidv4()}`;
    this.logger.log(`[SIMULATED SMS] To: ${payload.to} | Message: "${payload.message.substring(0, 80)}..."`);
    return { delivered: true, messageId };
  }

  async sendPush(payload: NotificationPayload): Promise<{ delivered: boolean; messageId: string }> {
    const messageId = `msg-push-${uuidv4()}`;
    this.logger.log(`[SIMULATED PUSH] Device/User: ${payload.to} | Message: "${payload.message.substring(0, 80)}..."`);
    return { delivered: true, messageId };
  }
}
