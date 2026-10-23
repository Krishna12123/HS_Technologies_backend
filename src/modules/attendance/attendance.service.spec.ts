import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { InMemoryAttendanceRepository } from '../../infrastructure/repositories/in-memory/in-memory-attendance.repository';
import { ConflictException } from '@nestjs/common';

describe('AttendanceService (Business Logic)', () => {
  let service: AttendanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: 'IAttendanceRepository',
          useClass: InMemoryAttendanceRepository,
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  it('should successfully record attendance for a student', async () => {
    const record = await service.recordAttendance(
      {
        studentId: 'std-test-1',
        targetType: 'STUDENT',
        date: '2026-10-24',
        status: 'PRESENT',
      },
      'usr-teacher-1',
    );

    expect(record).toBeDefined();
    expect(record.studentId).toEqual('std-test-1');
    expect(record.status).toEqual('PRESENT');
  });

  it('should prevent duplicate attendance submission for same student on same date', async () => {
    await service.recordAttendance(
      {
        studentId: 'std-test-2',
        targetType: 'STUDENT',
        date: '2026-10-24',
        status: 'PRESENT',
      },
      'usr-teacher-1',
    );

    await expect(
      service.recordAttendance(
        {
          studentId: 'std-test-2',
          targetType: 'STUDENT',
          date: '2026-10-24',
          status: 'ABSENT',
        },
        'usr-teacher-1',
      ),
    ).rejects.toThrow(ConflictException);
  });
});
