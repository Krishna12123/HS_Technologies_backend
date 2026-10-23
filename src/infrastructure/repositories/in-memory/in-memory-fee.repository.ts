import { Injectable } from '@nestjs/common';
import { BaseInMemoryRepository } from './base-in-memory.repository';
import {
  IFeeRepository,
  FeeStructureEntity,
  InvoiceEntity,
  PaymentTransactionEntity,
} from '../interfaces/fee-repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InMemoryFeeRepository extends BaseInMemoryRepository<FeeStructureEntity> implements IFeeRepository {
  private readonly invoices = new Map<string, InvoiceEntity>();
  private readonly payments = new Map<string, PaymentTransactionEntity>();

  constructor() {
    super('InMemoryFeeRepository');
    this.seedDevFees();
  }

  private async seedDevFees() {
    const feeStructure = await this.create({
      id: 'fs-class10-2026',
      name: 'Class 10 Annual Standard Fee Structure',
      academicYearId: 'ay-2026',
      classId: 'cls-10',
      tuitionFee: 60000,
      transportFee: 15000,
      labFee: 5000,
      libraryFee: 2000,
      totalAnnualAmount: 82000,
      schoolId: 'SCH-001',
    });

    await this.createInvoice({
      invoiceNumber: 'INV-2026-001',
      studentId: 'std-001',
      feeStructureId: feeStructure.id,
      term: 'TERM_1',
      totalAmount: 41000,
      discountAmount: 1000,
      netPayableAmount: 40000,
      paidAmount: 0,
      outstandingBalance: 40000,
      status: 'PENDING',
      dueDate: '2026-11-30',
      schoolId: 'SCH-001',
    });
  }

  async createInvoice(invoice: Omit<InvoiceEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<InvoiceEntity> {
    const id = uuidv4();
    const now = new Date();
    const newInvoice: InvoiceEntity = {
      ...invoice,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.invoices.set(id, newInvoice);
    return { ...newInvoice };
  }

  async findInvoicesByStudent(studentId: string): Promise<InvoiceEntity[]> {
    return Array.from(this.invoices.values()).filter((i) => i.studentId === studentId);
  }

  async findInvoiceById(invoiceId: string): Promise<InvoiceEntity | null> {
    const invoice = this.invoices.get(invoiceId);
    return invoice ? { ...invoice } : null;
  }

  async updateInvoice(invoiceId: string, updates: Partial<InvoiceEntity>): Promise<InvoiceEntity> {
    const existing = this.invoices.get(invoiceId);
    if (!existing) {
      throw new Error(`Invoice with id '${invoiceId}' not found`);
    }
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.invoices.set(invoiceId, updated);
    return { ...updated };
  }

  async recordPayment(payment: Omit<PaymentTransactionEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentTransactionEntity> {
    const id = uuidv4();
    const now = new Date();
    const newPayment: PaymentTransactionEntity = {
      ...payment,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.payments.set(id, newPayment);
    return { ...newPayment };
  }

  async findPaymentById(paymentId: string): Promise<PaymentTransactionEntity | null> {
    const payment = this.payments.get(paymentId);
    return payment ? { ...payment } : null;
  }

  async findPaymentByIdempotencyKey(key: string): Promise<PaymentTransactionEntity | null> {
    const all = Array.from(this.payments.values());
    const match = all.find((p) => p.idempotencyKey === key);
    return match ? { ...match } : null;
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentTransactionEntity['status'],
    receiptNo?: string,
  ): Promise<PaymentTransactionEntity> {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error(`Payment transaction with id '${paymentId}' not found`);
    }
    payment.status = status;
    if (receiptNo) {
      payment.receiptNumber = receiptNo;
    }
    payment.updatedAt = new Date();
    this.payments.set(paymentId, payment);
    return { ...payment };
  }
}
