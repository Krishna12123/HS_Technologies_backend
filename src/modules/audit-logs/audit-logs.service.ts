import { Injectable, Inject } from '@nestjs/common';
import {
  IAuditLogRepository,
  AuditLogEntity,
} from '../../infrastructure/repositories/interfaces/audit-log-repository.interface';

@Injectable()
export class AuditLogsService {
  constructor(
    @Inject('IAuditLogRepository')
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async findAll(userId?: string, resource?: string, limit = 50): Promise<AuditLogEntity[]> {
    return this.auditRepo.findAll({ userId, resource, limit });
  }

  async recordLog(data: Omit<AuditLogEntity, 'id' | 'timestamp'>): Promise<AuditLogEntity> {
    return this.auditRepo.create(data);
  }
}
