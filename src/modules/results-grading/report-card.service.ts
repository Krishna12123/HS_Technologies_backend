import { NotFoundError } from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-codes';
import { ExamRepository } from '../examinations/examinations.repository';
import { ResultsRepository } from './results.repository';
import { StudentReportCard } from './results.types';

export class ReportCardService {
  constructor(
    private readonly resultsRepository: ResultsRepository,
    private readonly examRepository: ExamRepository
  ) {}

  /**
   * Generates student report card for a specific exam.
   * Restricts unpublished results from being exposed to the student.
   * Returns 404 if the exam, student, or published result does not exist.
   */
  async generateStudentReportCard(
    examId: string,
    studentId: string
  ): Promise<StudentReportCard> {
    // 1. Validate Exam reference
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundError(
        `Examination '${examId}' not found`,
        ErrorCode.EXAM_NOT_FOUND,
        [{ field: 'examId', message: 'Examination does not exist', code: ErrorCode.EXAM_NOT_FOUND }]
      );
    }

    // 2. Validate Student reference
    const student = await this.resultsRepository.findStudentById(studentId);
    if (!student) {
      throw new NotFoundError(
        `Student '${studentId}' not found`,
        ErrorCode.NOT_FOUND,
        [{ field: 'studentId', message: 'Student does not exist', code: ErrorCode.NOT_FOUND }]
      );
    }

    // 3. Find Result
    const result = await this.resultsRepository.findResultByStudentAndExam(examId, studentId);
    if (!result) {
      throw new NotFoundError(
        `No examination result found for student '${studentId}' in examination '${examId}'`,
        ErrorCode.RESULT_NOT_FOUND,
        [{ field: 'result', message: 'Result record not found', code: ErrorCode.RESULT_NOT_FOUND }]
      );
    }

    // 4. Ensure result is PUBLISHED (do not expose draft or unpublished results!)
    if (result.status !== 'PUBLISHED' && result.status !== 'CORRECTED') {
      throw new NotFoundError(
        `Examination result for student '${studentId}' has not been published yet`,
        ErrorCode.RESULT_NOT_FOUND,
        [{ field: 'status', message: 'Result is not published', code: ErrorCode.RESULT_NOT_FOUND }]
      );
    }

    return {
      studentId,
      studentName: result.studentName || student.name,
      examId,
      examName: exam.name,
      subjectWiseResults: result.subjects,
      totalObtainedMarks: result.overall.totalObtainedMarks,
      totalMaxMarks: result.overall.totalMaxMarks,
      overallPercentage: result.overall.overallPercentage,
      overallResultStatus: result.overall.overallStatus,
      publicationStatus: result.status,
      publishedAt: result.publishedAt
    };
  }
}
