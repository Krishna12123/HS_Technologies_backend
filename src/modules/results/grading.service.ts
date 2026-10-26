import { roundToTwoDecimals } from '../../common/utils/date.util';
import { MasterRepository } from '../masters/masters.repository';
import { GradeRangeItem, GradingSchemeRecord } from '../masters/masters.types';

export interface SubjectGradingResult {
  percentage: number;
  grade: string;
  isPassing: boolean;
  gradePoint?: number;
  remarks?: string;
}

export interface OverallGradingResult {
  totalMaxMarks: number;
  totalMarksObtained: number;
  overallPercentage: number;
  overallGrade: string;
  overallResult: 'PASS' | 'FAIL';
  passedSubjectsCount: number;
  totalSubjectsCount: number;
}

export class GradingService {
  constructor(private readonly masterRepository?: MasterRepository) {}

  private readonly DEFAULT_RANGES: GradeRangeItem[] = [
    { grade: 'A+', minPercentage: 90, maxPercentage: 100, gradePoint: 10, isPassing: true, remarks: 'Outstanding' },
    { grade: 'A', minPercentage: 80, maxPercentage: 89.99, gradePoint: 9, isPassing: true, remarks: 'Excellent' },
    { grade: 'B+', minPercentage: 70, maxPercentage: 79.99, gradePoint: 8, isPassing: true, remarks: 'Very Good' },
    { grade: 'B', minPercentage: 60, maxPercentage: 69.99, gradePoint: 7, isPassing: true, remarks: 'Good' },
    { grade: 'C', minPercentage: 50, maxPercentage: 59.99, gradePoint: 6, isPassing: true, remarks: 'Above Average' },
    { grade: 'D', minPercentage: 40, maxPercentage: 49.99, gradePoint: 5, isPassing: true, remarks: 'Pass' },
    { grade: 'F', minPercentage: 0, maxPercentage: 39.99, gradePoint: 0, isPassing: false, remarks: 'Fail' }
  ];

  async getGradeRanges(schemeId = 'gs-standard'): Promise<GradeRangeItem[]> {
    if (!this.masterRepository) {
      return this.DEFAULT_RANGES;
    }

    try {
      const scheme = await this.masterRepository.findById('grading-schemes', schemeId);
      if (scheme && scheme.metadata?.ranges && scheme.metadata.ranges.length > 0) {
        return scheme.metadata.ranges as GradeRangeItem[];
      }
    } catch {
      // Fallback if scheme lookup fails
    }

    return this.DEFAULT_RANGES;
  }

  /**
   * Calculate subject percentage and determine corresponding grade based on Master criteria.
   * Rounding policy: standard half-up rounded to 2 decimal places.
   */
  async calculateSubjectScore(
    marksObtained: number,
    maxMarks: number,
    schemeId = 'gs-standard'
  ): Promise<SubjectGradingResult> {
    const rawPercentage = (marksObtained / maxMarks) * 100;
    const percentage = roundToTwoDecimals(rawPercentage);
    const ranges = await this.getGradeRanges(schemeId);

    // Find matching range
    // Ranges are sorted or checked by boundaries
    let matchedRange = ranges.find(
      (r) => percentage >= r.minPercentage && percentage <= r.maxPercentage
    );

    // Edge-case: if percentage is slightly higher than 100 due to bonus or exact boundary
    if (!matchedRange && percentage >= 100) {
      matchedRange = ranges[0];
    } else if (!matchedRange) {
      // Default fallback to lowest range
      matchedRange = ranges[ranges.length - 1];
    }

    return {
      percentage,
      grade: matchedRange.grade,
      isPassing: matchedRange.isPassing,
      gradePoint: matchedRange.gradePoint,
      remarks: matchedRange.remarks
    };
  }

  /**
   * Calculate overall marks, percentage, overall grade, and overall pass/fail status.
   */
  async calculateOverallScore(
    subjects: Array<{ marksObtained: number; maxMarks: number; isPassing: boolean }>,
    minPassPercentage = 40,
    schemeId = 'gs-standard'
  ): Promise<OverallGradingResult> {
    const totalMaxMarks = subjects.reduce((sum, s) => sum + s.maxMarks, 0);
    const totalMarksObtained = subjects.reduce((sum, s) => sum + s.marksObtained, 0);

    const overallPercentage =
      totalMaxMarks > 0
        ? roundToTwoDecimals((totalMarksObtained / totalMaxMarks) * 100)
        : 0;

    const ranges = await this.getGradeRanges(schemeId);
    let matchedRange = ranges.find(
      (r) => overallPercentage >= r.minPercentage && overallPercentage <= r.maxPercentage
    );

    if (!matchedRange && overallPercentage >= 100) {
      matchedRange = ranges[0];
    } else if (!matchedRange) {
      matchedRange = ranges[ranges.length - 1];
    }

    const passedSubjectsCount = subjects.filter((s) => s.isPassing).length;
    const totalSubjectsCount = subjects.length;

    // Overall is PASS only if all individual subjects passed AND overall percentage meets minPassPercentage
    const allSubjectsPassed = passedSubjectsCount === totalSubjectsCount;
    const overallResult: 'PASS' | 'FAIL' =
      allSubjectsPassed && overallPercentage >= minPassPercentage ? 'PASS' : 'FAIL';

    return {
      totalMaxMarks,
      totalMarksObtained,
      overallPercentage,
      overallGrade: matchedRange.grade,
      overallResult,
      passedSubjectsCount,
      totalSubjectsCount
    };
  }
}
