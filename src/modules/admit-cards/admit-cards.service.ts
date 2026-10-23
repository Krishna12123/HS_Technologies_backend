import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { IStudentRepository } from '../../infrastructure/repositories/interfaces/student-repository.interface';
import { IExamRepository } from '../../infrastructure/repositories/interfaces/exam-repository.interface';
import { IAttendanceRepository } from '../../infrastructure/repositories/interfaces/attendance-repository.interface';
import { IFeeRepository } from '../../infrastructure/repositories/interfaces/fee-repository.interface';
import { IDocumentGenerator } from '../../infrastructure/document-generation/document-generator.interface';

@Injectable()
export class AdmitCardsService {
  constructor(
    @Inject('IStudentRepository')
    private readonly studentRepository: IStudentRepository,
    @Inject('IExamRepository')
    private readonly examRepository: IExamRepository,
    @Inject('IAttendanceRepository')
    private readonly attendanceRepository: IAttendanceRepository,
    @Inject('IFeeRepository')
    private readonly feeRepository: IFeeRepository,
    @Inject('IDocumentGenerator')
    private readonly documentGenerator: IDocumentGenerator,
  ) {}

  async generateAdmitCard(examId: string, studentId: string) {
    const student = await this.studentRepository.findById(studentId);
    if (!student) throw new NotFoundException(`Student '${studentId}' not found`);

    const exam = await this.examRepository.findById(examId);
    if (!exam) throw new NotFoundException(`Exam '${examId}' not found`);

    // Business Rule 1: Fee Clearance Check
    const invoices = await this.feeRepository.findInvoicesByStudent(studentId);
    const hasOverdueDues = invoices.some((i) => i.outstandingBalance > 0 && i.status === 'OVERDUE');
    if (hasOverdueDues) {
      throw new BadRequestException(
        `Admit card generation blocked: Student has overdue fee balances. Please clear dues with Accounts.`,
      );
    }

    // Business Rule 2: Minimum Attendance Requirement (e.g. 75%)
    const attendanceRecords = await this.attendanceRepository.findAll({
      targetType: 'STUDENT',
      studentId,
    });
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter((r) => r.status === 'PRESENT').length;
    const attendancePct = total > 0 ? (present / total) * 100 : 100;

    if (attendancePct < 75) {
      throw new BadRequestException(
        `Admit card generation blocked: Attendance is ${attendancePct.toFixed(1)}% (Minimum required: 75%).`,
      );
    }

    const schedules = await this.examRepository.findSchedulesByExam(examId);

    const doc = await this.documentGenerator.generatePdf({
      title: `Admit Card - ${student.firstName} ${student.lastName}`,
      templateType: 'ADMIT_CARD',
      data: {
        examTitle: exam.title,
        studentName: `${student.firstName} ${student.lastName}`,
        admissionNumber: student.admissionNumber,
        classId: student.classId,
        sectionId: student.sectionId,
        schedules,
      },
    });

    return {
      eligible: true,
      attendancePercentage: Number(attendancePct.toFixed(1)),
      feeStatus: 'CLEARED',
      document: doc,
    };
  }
}
