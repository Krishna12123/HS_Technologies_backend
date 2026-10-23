import { Injectable } from '@nestjs/common';
import { BaseInMemoryRepository } from './base-in-memory.repository';
import { IAttendanceRepository, AttendanceRecordEntity } from '../interfaces/attendance-repository.interface';

@Injectable()
export class InMemoryAttendanceRepository extends BaseInMemoryRepository<AttendanceRecordEntity> implements IAttendanceRepository {
  constructor() {
    super('InMemoryAttendanceRepository');
  }

  async findByTargetAndDate(
    targetType: 'STUDENT' | 'STAFF',
    targetId: string,
    date: string,
  ): Promise<AttendanceRecordEntity | null> {
    const all = Array.from(this.items.values());
    const match = all.find((r) => {
      const idMatch = targetType === 'STUDENT' ? r.studentId === targetId : r.staffId === targetId;
      return r.targetType === targetType && idMatch && r.date === date;
    });
    return match ? { ...match } : null;
  }

  async findSummaryByDate(date: string, schoolId: string): Promise<{ total: number; present: number; absent: number; late: number }> {
    const all = Array.from(this.items.values()).filter((r) => r.date === date && r.schoolId === schoolId);
    return {
      total: all.length,
      present: all.filter((r) => r.status === 'PRESENT').length,
      absent: all.filter((r) => r.status === 'ABSENT').length,
      late: all.filter((r) => r.status === 'LATE').length,
    };
  }
}
