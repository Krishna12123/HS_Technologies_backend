import { Injectable, Inject } from '@nestjs/common';
import { IStudentRepository } from '../../infrastructure/repositories/interfaces/student-repository.interface';
import { IStaffRepository } from '../../infrastructure/repositories/interfaces/staff-repository.interface';
import { IAttendanceRepository } from '../../infrastructure/repositories/interfaces/attendance-repository.interface';
import { IFeeRepository } from '../../infrastructure/repositories/interfaces/fee-repository.interface';
import { ILibraryRepository } from '../../infrastructure/repositories/interfaces/library-repository.interface';
import { IInventoryRepository } from '../../infrastructure/repositories/interfaces/inventory-repository.interface';

@Injectable()
export class DashboardService {
  constructor(
    @Inject('IStudentRepository')
    private readonly studentRepository: IStudentRepository,
    @Inject('IStaffRepository')
    private readonly staffRepository: IStaffRepository,
    @Inject('IAttendanceRepository')
    private readonly attendanceRepository: IAttendanceRepository,
    @Inject('IFeeRepository')
    private readonly feeRepository: IFeeRepository,
    @Inject('ILibraryRepository')
    private readonly libraryRepository: ILibraryRepository,
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async getSummary() {
    const today = new Date().toISOString().split('T')[0];

    const totalStudents = await this.studentRepository.count();
    const totalStaff = await this.staffRepository.count();
    const attendanceStats = await this.attendanceRepository.findSummaryByDate(today, 'SCH-001');

    const overdueBooks = await this.libraryRepository.findOverdueLoans();
    const inventoryItems = await this.inventoryRepository.findAll();
    const lowStockCount = inventoryItems.filter((i) => i.currentStock <= i.reorderLevel).length;

    return {
      environment: 'DEVELOPMENT_MOCK_STORAGE',
      disclaimer: 'Data is aggregated from volatile in-memory repositories for local demonstration.',
      metrics: {
        students: {
          totalEnrolled: totalStudents,
          active: totalStudents,
        },
        staff: {
          totalEmployed: totalStaff,
        },
        todayAttendance: {
          date: today,
          present: attendanceStats.present,
          absent: attendanceStats.absent,
          late: attendanceStats.late,
        },
        finances: {
          currency: 'INR',
          totalAnnualStructuresCount: 1,
          ledgerStatus: 'ACTIVE',
        },
        library: {
          overdueBooksCount: overdueBooks.length,
        },
        inventory: {
          lowStockAlerts: lowStockCount,
        },
      },
      lastRefreshedAt: new Date().toISOString(),
    };
  }
}
