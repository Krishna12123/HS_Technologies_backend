import { Injectable } from '@nestjs/common';
import { BaseInMemoryRepository } from './base-in-memory.repository';
import {
  IPayrollRepository,
  SalaryStructureEntity,
  PayrollRunEntity,
  PayslipEntity,
} from '../interfaces/payroll-repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InMemoryPayrollRepository
  extends BaseInMemoryRepository<SalaryStructureEntity>
  implements IPayrollRepository
{
  private readonly runs = new Map<string, PayrollRunEntity>();
  private readonly payslips = new Map<string, PayslipEntity>();

  constructor() {
    super('InMemoryPayrollRepository');
    this.seedDevPayroll();
  }

  private async seedDevPayroll() {
    await this.create({
      id: 'sal-001',
      staffId: 'stf-001',
      basicSalary: 30000,
      hra: 10000,
      da: 5000,
      specialAllowance: 5000,
      pfDeduction: 3600,
      taxDeduction: 1400,
      grossSalary: 50000,
      netSalary: 45000,
      schoolId: 'SCH-001',
    });
  }

  async findByStaffId(staffId: string): Promise<SalaryStructureEntity | null> {
    const all = Array.from(this.items.values());
    const match = all.find((s) => s.staffId === staffId);
    return match ? { ...match } : null;
  }

  async createPayrollRun(run: Omit<PayrollRunEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PayrollRunEntity> {
    const id = uuidv4();
    const now = new Date();
    const newRun: PayrollRunEntity = {
      ...run,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.runs.set(id, newRun);
    return { ...newRun };
  }

  async findPayrollRunById(id: string): Promise<PayrollRunEntity | null> {
    const run = this.runs.get(id);
    return run ? { ...run } : null;
  }

  async updatePayrollRunStatus(
    id: string,
    status: PayrollRunEntity['status'],
    approvedBy?: string,
  ): Promise<PayrollRunEntity> {
    const run = this.runs.get(id);
    if (!run) {
      throw new Error(`Payroll run '${id}' not found`);
    }
    run.status = status;
    if (approvedBy) {
      run.approvedBy = approvedBy;
    }
    run.updatedAt = new Date();
    this.runs.set(id, run);
    return { ...run };
  }

  async createPayslips(slips: Omit<PayslipEntity, 'id'>[]): Promise<PayslipEntity[]> {
    const created: PayslipEntity[] = [];
    for (const slip of slips) {
      const id = uuidv4();
      const newSlip = { ...slip, id };
      this.payslips.set(id, newSlip);
      created.push(newSlip);
    }
    return created;
  }

  async findPayslipsByRun(runId: string): Promise<PayslipEntity[]> {
    return Array.from(this.payslips.values()).filter((s) => s.payrollRunId === runId);
  }

  async findPayslipById(id: string): Promise<PayslipEntity | null> {
    const slip = this.payslips.get(id);
    return slip ? { ...slip } : null;
  }
}
