import { Test, TestingModule } from '@nestjs/testing';
import { ResultsGradingService } from './results-grading.service';
import { InMemoryExamRepository } from '../../infrastructure/repositories/in-memory/in-memory-exam.repository';
import { BadRequestException } from '@nestjs/common';

describe('ResultsGradingService (Business Logic)', () => {
  let service: ResultsGradingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResultsGradingService,
        {
          provide: 'IExamRepository',
          useClass: InMemoryExamRepository,
        },
      ],
    }).compile();

    service = module.get<ResultsGradingService>(ResultsGradingService);
  });

  it('should correctly calculate grades based on percentage', () => {
    expect(service.calculateGrade(95)).toEqual('A1');
    expect(service.calculateGrade(85)).toEqual('A2');
    expect(service.calculateGrade(75)).toEqual('B1');
    expect(service.calculateGrade(65)).toEqual('B2');
    expect(service.calculateGrade(55)).toEqual('C1');
    expect(service.calculateGrade(45)).toEqual('C2');
    expect(service.calculateGrade(35)).toEqual('D');
    expect(service.calculateGrade(25)).toEqual('E (Needs Improvement)');
  });

  it('should reject marks outside 0-100 boundary', async () => {
    await expect(
      service.submitMarks('exm-001', [
        {
          examScheduleId: 'sch-001',
          studentId: 'std-001',
          marksObtained: 105,
        },
      ]),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.submitMarks('exm-001', [
        {
          examScheduleId: 'sch-001',
          studentId: 'std-001',
          marksObtained: -5,
        },
      ]),
    ).rejects.toThrow(BadRequestException);
  });
});
