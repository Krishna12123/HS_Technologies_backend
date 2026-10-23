import { IBaseRepository } from './base-repository.interface';

export interface FeeStructureEntity {
  id: string;
  name: string;
  academicYearId: string;
  classId: string;
  tuitionFee: number;
  transportFee: number;
  labFee: number;
  libraryFee: number;
  totalAnnualAmount: number;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceEntity {
  id: string;
  invoiceNumber: string;
  studentId: string;
  feeStructureId: string;
  term: string;
  totalAmount: number;
  discountAmount: number;
  netPayableAmount: number;
  paidAmount: number;
  outstandingBalance: number;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  dueDate: string;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTransactionEntity {
  id: string;
  transactionRef: string;
  invoiceId: string;
  studentId: string;
  amount: number;
  paymentMethod: 'ONLINE_GATEWAY' | 'BANK_TRANSFER' | 'CASH' | 'CHEQUE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  gatewayProvider: string;
  idempotencyKey: string;
  gatewayTransactionId?: string;
  receiptNumber?: string;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFeeRepository extends IBaseRepository<FeeStructureEntity> {
  createInvoice(invoice: Omit<InvoiceEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<InvoiceEntity>;
  findInvoicesByStudent(studentId: string): Promise<InvoiceEntity[]>;
  findInvoiceById(invoiceId: string): Promise<InvoiceEntity | null>;
  updateInvoice(invoiceId: string, updates: Partial<InvoiceEntity>): Promise<InvoiceEntity>;
  recordPayment(payment: Omit<PaymentTransactionEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentTransactionEntity>;
  findPaymentById(paymentId: string): Promise<PaymentTransactionEntity | null>;
  findPaymentByIdempotencyKey(key: string): Promise<PaymentTransactionEntity | null>;
  updatePaymentStatus(paymentId: string, status: PaymentTransactionEntity['status'], receiptNo?: string): Promise<PaymentTransactionEntity>;
}
