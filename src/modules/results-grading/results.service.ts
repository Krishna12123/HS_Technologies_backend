import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnprocessableEntityError
} from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-codes';
import { ExamRepository } from '../examinations/examinations.repository';
import { MarksValidationService } from './marks-validation.service';
import { ResultComputationService } from './result-computation.service';
import { ResultsRepository } from './results.repository';
import {
  MarksRecord,
  StudentExamResult,
  SubmitMarksInput,
  UpdateMarksInput
} from './results.types';

export class ResultsService {
  constructor(
    private readonly resultsRepository: ResultsRepository,
    private readonly examRepository: ExamRepository,
    private readonly marksValidator: MarksValidationService,
    private readonly computationService: ResultComputationService
  ) {}

  /**
   * Submit marks for a student in an exam subject.
   */
  async submitMarks(
    examId: string,
    input: SubmitMarksInput,
    enteredBy = 'Teacher'
  ): Promise<MarksRecord> {
    // 1. Validate references presence
    this.marksValidator.validateReferences(examId, input.studentId, input.subjectId);

    // 2. Validate Examination exists
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundError(
        `Examination '${examId}' not found`,
        ErrorCode.EXAM_NOT_FOUND,
        [{ field: 'examId', message: 'Examination does not exist', code: ErrorCode.EXAM_NOT_FOUND }]
      );
    }

    // 3. Validate Student exists
    const student = await this.resultsRepository.findStudentById(input.studentId);
    if (!student) {
      throw new NotFoundError(
        `Student '${input.studentId}' not found in school records`,
        ErrorCode.NOT_FOUND,
        [{ field: 'studentId', message: 'Student does not exist', code: ErrorCode.NOT_FOUND }]
      );
    }

    // 4. Validate subject belongs to examination
    const subjectInExam = exam.subjects.find((s) => s.subjectId === input.subjectId);
    if (!subjectInExam) {
      throw new BadRequestError(
        `Subject '${input.subjectId}' is not registered under examination '${exam.name}'`,
        ErrorCode.VALIDATION_ERROR,
        [{ field: 'subjectId', message: 'Subject not part of this examination', code: ErrorCode.VALIDATION_ERROR }]
      );
    }

    // 5. Check if published result already exists -> prevent silent modification!
    const existingResult = await this.resultsRepository.findResultByStudentAndExam(examId, input.studentId);
    if (existingResult && existingResult.status === 'PUBLISHED') {
      throw new UnprocessableEntityError(
        'Result is already published. Modifications require an authorized correction workflow.',
        ErrorCode.RESULT_ALREADY_PUBLISHED,
        [{ field: 'status', message: 'Cannot modify marks for published result', code: ErrorCode.RESULT_ALREADY_PUBLISHED }]
      );
    }

    // 6. Prevent duplicate marks record
    const existingMarks = await this.resultsRepository.findMarks(examId, input.studentId, input.subjectId);
    if (existingMarks) {
      throw new ConflictError(
        `Marks already entered for student '${input.studentId}' in subject '${input.subjectId}' for exam '${examId}'`,
        ErrorCode.RESULT_DUPLICATE,
        [{ field: 'marks', message: 'Duplicate marks submission', code: ErrorCode.RESULT_DUPLICATE }]
      );
    }

    // 7. Validate marks bounds using MarksValidationService
    const maxMarks = input.maxMarks || subjectInExam.maxMarks;
    this.marksValidator.validateMarks(input.marksObtained, maxMarks);

    // 8. Persist marks record
    const now = new Date().toISOString();
    const marksRecord: MarksRecord = {
      id: '',
      examId,
      studentId: input.studentId,
      subjectId: input.subjectId,
      marksObtained: input.marksObtained,
      maxMarks,
      status: 'SUBMITTED',
      enteredBy: input.enteredBy || enteredBy,
      createdAt: now,
      updatedAt: now
    };

    const saved = await this.resultsRepository.saveMarks(marksRecord);

    // 9. Update/compute the in-progress result draft for the student
    const allStudentMarks = await this.resultsRepository.listMarks(examId, input.studentId);
    const gracePolicy = await this.resultsRepository.getGracePolicy(examId);
    const draftResult = this.computationService.computeResult(
      exam,
      input.studentId,
      student.name,
      allStudentMarks,
      gracePolicy,
      enteredBy
    );
    draftResult.status = 'DRAFT';
    if (existingResult) {
      draftResult.id = existingResult.id;
    }
    await this.resultsRepository.saveResult(draftResult);

    return saved;
  }

  /**
   * Retrieve marks for an exam with optional filtering.
   */
  async getMarks(
    examId: string,
    studentId?: string,
    subjectId?: string
  ): Promise<MarksRecord[]> {
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundError(`Examination '${examId}' not found`, ErrorCode.EXAM_NOT_FOUND);
    }
    return this.resultsRepository.listMarks(examId, studentId, subjectId);
  }

  /**
   * Authorized correction workflow for marks after publication.
   */
  async correctMarks(
    marksId: string,
    input: UpdateMarksInput,
    authorizedBy = 'Admin'
  ): Promise<MarksRecord> {
    const marks = await this.resultsRepository.findMarksById(marksId);
    if (!marks) {
      throw new NotFoundError(`Marks record '${marksId}' not found`, ErrorCode.RESULT_NOT_FOUND);
    }

    if (!input.reason || input.reason.trim().length === 0) {
      throw new BadRequestError('Correction reason is mandatory for modifying marks', ErrorCode.VALIDATION_ERROR);
    }

    this.marksValidator.validateMarks(input.marksObtained, marks.maxMarks);

    marks.marksObtained = input.marksObtained;
    marks.status = 'CORRECTED';
    marks.updatedAt = new Date().toISOString();
    const updated = await this.resultsRepository.saveMarks(marks);

    // Recompute result
    const exam = await this.examRepository.findById(marks.examId);
    const student = await this.resultsRepository.findStudentById(marks.studentId);
    if (exam && student) {
      const allMarks = await this.resultsRepository.listMarks(marks.examId, marks.studentId);
      const gracePolicy = await this.resultsRepository.getGracePolicy(marks.examId);
      const existingResult = await this.resultsRepository.findResultByStudentAndExam(marks.examId, marks.studentId);
      const recomputed = this.computationService.computeResult(
        exam,
        marks.studentId,
        student.name,
        allMarks,
        gracePolicy,
        authorizedBy
      );
      if (existingResult) {
        recomputed.id = existingResult.id;
        recomputed.status = 'CORRECTED';
        recomputed.auditTrail.push({
          action: 'CORRECTED',
          timestamp: new Date().toISOString(),
          actor: authorizedBy,
          reason: input.reason,
          details: { previousMarks: marks.marksObtained, newMarks: input.marksObtained }
        });
      }
      await this.resultsRepository.saveResult(recomputed);
    }

    return updated;
  }
}
