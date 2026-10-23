import { IBaseRepository } from './base-repository.interface';

export interface SalaryStructureEntity {
  id: string;
  staffId: string;
  basicSalary: number;
  hra: number;
  da: number;
  specialAllowance: number;
  pfDeduction: number;
  taxDeduction: number;
  grossSalary: number;
  netSalary: number;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollRunEntity {
  id: string;
  month: number;
  year: number;
  totalEmployees: number;
  totalDisbursement: number;
  status: 'DRAFT' | 'APPROVED' | 'DISBURSED';
  approvedBy?: string;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayslipEntity {
  id: string;
  payrollRunId: string;
  staffId: string;
  month: number;
  year: number;
  basic: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: 'GENERATED' | 'PAID';
}

export interface IPayrollRepository extends IBaseRepository<SalaryStructureEntity> {
  findByStaffId(staffId: string): Promise<SalaryStructureEntity | null>;
  createPayrollRun(run: Omit<PayrollRunEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PayrollRunEntity>;
  findPayrollRunById(id: string): Promise<PayrollRunEntity | null>;
  updatePayrollRunStatus(id: string, status: PayrollRunEntity['status'], approvedBy?: string): Promise<PayrollRunEntity>;
  createPayslips(slips: Omit<PayslipEntity, 'id'>[]): Promise<PayslipEntity[]>;
  findPayslipsByRun(runId: string): Promise<PayslipEntity[]>;
  findPayslipById(id: string): Promise<PayslipEntity | null>;
}
