import { BadRequestError, UnprocessableEntityError } from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-codes';

export class MarksValidationService {
  /**
   * Validate marks bounds and integrity.
   * Reusable across marks entry, calculation, and correction operations.
   */
  public validateMarks(
    marksObtained: unknown,
    maxMarks: unknown,
    minMarks = 0
  ): { marksObtained: number; maxMarks: number } {
    // 1. Validate numeric types
    if (typeof marksObtained !== 'number' || isNaN(marksObtained)) {
      throw new BadRequestError(
        `Marks obtained must be a valid numeric value, received '${marksObtained}'`,
        ErrorCode.RESULT_INVALID_MARKS,
        [{ field: 'marksObtained', message: 'Marks obtained must be a valid number', code: ErrorCode.RESULT_INVALID_MARKS }]
      );
    }

    if (typeof maxMarks !== 'number' || isNaN(maxMarks)) {
      throw new BadRequestError(
        `Maximum marks must be a valid numeric value, received '${maxMarks}'`,
        ErrorCode.RESULT_INVALID_MARKS,
        [{ field: 'maxMarks', message: 'Maximum marks must be a valid number', code: ErrorCode.RESULT_INVALID_MARKS }]
      );
    }

    // 2. Validate maxMarks is strictly positive
    if (maxMarks <= 0) {
      throw new BadRequestError(
        `Maximum marks must be strictly positive (> 0), received ${maxMarks}`,
        ErrorCode.RESULT_INVALID_MARKS,
        [{ field: 'maxMarks', message: 'Maximum marks must be greater than 0', code: ErrorCode.RESULT_INVALID_MARKS }]
      );
    }

    // 3. Validate minMarks cannot be negative
    if (minMarks < 0) {
      throw new BadRequestError(
        `Minimum marks threshold cannot be negative, received ${minMarks}`,
        ErrorCode.RESULT_INVALID_MARKS,
        [{ field: 'minMarks', message: 'Minimum marks cannot be negative', code: ErrorCode.RESULT_INVALID_MARKS }]
      );
    }

    // 4. Validate obtained marks cannot be negative
    if (marksObtained < 0) {
      throw new BadRequestError(
        `Marks obtained cannot be negative, received ${marksObtained}`,
        ErrorCode.RESULT_INVALID_MARKS,
        [{ field: 'marksObtained', message: 'Marks obtained cannot be negative', code: ErrorCode.RESULT_INVALID_MARKS }]
      );
    }

    // 5. Validate obtained marks cannot exceed maximum permitted marks (No silent clamping!)
    if (marksObtained > maxMarks) {
      throw new BadRequestError(
        `Marks obtained (${marksObtained}) cannot exceed permitted maximum marks (${maxMarks})`,
        ErrorCode.RESULT_INVALID_MARKS,
        [{
          field: 'marksObtained',
          message: `Marks obtained (${marksObtained}) exceeds maxMarks (${maxMarks})`,
          code: ErrorCode.RESULT_INVALID_MARKS
        }]
      );
    }

    return { marksObtained, maxMarks };
  }

  /**
   * Validate references to exam and subject.
   */
  public validateReferences(
    examId?: string,
    studentId?: string,
    subjectId?: string
  ): void {
    if (!examId || examId.trim() === '') {
      throw new BadRequestError('Examination ID is required', ErrorCode.VALIDATION_ERROR, [
        { field: 'examId', message: 'Missing examination ID', code: ErrorCode.VALIDATION_ERROR }
      ]);
    }
    if (!studentId || studentId.trim() === '') {
      throw new BadRequestError('Student ID is required', ErrorCode.VALIDATION_ERROR, [
        { field: 'studentId', message: 'Missing student ID', code: ErrorCode.VALIDATION_ERROR }
      ]);
    }
    if (!subjectId || subjectId.trim() === '') {
      throw new BadRequestError('Subject ID is required', ErrorCode.VALIDATION_ERROR, [
        { field: 'subjectId', message: 'Missing subject ID', code: ErrorCode.VALIDATION_ERROR }
      ]);
    }
  }
}
