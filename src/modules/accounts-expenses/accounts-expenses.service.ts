import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface ExpenseRecord {
  id: string;
  voucherNumber: string;
  category: 'UTILITIES' | 'MAINTENANCE' | 'LAB_EQUIPMENT' | 'EVENTS' | 'SALARIES' | 'OTHER';
  title: string;
  amount: number;
  paymentMode: 'BANK_TRANSFER' | 'CASH' | 'CHEQUE';
  paidTo: string;
  date: string;
  approvedBy: string;
}

@Injectable()
export class AccountsExpensesService {
  private readonly expenses = new Map<string, ExpenseRecord>();

  constructor() {
    this.expenses.set('exp-01', {
      id: 'exp-01',
      voucherNumber: 'VCH-2026-001',
      category: 'UTILITIES',
      title: 'Monthly High-Speed Campus Internet Bandwidth',
      amount: 12500,
      paymentMode: 'BANK_TRANSFER',
      paidTo: 'Airtel Enterprise Telecom',
      date: '2026-10-15',
      approvedBy: 'usr-school-admin-01',
    });
  }

  async findAll(): Promise<ExpenseRecord[]> {
    return Array.from(this.expenses.values());
  }

  async recordExpense(data: Omit<ExpenseRecord, 'id' | 'voucherNumber'>): Promise<ExpenseRecord> {
    const id = `exp-${uuidv4().substring(0, 8)}`;
    const voucherNumber = `VCH-2026-${uuidv4().substring(0, 6).toUpperCase()}`;
    const record: ExpenseRecord = {
      ...data,
      id,
      voucherNumber,
    };
    this.expenses.set(id, record);
    return record;
  }

  async getFinancialReport() {
    const expenses = Array.from(this.expenses.values());
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    return {
      period: 'Fiscal Year 2026-2027',
      totalExpenses,
      expenseCount: expenses.length,
      categoryBreakdown: expenses.reduce((acc: Record<string, number>, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {}),
    };
  }
}
