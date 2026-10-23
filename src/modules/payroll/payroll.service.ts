import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  IPayrollRepository,
  SalaryStructureEntity,
  PayrollRunEntity,
  PayslipEntity,
} from '../../infrastructure/repositories/interfaces/payroll-repository.interface';
import { IStaffRepository } from '../../infrastructure/repositories/interfaces/staff-repository.interface';
import { IDocumentGenerator } from '../../infrastructure/document-generation/document-generator.interface';

@Injectable()
export class PayrollService {
  constructor(
    @Inject('IPayrollRepository')
    private readonly payrollRepository: IPayrollRepository,
    @Inject('IStaffRepository')
    private readonly staffRepository: IStaffRepository,
    @Inject('IDocumentGenerator')
    private readonly documentGenerator: IDocumentGenerator,
  ) {}

  async getSalaryStructures(): Promise<SalaryStructureEntity[]> {
    return this.payrollRepository.findAll();
  }

  async runMonthlyPayroll(month: number, year: number): Promise<PayrollRunEntity> {
    const staffList = await this.staffRepository.findAll();
    const activeStaff = staffList.filter((s) => s.status === 'ACTIVE');

    if (activeStaff.length === 0) {
      throw new BadRequestException('No active employees available to run payroll for.');
    }

    let totalDisbursement = 0;
    const payslipsToCreate: Omit<PayslipEntity, 'id'>[] = [];

    // Dummy ID for the run batch
    const run = await this.payrollRepository.createPayrollRun({
      month,
      year,
      totalEmployees: activeStaff.length,
      totalDisbursement: 0,
      status: 'DRAFT',
      schoolId: 'SCH-001',
    });

    for (const staff of activeStaff) {
      const salaryStruct = await this.payrollRepository.findByStaffId(staff.id);
      const basic = salaryStruct ? salaryStruct.basicSalary : staff.salary * 0.6;
      const allowances = salaryStruct ? salaryStruct.hra + salaryStruct.da + salaryStruct.specialAllowance : staff.salary * 0.4;
      const deductions = salaryStruct ? salaryStruct.pfDeduction + salaryStruct.taxDeduction : staff.salary * 0.1;
      const netPay = basic + allowances - deductions;

      totalDisbursement += netPay;
      payslipsToCreate.push({
        payrollRunId: run.id,
        staffId: staff.id,
        month,
        year,
        basic,
        allowances,
        deductions,
        netPay,
        status: 'GENERATED',
      });
    }

    await this.payrollRepository.createPayslips(payslipsToCreate);
    run.totalDisbursement = totalDisbursement;

    return run;
  }

  async getPayrollRun(id: string) {
    const run = await this.payrollRepository.findPayrollRunById(id);
    if (!run) throw new NotFoundException(`Payroll run '${id}' not found`);

    const payslips = await this.payrollRepository.findPayslipsByRun(id);
    return {
      run,
      payslips,
    };
  }

  async approvePayrollRun(id: string, approvedBy: string) {
    const run = await this.payrollRepository.findPayrollRunById(id);
    if (!run) throw new NotFoundException(`Payroll run '${id}' not found`);

    return this.payrollRepository.updatePayrollRunStatus(id, 'APPROVED', approvedBy);
  }

  async getPayslip(payslipId: string) {
    const slip = await this.payrollRepository.findPayslipById(payslipId);
    if (!slip) throw new NotFoundException(`Payslip '${payslipId}' not found`);

    return this.documentGenerator.generatePdf({
      title: `Payslip - ${slip.month}/${slip.year}`,
      templateType: 'PAYSLIP',
      data: slip,
    });
  }
}
