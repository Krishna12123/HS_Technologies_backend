import { Injectable, Inject } from '@nestjs/common';
import { INotificationProvider } from '../../infrastructure/notifications/notification.interface';
import { IQueueService } from '../../infrastructure/background-jobs/queue.interface';
import { v4 as uuidv4 } from 'uuid';

export interface NoticeMessage {
  id: string;
  title: string;
  content: string;
  targetRole: string; // 'ALL' | 'PARENTS' | 'TEACHERS' | 'STUDENTS'
  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'PORTAL';
  senderId: string;
  sentAt: Date;
}

@Injectable()
export class MessagingService {
  private readonly notices = new Map<string, NoticeMessage>();

  constructor(
    @Inject('INotificationProvider')
    private readonly notificationProvider: INotificationProvider,
    @Inject('IQueueService')
    private readonly queueService: IQueueService,
  ) {}

  async broadcastNotice(
    title: string,
    content: string,
    targetRole: string,
    channel: 'EMAIL' | 'SMS' | 'PUSH' | 'PORTAL',
    senderId: string,
  ): Promise<NoticeMessage> {
    const id = `not-${uuidv4().substring(0, 8)}`;
    const notice: NoticeMessage = {
      id,
      title,
      content,
      targetRole,
      channel,
      senderId,
      sentAt: new Date(),
    };
    this.notices.set(id, notice);

    // Queue asynchronous background delivery
    await this.queueService.enqueue('BROADCAST_MESSAGE', {
      noticeId: id,
      targetRole,
      channel,
    });

    if (channel === 'EMAIL') {
      await this.notificationProvider.sendEmail({
        to: `${targetRole.toLowerCase()}@schoolerp.internal`,
        subject: title,
        message: content,
      });
    }

    return notice;
  }

  async getNotices(targetRole?: string): Promise<NoticeMessage[]> {
    let list = Array.from(this.notices.values());
    if (targetRole && targetRole !== 'SUPER_ADMIN') {
      list = list.filter((n) => n.targetRole === 'ALL' || n.targetRole === targetRole);
    }
    return list;
  }
}
