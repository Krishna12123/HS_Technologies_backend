import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import {
  IAttendanceRepository,
  AttendanceRecordEntity,
} from '../../infrastructure/repositories/interfaces/attendance-repository.interface';
import { RecordAttendanceDto } from './dto/record-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @Inject('IAttendanceRepository')
    private readonly attendanceRepository: IAttendanceRepository,
  ) {}

  async findAll(date?: string, targetType?: 'STUDENT' | 'STAFF'): Promise<AttendanceRecordEntity[]> {
    const filter: Record<string, any> = {};
    if (date) filter.date = date;
    if (targetType) filter.targetType = targetType;
    return this.attendanceRepository.findAll(filter);
  }

  async recordAttendance(dto: RecordAttendanceDto, recordedByUserId: string): Promise<AttendanceRecordEntity> {
    const targetId = dto.targetType === 'STUDENT' ? dto.studentId : dto.staffId;
    if (!targetId) {
      throw new ConflictException(`Target ID must be specified for ${dto.targetType}`);
    }

    // Duplicate Prevention Rule
    const existing = await this.attendanceRepository.findByTargetAndDate(
      dto.targetType,
      targetId,
      dto.date,
    );
    if (existing) {
      throw new ConflictException(
        `Attendance already recorded for ${dto.targetType} '${targetId}' on ${dto.date}. Use PATCH to update.`,
      );
    }

    return this.attendanceRepository.create({
      studentId: dto.studentId,
      staffId: dto.staffId,
      targetType: dto.targetType,
      date: dto.date,
      status: dto.status,
      remarks: dto.remarks,
      recordedBy: recordedByUserId,
      schoolId: 'SCH-001',
    });
  }

  async updateAttendance(id: string, status: AttendanceRecordEntity['status'], remarks?: string) {
    const record = await this.attendanceRepository.findById(id);
    if (!record) {
      throw new NotFoundException(`Attendance record '${id}' not found`);
    }
    return this.attendanceRepository.update(id, { status, remarks });
  }

  async getReports(date: string) {
    return this.attendanceRepository.findSummaryByDate(date, 'SCH-001');
  }
}
