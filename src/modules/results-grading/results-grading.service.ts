import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { IExamRepository } from '../../infrastructure/repositories/interfaces/exam-repository.interface';

export interface StudentMarkInput {
  examScheduleId: string;
  studentId: string;
  marksObtained: number;
  isAbsent?: boolean;
  feedback?: string;
}

@Injectable()
export class ResultsGradingService {
  constructor(
    @Inject('IExamRepository')
    private readonly examRepository: IExamRepository,
  ) {}

  calculateGrade(marks: number, maxMarks = 100): string {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 91) return 'A1';
    if (percentage >= 81) return 'A2';
    if (percentage >= 71) return 'B1';
    if (percentage >= 61) return 'B2';
    if (percentage >= 51) return 'C1';
    if (percentage >= 41) return 'C2';
    if (percentage >= 33) return 'D';
    return 'E (Needs Improvement)';
  }

  async submitMarks(examId: string, marksList: StudentMarkInput[]) {
    const exam = await this.examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundException(`Exam '${examId}' not found`);
    }

    // Validation: Score boundaries
    for (const m of marksList) {
      if (m.marksObtained < 0 || m.marksObtained > 100) {
        throw new BadRequestException(
          `Invalid marks ${m.marksObtained} for student '${m.studentId}'. Must be between 0 and 100.`,
        );
      }
    }

    const marksToSave = marksList.map((m) => ({
      examScheduleId: m.examScheduleId,
      studentId: m.studentId,
      marksObtained: m.isAbsent ? 0 : m.marksObtained,
      isAbsent: Boolean(m.isAbsent),
      grade: m.isAbsent ? 'ABSENT' : this.calculateGrade(m.marksObtained),
      feedback: m.feedback,
    }));

    const saved = await this.examRepository.saveMarks(marksToSave);
    return {
      examId,
      recordsProcessed: saved.length,
      marks: saved,
    };
  }

  async getStudentExamResults(examId: string, studentId: string) {
    const exam = await this.examRepository.findById(examId);
    if (!exam) throw new NotFoundException(`Exam '${examId}' not found`);

    const marks = await this.examRepository.getStudentResults(examId, studentId);
    const totalMarks = marks.reduce((acc, m) => acc + m.marksObtained, 0);
    const maxPossible = marks.length * 100;
    const percentage = maxPossible > 0 ? (totalMarks / maxPossible) * 100 : 0;
    const overallGrade = this.calculateGrade(percentage);

    return {
      examTitle: exam.title,
      studentId,
      totalSubjects: marks.length,
      totalMarksObtained: totalMarks,
      maxPossibleMarks: maxPossible,
      percentage: Number(percentage.toFixed(2)),
      overallGrade,
      status: percentage >= 33 ? 'PASSED' : 'FAILED',
      marksBreakdown: marks,
    };
  }

  async publishResults(examId: string) {
    const exam = await this.examRepository.findById(examId);
    if (!exam) throw new NotFoundException(`Exam '${examId}' not found`);

    await this.examRepository.update(examId, { status: 'PUBLISHED' });
    return {
      examId,
      status: 'PUBLISHED',
      message: `Results for '${exam.title}' have been officially published.`,
    };
  }
}
