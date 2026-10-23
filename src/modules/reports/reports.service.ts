import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  async getSystemReports() {
    return {
      availableReports: [
        { code: 'REP_STUDENT_ENROLLMENT', title: 'Student Enrollment by Class & Section', category: 'ACADEMIC' },
        { code: 'REP_ATTENDANCE_SUMMARY', title: 'Monthly Cumulative Attendance Statistics', category: 'OPERATIONS' },
        { code: 'REP_FEE_COLLECTION_DUES', title: 'Fee Collection vs Outstanding Balances', category: 'FINANCE' },
        { code: 'REP_PAYROLL_DISBURSEMENT', title: 'Annual Employee Salary & Statutory Deductions', category: 'HR' },
        { code: 'REP_INVENTORY_VALUATION', title: 'Stock Movement and Warehouse Valuation', category: 'LOGISTICS' },
        { code: 'REP_LIBRARY_CIRCULATION', title: 'Book Borrowing Trends & Overdue Penalties', category: 'LOGISTICS' },
      ],
      generatedAt: new Date().toISOString(),
    };
  }
}
