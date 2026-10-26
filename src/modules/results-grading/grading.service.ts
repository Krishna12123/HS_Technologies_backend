import { BadRequestError, UnprocessableEntityError } from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-codes';
import { roundToTwoDecimals } from '../../common/utils/date.util';
import { GradeBoundary } from '../examinations/examinations.types';

export class GradingEngineService {
  private activeBoundaries: GradeBoundary[];

  constructor(customBoundaries?: GradeBoundary[]) {
    if (customBoundaries && customBoundaries.length > 0) {
      this.validateBoundaries(customBoundaries);
      this.activeBoundaries = customBoundaries;
    } else {
      // Default approved configuration based on prompt example
      this.activeBoundaries = [
        { grade: 'A1', minPercentage: 91, maxPercentage: 100, isPassing: true, remarks: 'Outstanding' },
        { grade: 'A2', minPercentage: 81, maxPercentage: 90.99, isPassing: true, remarks: 'Excellent' },
        { grade: 'B1', minPercentage: 71, maxPercentage: 80.99, isPassing: true, remarks: 'Very Good' },
        { grade: 'B2', minPercentage: 61, maxPercentage: 70.99, isPassing: true, remarks: 'Good' },
        { grade: 'C1', minPercentage: 51, maxPercentage: 60.99, isPassing: true, remarks: 'Fair' },
        { grade: 'C2', minPercentage: 41, maxPercentage: 50.99, isPassing: true, remarks: 'Average' },
        { grade: 'D', minPercentage: 33, maxPercentage: 40.99, isPassing: true, remarks: 'Pass' },
        { grade: 'E', minPercentage: 0, maxPercentage: 32.99, isPassing: false, remarks: 'Fail' }
      ];
    }
  }

  public validateBoundaries(boundaries: GradeBoundary[]): void {
    if (!boundaries || boundaries.length === 0) {
      throw new BadRequestError('Grading configuration must contain at least one grade boundary', ErrorCode.RESULT_GRADING_CONFIG_INVALID);
    }

    const sorted = [...boundaries].sort((a, b) => b.minPercentage - a.minPercentage);

    for (let i = 0; i < sorted.length; i++) {
      const b = sorted[i];

      if (b.minPercentage > b.maxPercentage) {
        throw new BadRequestError(
          `Invalid grade boundary for '${b.grade}': minPercentage (${b.minPercentage}) > maxPercentage (${b.maxPercentage})`,
          ErrorCode.RESULT_GRADING_CONFIG_INVALID
        );
      }

      if (b.minPercentage < 0 || b.maxPercentage > 100) {
        throw new BadRequestError(
          `Grade boundary for '${b.grade}' falls outside 0-100 scale: [${b.minPercentage}, ${b.maxPercentage}]`,
          ErrorCode.RESULT_GRADING_CONFIG_INVALID
        );
      }

      if (i < sorted.length - 1) {
        const next = sorted[i + 1];
        if (b.minPercentage <= next.maxPercentage) {
          throw new UnprocessableEntityError(
            `Overlapping grade ranges detected between grade '${b.grade}' [${b.minPercentage}, ${b.maxPercentage}] and grade '${next.grade}' [${next.minPercentage}, ${next.maxPercentage}]`,
            ErrorCode.RESULT_GRADING_CONFIG_INVALID
          );
        }
      }
    }
  }

  public setBoundaries(boundaries: GradeBoundary[]): void {
    this.validateBoundaries(boundaries);
    this.activeBoundaries = boundaries;
  }

  public getBoundaries(): GradeBoundary[] {
    return [...this.activeBoundaries];
  }

  /**
   * Calculate percentage from obtained and maximum marks.
   */
  public calculatePercentage(marksObtained: number, maxMarks: number): number {
    if (maxMarks <= 0) return 0;
    const raw = (marksObtained / maxMarks) * 100;
    return roundToTwoDecimals(raw);
  }

  /**
   * Determine grade from percentage against configured boundaries.
   */
  public assignGrade(percentage: number, boundaries?: GradeBoundary[]): {
    grade: string;
    isPassing: boolean;
    remarks?: string;
  } {
    const list = boundaries || this.activeBoundaries;

    // Check bounds
    if (percentage >= 100) {
      const top = list[0];
      return { grade: top.grade, isPassing: top.isPassing, remarks: top.remarks };
    }

    if (percentage <= 0) {
      const bottom = list[list.length - 1];
      return { grade: bottom.grade, isPassing: bottom.isPassing, remarks: bottom.remarks };
    }

    const matched = list.find(
      (b) => percentage >= b.minPercentage && percentage <= b.maxPercentage
    );

    if (matched) {
      return { grade: matched.grade, isPassing: matched.isPassing, remarks: matched.remarks };
    }

    // Fallback to lowest range if under all ranges
    const lowest = list[list.length - 1];
    return { grade: lowest.grade, isPassing: lowest.isPassing, remarks: lowest.remarks };
  }
}
