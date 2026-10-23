export interface NotificationPayload {
  to: string;
  recipientName?: string;
  subject?: string;
  message: string;
  templateId?: string;
  metadata?: Record<string, any>;
}

export interface INotificationProvider {
  sendEmail(payload: NotificationPayload): Promise<{ delivered: boolean; messageId: string }>;
  sendSms(payload: NotificationPayload): Promise<{ delivered: boolean; messageId: string }>;
  sendPush(payload: NotificationPayload): Promise<{ delivered: boolean; messageId: string }>;
}
