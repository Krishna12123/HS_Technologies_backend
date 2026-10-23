import { Module } from '@nestjs/common';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { MockNotificationProvider } from '../../infrastructure/notifications/mock-notification.provider';
import { InMemoryQueueService } from '../../infrastructure/background-jobs/in-memory-queue.service';

@Module({
  controllers: [MessagingController],
  providers: [
    MessagingService,
    {
      provide: 'INotificationProvider',
      useClass: MockNotificationProvider,
    },
    {
      provide: 'IQueueService',
      useClass: InMemoryQueueService,
    },
  ],
  exports: [MessagingService],
})
export class MessagingModule {}
