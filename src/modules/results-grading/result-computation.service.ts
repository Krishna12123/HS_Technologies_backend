import { roundToTwoDecimals } from '../../common/utils/date.util';
import { Examination } from '../examinations/examinations.types';
import { GradingEngineService } from './grading.service';
import {
  GraceMarksPolicy,
  MarksRecord,
  OverallResultComputation,
  StudentExamResult,
  SubjectResultComputation
} from './results.types';

export class ResultComputationService {
  constructor(private readonly gradingEngine: GradingEngineService) {}

  /**
   * Computes individual subject scores, applies configurable grace marks if needed and permitted,
   * and aggregates total marks and overall pass/fail status.
   *
   * Formula documentation:
   * 1. Subject Percentage = roundToTwoDecimals((finalMarks / maxMarks) * 100)
   * 2. Subject Passing Condition = finalMarks >= subject.passMarks
   * 3. Grace Marks: If marksObtained < passMarks AND (passMarks - marksObtained) <= maxGraceMarksPerSubject:
   *    graceMarks = passMarks - marksObtained (capped so finalMarks <= maxMarks and within total grace allowance).
   * 4. Overall Percentage = totalMaxMarks > 0 ? roundToTwoDecimals((totalFinalMarks / totalMaxMarks) * 100) : 0
   * 5. Overall Status = All required subjects passed ? 'PASS' : 'FAIL'
   */
  public computeResult(
    exam: Examination,
    studentId: string,
    studentName: string,
    marksRecords: MarksRecord[],
    gracePolicy: GraceMarksPolicy | null = null,
    actor = 'System'
  ): StudentExamResult {
    const subjectWiseResults: SubjectResultComputation[] = [];
    let remainingTotalGrace = gracePolicy?.enabled ? gracePolicy.maxTotalGraceMarks : 0;

    for (const subject of exam.subjects) {
      const marks = marksRecords.find((m) => m.subjectId === subject.subjectId);
      const marksObtained = marks ? marks.marksObtained : 0;
      const maxMarks = subject.maxMarks;
      const passMarks = subject.passMarks;

      let graceMarks = 0;
      let isPassing = marksObtained >= passMarks;

      // Apply grace marks if eligible and policy is explicitly configured & enabled
      if (!isPassing && gracePolicy && gracePolicy.enabled) {
        const shortfall = passMarks - marksObtained;
        if (
          shortfall > 0 &&
          shortfall <= gracePolicy.maxGraceMarksPerSubject &&
          shortfall <= remainingTotalGrace
        ) {
          graceMarks = shortfall;
          remainingTotalGrace -= shortfall;
          isPassing = true;
        }
      }

      // Ensure finalMarks never exceeds subject's maximum marks
      const finalMarks = Math.min(marksObtained + graceMarks, maxMarks);
      const percentage = this.gradingEngine.calculatePercentage(finalMarks, maxMarks);
      const gradeResult = this.gradingEngine.assignGrade(percentage);

      subjectWiseResults.push({
        subjectId: subject.subjectId,
        subjectName: subject.subjectName || subject.subjectId,
        marksObtained,
        graceMarks,
        finalMarks,
        maxMarks,
        percentage,
        grade: gradeResult.grade,
        isPassing
      });
    }

    const totalObtainedMarks = subjectWiseResults.reduce((acc, s) => acc + s.marksObtained, 0);
    const totalGraceMarks = subjectWiseResults.reduce((acc, s) => acc + s.graceMarks, 0);
    const totalFinalMarks = subjectWiseResults.reduce((acc, s) => acc + s.finalMarks, 0);
    const totalMaxMarks = subjectWiseResults.reduce((acc, s) => acc + s.maxMarks, 0);

    const overallPercentage =
      totalMaxMarks > 0 ? roundToTwoDecimals((totalFinalMarks / totalMaxMarks) * 100) : 0;

    const passedSubjectsCount = subjectWiseResults.filter((s) => s.isPassing).length;
    const totalSubjectsCount = subjectWiseResults.length;
    const overallStatus: 'PASS' | 'FAIL' =
      passedSubjectsCount === totalSubjectsCount ? 'PASS' : 'FAIL';

    const overall: OverallResultComputation = {
      totalObtainedMarks,
      totalGraceMarks,
      totalFinalMarks,
      totalMaxMarks,
      overallPercentage,
      overallStatus,
      passedSubjectsCount,
      totalSubjectsCount
    };

    const now = new Date().toISOString();
    return {
      id: `RES-${exam.id}-${studentId}`,
      examId: exam.id,
      studentId,
      studentName,
      subjects: subjectWiseResults,
      overall,
      status: 'COMPUTED',
      auditTrail: [
        {
          action: 'COMPUTED',
          timestamp: now,
          actor,
          details: { overallStatus, overallPercentage, totalGraceMarks }
        }
      ],
      createdAt: now,
      updatedAt: now
    };
  }
}
