import { Injectable, Logger } from '@nestjs/common';
import {
  IAuditLogRepository,
  AuditLogEntity,
} from '../interfaces/audit-log-repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InMemoryAuditLogRepository implements IAuditLogRepository {
  private readonly logs: AuditLogEntity[] = [];
  private readonly logger = new Logger(InMemoryAuditLogRepository.name);

  constructor() {
    this.logger.warn(
      '[DEV ONLY WARNING] InMemoryAuditLogRepository active. Audit trails are NOT permanently stored!',
    );
  }

  async create(log: Omit<AuditLogEntity, 'id' | 'timestamp'>): Promise<AuditLogEntity> {
    const entry: AuditLogEntity = {
      ...log,
      id: uuidv4(),
      timestamp: new Date(),
    };
    this.logs.unshift(entry); // newest first
    return { ...entry };
  }

  async findAll(filter?: { userId?: string; resource?: string; limit?: number }): Promise<AuditLogEntity[]> {
    let result = [...this.logs];
    if (filter?.userId) {
      result = result.filter((l) => l.userId === filter.userId);
    }
    if (filter?.resource) {
      result = result.filter((l) => l.resource === filter.resource);
    }
    if (filter?.limit) {
      result = result.slice(0, filter.limit);
    }
    return result;
  }
}
