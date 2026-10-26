import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnprocessableEntityError
} from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-codes';
import { ExamRepository } from '../examinations/examinations.repository';
import { ResultComputationService } from './result-computation.service';
import { ResultsRepository } from './results.repository';
import { StudentExamResult } from './results.types';

export class ResultPublishingService {
  constructor(
    private readonly resultsRepository: ResultsRepository,
    private readonly examRepository: ExamRepository,
    private readonly computationService: ResultComputationService
  ) {}

  /**
   * Publish an examination result for a student or by result ID.
   * Ensures that all required subjects have marks entered, prevents duplicate publication,
   * sets status to PUBLISHED, and locks marks from silent modification.
   */
  async publishResult(resultId: string, publishedBy = 'Admin'): Promise<StudentExamResult> {
    const existingResult = await this.resultsRepository.findResultById(resultId);
    if (!existingResult) {
      throw new NotFoundError(
        `Examination result '${resultId}' not found`,
        ErrorCode.RESULT_NOT_FOUND,
        [{ field: 'resultId', message: 'Result record does not exist', code: ErrorCode.RESULT_NOT_FOUND }]
      );
    }

    // Prevent accidental duplicate publication
    if (existingResult.status === 'PUBLISHED') {
      throw new ConflictError(
        `Result '${resultId}' is already published on ${existingResult.publishedAt}`,
        ErrorCode.RESULT_ALREADY_PUBLISHED,
        [{ field: 'status', message: 'Result is already published', code: ErrorCode.RESULT_ALREADY_PUBLISHED }]
      );
    }

    const exam = await this.examRepository.findById(existingResult.examId);
    if (!exam) {
      throw new NotFoundError(`Examination '${existingResult.examId}' not found`, ErrorCode.EXAM_NOT_FOUND);
    }

    // Verify all mandatory examination subjects have entered marks
    const enteredMarks = await this.resultsRepository.listMarks(exam.id, existingResult.studentId);
    const enteredSubjectIds = new Set(enteredMarks.map((m) => m.subjectId));

    const missingSubjects = exam.subjects.filter((s) => !enteredSubjectIds.has(s.subjectId));
    if (missingSubjects.length > 0) {
      const missingNames = missingSubjects.map((s) => s.subjectName || s.subjectId).join(', ');
      throw new UnprocessableEntityError(
        `Cannot publish result: Marks have not been entered for mandatory subject(s): ${missingNames}`,
        ErrorCode.RESULT_INCOMPLETE_MARKS,
        [{
          field: 'subjects',
          message: `Incomplete marks for subjects: ${missingNames}`,
          code: ErrorCode.RESULT_INCOMPLETE_MARKS
        }]
      );
    }

    // Fetch grace policy if any
    const gracePolicy = await this.resultsRepository.getGracePolicy(exam.id);

    // Re-compute final result to ensure computation is fully verified
    const computed = this.computationService.computeResult(
      exam,
      existingResult.studentId,
      existingResult.studentName || `Student ${existingResult.studentId}`,
      enteredMarks,
      gracePolicy,
      publishedBy
    );

    const now = new Date().toISOString();
    computed.id = existingResult.id;
    computed.status = 'PUBLISHED';
    computed.publishedAt = now;
    computed.publishedBy = publishedBy;
    computed.auditTrail.push({
      action: 'PUBLISHED',
      timestamp: now,
      actor: publishedBy,
      details: { publishedAt: now }
    });

    // Lock entered marks status to PUBLISHED
    for (const m of enteredMarks) {
      m.status = 'PUBLISHED';
      await this.resultsRepository.saveMarks(m);
    }

    return this.resultsRepository.saveResult(computed);
  }
}
