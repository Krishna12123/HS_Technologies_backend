import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface LeaveApplication {
  id: string;
  applicantId: string;
  applicantType: 'STUDENT' | 'STAFF';
  leaveType: 'SICK' | 'CASUAL' | 'EARNED' | 'MATERNITY' | 'OTHER';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  appliedAt: Date;
}

@Injectable()
export class LeaveManagementService {
  private readonly leaves = new Map<string, LeaveApplication>();

  async applyLeave(data: Omit<LeaveApplication, 'id' | 'status' | 'appliedAt'>): Promise<LeaveApplication> {
    const id = `lv-${uuidv4().substring(0, 8)}`;
    const application: LeaveApplication = {
      ...data,
      id,
      status: 'PENDING',
      appliedAt: new Date(),
    };
    this.leaves.set(id, application);
    return application;
  }

  async findAll(applicantType?: 'STUDENT' | 'STAFF', status?: string): Promise<LeaveApplication[]> {
    let list = Array.from(this.leaves.values());
    if (applicantType) list = list.filter((l) => l.applicantType === applicantType);
    if (status) list = list.filter((l) => l.status === status);
    return list;
  }

  async updateStatus(id: string, status: 'APPROVED' | 'REJECTED', reviewedBy: string): Promise<LeaveApplication> {
    const app = this.leaves.get(id);
    if (!app) {
      throw new NotFoundException(`Leave application '${id}' not found`);
    }
    app.status = status;
    app.reviewedBy = reviewedBy;
    this.leaves.set(id, app);
    return app;
  }
}
