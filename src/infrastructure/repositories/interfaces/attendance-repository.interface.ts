import { IBaseRepository } from './base-repository.interface';

export interface AttendanceRecordEntity {
  id: string;
  studentId?: string;
  staffId?: string;
  targetType: 'STUDENT' | 'STAFF';
  date: string; // YYYY-MM-DD
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  recordedBy: string;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendanceRepository extends IBaseRepository<AttendanceRecordEntity> {
  findByTargetAndDate(targetType: 'STUDENT' | 'STAFF', targetId: string, date: string): Promise<AttendanceRecordEntity | null>;
  findSummaryByDate(date: string, schoolId: string): Promise<{ total: number; present: number; absent: number; late: number }>;
}
