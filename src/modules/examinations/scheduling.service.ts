import {
  BadRequestError,
  NotFoundError,
  UnprocessableEntityError
} from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-codes';
import { ConflictDetectorService } from './conflict-detector.service';
import { ExamRepository } from './examinations.repository';
import { CreateScheduleInput, ExamSchedule } from './examinations.types';

export class SchedulingService {
  constructor(
    private readonly examRepository: ExamRepository,
    private readonly conflictDetector: ConflictDetectorService
  ) {}

  /**
   * Schedule an examination slot after strictly verifying all 5 business rules:
   * Rule 1: Time Validation (startTime < endTime, dates within permitted exam date range)
   * Rule 2: Room Double-Booking Prevention (half-open [start, end) interval check)
   * Rule 3: Teacher/Invigilator Conflict Prevention (no overlapping invigilation duties)
   * Rule 4: Hall Capacity Validation (assigned hall capacity >= studentCount)
   * Rule 5: Schedule Integrity (exam and subject existence, atomic operation)
   */
  async createSchedule(
    examId: string,
    input: CreateScheduleInput,
    changedBy?: string
  ): Promise<ExamSchedule> {
    // 1. Fetch referenced examination
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundError(
        `Examination '${examId}' not found`,
        ErrorCode.INVALID_EXAM_OR_SUBJECT,
        [{ field: 'examId', message: 'Examination does not exist', code: ErrorCode.INVALID_EXAM_OR_SUBJECT }]
      );
    }

    if (exam.status === 'COMPLETED' || exam.status === 'CANCELLED') {
      throw new UnprocessableEntityError(
        `Cannot schedule examination in terminal status '${exam.status}'`,
        ErrorCode.EXAM_NOT_MODIFIABLE,
        [{ field: 'examId', message: 'Exam is in terminal state', code: ErrorCode.EXAM_NOT_MODIFIABLE }]
      );
    }

    // 2. Fetch room info
    const room = await this.examRepository.getRoom(input.roomId);
    if (!room) {
      throw new BadRequestError(
        `Assigned examination room '${input.roomId}' not found`,
        ErrorCode.INVALID_EXAM_OR_SUBJECT,
        [{ field: 'roomId', message: 'Room not found in school facilities', code: ErrorCode.INVALID_EXAM_OR_SUBJECT }]
      );
    }

    // 3. Fetch active schedules across the entire school to detect conflicts
    const activeSchedules = await this.examRepository.findActiveSchedules();

    // 4. Run conflict detection engine
    this.conflictDetector.validate(
      {
        examId,
        subjectId: input.subjectId,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        roomId: input.roomId,
        invigilatorIds: input.invigilatorIds,
        studentCount: input.studentCount
      },
      exam,
      room,
      activeSchedules
    );

    // 5. Persist schedule atomically
    const created = await this.examRepository.createSchedule(examId, {
      ...input,
      roomName: room.name
    }, changedBy);

    return created;
  }

  async listSchedules(examId: string): Promise<ExamSchedule[]> {
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundError(
        `Examination '${examId}' not found`,
        ErrorCode.EXAM_NOT_FOUND,
        [{ field: 'examId', message: 'Examination does not exist', code: ErrorCode.EXAM_NOT_FOUND }]
      );
    }
    return this.examRepository.findSchedulesByExamId(examId);
  }
}
