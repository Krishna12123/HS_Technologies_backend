import {
  BadRequestError,
  NotFoundError,
  UnprocessableEntityError
} from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-codes';
import { PaginatedResult, PaginationParams } from '../../common/interfaces/pagination.interface';
import { ExamRepository } from './examinations.repository';
import {
  CreateExamInput,
  Examination,
  ExamFilters,
  ExamStatus,
  UpdateExamInput
} from './examinations.types';

export class ExaminationsService {
  constructor(private readonly examRepository: ExamRepository) {}

  private readonly VALID_STATUS_TRANSITIONS: Record<ExamStatus, ExamStatus[]> = {
    DRAFT: ['SCHEDULED', 'CANCELLED'],
    SCHEDULED: ['PUBLISHED', 'DRAFT', 'CANCELLED'],
    PUBLISHED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: []
  };

  async createExam(input: CreateExamInput): Promise<Examination> {
    if (new Date(input.endDate).getTime() < new Date(input.startDate).getTime()) {
      throw new BadRequestError(
        'Exam endDate must be on or after startDate',
        ErrorCode.INVALID_TIME_RANGE,
        [{ field: 'endDate', message: 'End date must be after start date', code: ErrorCode.INVALID_TIME_RANGE }]
      );
    }
    return this.examRepository.create(input);
  }

  async getExamById(examId: string): Promise<Examination> {
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundError(
        `Examination '${examId}' not found`,
        ErrorCode.EXAM_NOT_FOUND,
        [{ field: 'examId', message: 'Examination does not exist', code: ErrorCode.EXAM_NOT_FOUND }]
      );
    }
    return exam;
  }

  async listExams(
    filters: ExamFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Examination>> {
    return this.examRepository.findMany(filters, pagination);
  }

  async updateExam(examId: string, input: UpdateExamInput): Promise<Examination> {
    const existing = await this.getExamById(examId);

    if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
      throw new UnprocessableEntityError(
        `Cannot update examination in '${existing.status}' status`,
        ErrorCode.EXAM_NOT_MODIFIABLE
      );
    }

    if (input.startDate && input.endDate) {
      if (new Date(input.endDate).getTime() < new Date(input.startDate).getTime()) {
        throw new BadRequestError(
          'Exam endDate must be on or after startDate',
          ErrorCode.INVALID_TIME_RANGE
        );
      }
    }

    const updated = await this.examRepository.update(examId, input);
    if (!updated) {
      throw new NotFoundError(`Examination '${examId}' not found`, ErrorCode.EXAM_NOT_FOUND);
    }
    return updated;
  }

  async updateExamStatus(examId: string, newStatus: ExamStatus): Promise<Examination> {
    const existing = await this.getExamById(examId);

    const allowed = this.VALID_STATUS_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new UnprocessableEntityError(
        `Invalid status transition from '${existing.status}' to '${newStatus}'. Allowed transitions: ${allowed.join(', ') || 'none'}`,
        ErrorCode.EXAM_INVALID_STATUS_TRANSITION
      );
    }

    const updated = await this.examRepository.updateStatus(examId, newStatus);
    if (!updated) {
      throw new NotFoundError(`Examination '${examId}' not found`, ErrorCode.EXAM_NOT_FOUND);
    }
    return updated;
  }
}
