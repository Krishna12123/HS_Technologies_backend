import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IFeeRepository, InvoiceEntity } from '../../infrastructure/repositories/interfaces/fee-repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FeeLedgerService {
  constructor(
    @Inject('IFeeRepository')
    private readonly feeRepository: IFeeRepository,
  ) {}

  async findAllInvoices(): Promise<InvoiceEntity[]> {
    return this.feeRepository.findAll() as any;
  }

  async findInvoiceById(id: string): Promise<InvoiceEntity> {
    const inv = await this.feeRepository.findInvoiceById(id);
    if (!inv) {
      throw new NotFoundException(`Invoice '${id}' not found`);
    }
    return inv;
  }

  async createInvoice(data: {
    studentId: string;
    feeStructureId: string;
    term: string;
    totalAmount: number;
    discountAmount: number;
    dueDate: string;
  }): Promise<InvoiceEntity> {
    const netPayableAmount = data.totalAmount - data.discountAmount;
    const invoiceNumber = `INV-2026-${uuidv4().substring(0, 6).toUpperCase()}`;

    return this.feeRepository.createInvoice({
      invoiceNumber,
      studentId: data.studentId,
      feeStructureId: data.feeStructureId,
      term: data.term,
      totalAmount: data.totalAmount,
      discountAmount: data.discountAmount,
      netPayableAmount,
      paidAmount: 0,
      outstandingBalance: netPayableAmount,
      status: 'PENDING',
      dueDate: data.dueDate,
      schoolId: 'SCH-001',
    });
  }

  async getStudentFeeAccount(studentId: string) {
    const invoices = await this.feeRepository.findInvoicesByStudent(studentId);
    const totalInvoiced = invoices.reduce((acc, i) => acc + i.netPayableAmount, 0);
    const totalPaid = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
    const outstandingBalance = totalInvoiced - totalPaid;

    return {
      studentId,
      totalInvoiced,
      totalPaid,
      outstandingBalance,
      status: outstandingBalance <= 0 ? 'CLEARED' : 'OUTSTANDING_DUE',
      invoices,
    };
  }
}
