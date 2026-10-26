import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnprocessableEntityError
} from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-codes';
import { PaginatedResult, PaginationParams } from '../../common/interfaces/pagination.interface';
import { ExamRepository } from '../examinations/examinations.repository';
import { GradingService } from './grading.service';
import { ResultRepository } from './results.repository';
import {
  BulkCreateResultInput,
  CreateResultInput,
  Result,
  ResultAuditEntry,
  ResultFilters,
  StudentReportCard,
  UpdateResultInput
} from './results.types';

export class ResultsService {
  constructor(
    private readonly resultRepository: ResultRepository,
    private readonly examRepository: ExamRepository,
    private readonly gradingService: GradingService
  ) {}

  private validateMarks(marksObtained: number, maxMarks: number): void {
    if (typeof marksObtained !== 'number' || isNaN(marksObtained)) {
      throw new UnprocessableEntityError('Marks obtained must be a valid number', ErrorCode.RESULT_INVALID_MARKS);
    }
    if (typeof maxMarks !== 'number' || isNaN(maxMarks)) {
      throw new UnprocessableEntityError('Maximum marks must be a valid number', ErrorCode.RESULT_INVALID_MARKS);
    }
    if (maxMarks <= 0) {
      throw new UnprocessableEntityError(
        'Maximum marks must be strictly greater than 0',
        ErrorCode.RESULT_INVALID_MARKS,
        [{ field: 'maxMarks', message: 'Maximum marks must be positive', code: ErrorCode.RESULT_INVALID_MARKS }]
      );
    }
    if (marksObtained < 0) {
      throw new UnprocessableEntityError(
        'Marks obtained cannot be negative',
        ErrorCode.RESULT_INVALID_MARKS,
        [{ field: 'marksObtained', message: 'Marks obtained must be non-negative', code: ErrorCode.RESULT_INVALID_MARKS }]
      );
    }
    if (marksObtained > maxMarks) {
      throw new UnprocessableEntityError(
        `Marks obtained (${marksObtained}) cannot exceed maximum marks (${maxMarks})`,
        ErrorCode.RESULT_INVALID_MARKS,
        [{ field: 'marksObtained', message: 'Marks obtained cannot exceed maximum marks', code: ErrorCode.RESULT_INVALID_MARKS }]
      );
    }
  }

  async createResult(input: CreateResultInput, changedBy?: string): Promise<Result> {
    this.validateMarks(input.marksObtained, input.maxMarks);

    // Verify Exam
    const exam = await this.examRepository.findById(input.examId);
    if (!exam) {
      throw new NotFoundError(`Examination '${input.examId}' not found`, ErrorCode.EXAM_NOT_FOUND);
    }

    // Examination status check: Results can only be entered once exam is PUBLISHED, IN_PROGRESS, or COMPLETED
    if (exam.status === 'DRAFT' || exam.status === 'CANCELLED') {
      throw new UnprocessableEntityError(
        `Results entry is not permitted for examinations in '${exam.status}' status`,
        ErrorCode.RESULT_EXAM_NOT_PERMITTED
      );
    }

    // Check duplicate result
    const existing = await this.resultRepository.findByUnique(
      input.studentId,
      input.examId,
      input.subjectId
    );
    if (existing) {
      throw new ConflictError(
        `Result already exists for student '${input.studentId}' in subject '${input.subjectId}' for examination '${input.examId}'`,
        ErrorCode.RESULT_DUPLICATE
      );
    }

    // Calculate Grade
    const score = await this.gradingService.calculateSubjectScore(
      input.marksObtained,
      input.maxMarks
    );

    const subject = exam.subjects.find((s) => s.subjectId === input.subjectId);

    return this.resultRepository.create(
      {
        studentId: input.studentId,
        studentName: input.studentName,
        examId: input.examId,
        examName: exam.name,
        subjectId: input.subjectId,
        subjectName: input.subjectName || subject?.subjectName || input.subjectId,
        maxMarks: input.maxMarks,
        marksObtained: input.marksObtained,
        percentage: score.percentage,
        grade: score.grade,
        isPassing: score.isPassing,
        remarks: input.remarks || score.remarks,
        status: 'DRAFT',
        schoolId: input.schoolId || exam.schoolId || 'SCH-001'
      },
      changedBy
    );
  }

  async bulkCreateResults(input: BulkCreateResultInput, changedBy?: string): Promise<Result[]> {
    const exam = await this.examRepository.findById(input.examId);
    if (!exam) {
      throw new NotFoundError(`Examination '${input.examId}' not found`, ErrorCode.EXAM_NOT_FOUND);
    }

    if (exam.status === 'DRAFT' || exam.status === 'CANCELLED') {
      throw new UnprocessableEntityError(
        `Results entry is not permitted for examinations in '${exam.status}' status`,
        ErrorCode.RESULT_EXAM_NOT_PERMITTED
      );
    }

    // Validate all items first
    for (const item of input.results) {
      this.validateMarks(item.marksObtained, item.maxMarks);

      const existing = await this.resultRepository.findByUnique(
        item.studentId,
        input.examId,
        item.subjectId
      );
      if (existing) {
        throw new ConflictError(
          `Duplicate result for student '${item.studentId}' in subject '${item.subjectId}'`,
          ErrorCode.RESULT_DUPLICATE
        );
      }
    }

    const createdResults: Result[] = [];
    for (const item of input.results) {
      const score = await this.gradingService.calculateSubjectScore(
        item.marksObtained,
        item.maxMarks
      );
      const subject = exam.subjects.find((s) => s.subjectId === item.subjectId);

      const result = await this.resultRepository.create(
        {
          studentId: item.studentId,
          studentName: item.studentName,
          examId: input.examId,
          examName: exam.name,
          subjectId: item.subjectId,
          subjectName: item.subjectName || subject?.subjectName || item.subjectId,
          maxMarks: item.maxMarks,
          marksObtained: item.marksObtained,
          percentage: score.percentage,
          grade: score.grade,
          isPassing: score.isPassing,
          remarks: item.remarks || score.remarks,
          status: 'DRAFT',
          schoolId: exam.schoolId || 'SCH-001'
        },
        changedBy
      );
      createdResults.push(result);
    }

    return createdResults;
  }

  async getResultById(resultId: string): Promise<Result> {
    const result = await this.resultRepository.findById(resultId);
    if (!result) {
      throw new NotFoundError(`Result '${resultId}' not found`, ErrorCode.RESULT_NOT_FOUND);
    }
    return result;
  }

  async listResults(
    filters: ResultFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Result>> {
    return this.resultRepository.findMany(filters, pagination);
  }

  async getStudentResults(studentId: string, examId?: string): Promise<Result[]> {
    return this.resultRepository.findByStudent(studentId, examId);
  }

  async getExamResults(examId: string): Promise<Result[]> {
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundError(`Examination '${examId}' not found`, ErrorCode.EXAM_NOT_FOUND);
    }
    return this.resultRepository.findByExam(examId);
  }

  async updateResult(
    resultId: string,
    input: UpdateResultInput,
    changedBy?: string,
    userRole?: string
  ): Promise<Result> {
    const existing = await this.getResultById(resultId);

    // Published result correction workflow
    if (existing.status === 'PUBLISHED') {
      if (!input.reason) {
        throw new UnprocessableEntityError(
          'Cannot modify a published result without an authorized correction reason',
          ErrorCode.RESULT_ALREADY_PUBLISHED
        );
      }
      if (userRole !== 'ADMIN' && userRole !== 'EXAM_OFFICER' && userRole !== 'SUPER_ADMIN') {
        throw new ForbiddenError(
          'Only administrators or exam officers are authorized to perform result corrections',
          ErrorCode.RESULT_UNAUTHORIZED_CORRECTION
        );
      }
    }

    let marksObtained = existing.marksObtained;
    let score: {
      percentage: number;
      grade: string;
      isPassing: boolean;
      remarks?: string;
    } = {
      percentage: existing.percentage,
      grade: existing.grade,
      isPassing: existing.isPassing,
      remarks: existing.remarks
    };

    if (input.marksObtained !== undefined) {
      this.validateMarks(input.marksObtained, existing.maxMarks);
      marksObtained = input.marksObtained;
      score = await this.gradingService.calculateSubjectScore(marksObtained, existing.maxMarks);
    }

    const isCorrection = existing.status === 'PUBLISHED';
    const auditEntry: ResultAuditEntry = {
      action: isCorrection ? 'CORRECTED' : 'UPDATED',
      timestamp: new Date().toISOString(),
      changedBy,
      reason: input.reason,
      previousMarks: existing.marksObtained,
      newMarks: marksObtained,
      previousGrade: existing.grade,
      newGrade: score.grade
    };

    const updated = await this.resultRepository.update(
      resultId,
      {
        marksObtained,
        percentage: score.percentage,
        grade: score.grade,
        isPassing: score.isPassing,
        remarks: input.remarks !== undefined ? input.remarks : score.remarks,
        status: isCorrection ? 'CORRECTED' : existing.status
      },
      auditEntry
    );

    if (!updated) {
      throw new NotFoundError(`Result '${resultId}' not found`, ErrorCode.RESULT_NOT_FOUND);
    }
    return updated;
  }

  async publishResult(
    resultId: string,
    changedBy?: string,
    userRole?: string
  ): Promise<Result> {
    if (userRole !== 'ADMIN' && userRole !== 'EXAM_OFFICER' && userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenError(
        'Insufficient permissions to publish examination results',
        ErrorCode.FORBIDDEN
      );
    }

    const existing = await this.getResultById(resultId);
    if (existing.status === 'PUBLISHED') {
      return existing;
    }

    // Verify marks integrity
    this.validateMarks(existing.marksObtained, existing.maxMarks);

    // Recalculate score with active grading criteria
    const score = await this.gradingService.calculateSubjectScore(
      existing.marksObtained,
      existing.maxMarks
    );

    const auditEntry: ResultAuditEntry = {
      action: 'PUBLISHED',
      timestamp: new Date().toISOString(),
      changedBy,
      newMarks: existing.marksObtained,
      newGrade: score.grade
    };

    const updated = await this.resultRepository.update(
      resultId,
      {
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
        percentage: score.percentage,
        grade: score.grade,
        isPassing: score.isPassing
      },
      auditEntry
    );

    if (!updated) {
      throw new NotFoundError(`Result '${resultId}' not found`, ErrorCode.RESULT_NOT_FOUND);
    }
    return updated;
  }

  async getStudentReportCard(studentId: string, examId: string): Promise<StudentReportCard> {
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundError(`Examination '${examId}' not found`, ErrorCode.EXAM_NOT_FOUND);
    }

    const results = await this.resultRepository.findByStudent(studentId, examId);
    if (results.length === 0) {
      throw new NotFoundError(
        `No results found for student '${studentId}' in examination '${examId}'`,
        ErrorCode.RESULT_NOT_FOUND
      );
    }

    const subjectItems = results.map((r) => ({
      subjectId: r.subjectId,
      subjectName: r.subjectName || r.subjectId,
      maxMarks: r.maxMarks,
      marksObtained: r.marksObtained,
      percentage: r.percentage,
      grade: r.grade,
      isPassing: r.isPassing,
      remarks: r.remarks
    }));

    const summary = await this.gradingService.calculateOverallScore(
      subjectItems,
      exam.passingCriteria?.minPassPercentage || 40
    );

    const allPublished = results.every((r) => r.status === 'PUBLISHED' || r.status === 'CORRECTED');
    const anyPublished = results.some((r) => r.status === 'PUBLISHED' || r.status === 'CORRECTED');

    const cardStatus: 'DRAFT' | 'PARTIALLY_PUBLISHED' | 'PUBLISHED' = allPublished
      ? 'PUBLISHED'
      : anyPublished
      ? 'PARTIALLY_PUBLISHED'
      : 'DRAFT';

    return {
      studentId,
      studentName: results[0]?.studentName || `Student ${studentId}`,
      examId,
      examName: exam.name,
      academicYear: exam.academicYearId,
      subjects: subjectItems,
      summary,
      status: cardStatus,
      generatedAt: new Date().toISOString()
    };
  }
}
