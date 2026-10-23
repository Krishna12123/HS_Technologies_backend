export interface AuditLogEntity {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  payload?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface IAuditLogRepository {
  create(log: Omit<AuditLogEntity, 'id' | 'timestamp'>): Promise<AuditLogEntity>;
  findAll(filter?: { userId?: string; resource?: string; limit?: number }): Promise<AuditLogEntity[]>;
}
