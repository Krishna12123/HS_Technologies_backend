import { Test, TestingModule } from '@nestjs/testing';
import { ExaminationsService } from './examinations.service';
import { InMemoryExamRepository } from '../../infrastructure/repositories/in-memory/in-memory-exam.repository';
import { ConflictException } from '@nestjs/common';

describe('ExaminationsService (Business Logic)', () => {
  let service: ExaminationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExaminationsService,
        {
          provide: 'IExamRepository',
          useClass: InMemoryExamRepository,
        },
      ],
    }).compile();

    service = module.get<ExaminationsService>(ExaminationsService);
  });

  it('should detect examination hall and invigilator time conflicts', async () => {
    // Seeded schedule exists on 2026-11-02, 09:00 - 12:00 in 'Hall-A' with invigilator 'stf-001'
    await expect(
      service.addSchedule('exm-001', {
        subjectId: 'sbj-sci',
        classId: 'cls-10',
        date: '2026-11-02',
        startTime: '10:00',
        endTime: '11:30',
        roomNumber: 'Hall-A',
        invigilatorStaffId: 'stf-999',
        maxMarks: 100,
        passMarks: 40,
      }),
    ).rejects.toThrow(ConflictException);
  });
});
