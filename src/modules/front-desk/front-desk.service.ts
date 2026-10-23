import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface VisitorLog {
  id: string;
  visitorName: string;
  phone: string;
  purpose: string;
  personToMeet: string;
  badgeNumber: string;
  checkInTime: Date;
  checkOutTime?: Date;
  status: 'CHECKED_IN' | 'CHECKED_OUT';
}

@Injectable()
export class FrontDeskService {
  private readonly visitors = new Map<string, VisitorLog>();

  async getVisitors(): Promise<VisitorLog[]> {
    return Array.from(this.visitors.values());
  }

  async checkInVisitor(data: { visitorName: string; phone: string; purpose: string; personToMeet: string; badgeNumber: string }): Promise<VisitorLog> {
    const id = `vis-${uuidv4().substring(0, 8)}`;
    const log: VisitorLog = {
      ...data,
      id,
      checkInTime: new Date(),
      status: 'CHECKED_IN',
    };
    this.visitors.set(id, log);
    return log;
  }

  async checkOutVisitor(id: string): Promise<VisitorLog> {
    const log = this.visitors.get(id);
    if (!log) {
      throw new NotFoundException(`Visitor log '${id}' not found`);
    }
    log.status = 'CHECKED_OUT';
    log.checkOutTime = new Date();
    this.visitors.set(id, log);
    return log;
  }
}
