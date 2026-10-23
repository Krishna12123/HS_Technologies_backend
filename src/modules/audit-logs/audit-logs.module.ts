import { Module } from '@nestjs/common';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';
import { InMemoryAuditLogRepository } from '../../infrastructure/repositories/in-memory/in-memory-audit.repository';

@Module({
  controllers: [AuditLogsController],
  providers: [
    AuditLogsService,
    {
      provide: 'IAuditLogRepository',
      useClass: InMemoryAuditLogRepository,
    },
  ],
  exports: [AuditLogsService, 'IAuditLogRepository'],
})
export class AuditLogsModule {}
