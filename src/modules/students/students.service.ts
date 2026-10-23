import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  IStudentRepository,
  StudentEntity,
} from '../../infrastructure/repositories/interfaces/student-repository.interface';
import { IAttendanceRepository } from '../../infrastructure/repositories/interfaces/attendance-repository.interface';
import { IFeeRepository } from '../../infrastructure/repositories/interfaces/fee-repository.interface';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @Inject('IStudentRepository')
    private readonly studentRepository: IStudentRepository,
    @Inject('IAttendanceRepository')
    private readonly attendanceRepository: IAttendanceRepository,
    @Inject('IFeeRepository')
    private readonly feeRepository: IFeeRepository,
  ) {}

  async findAll(classId?: string, sectionId?: string): Promise<StudentEntity[]> {
    if (classId && sectionId) {
      return this.studentRepository.findByClassAndSection(classId, sectionId);
    }
    const filter = classId ? { classId } : undefined;
    return this.studentRepository.findAll(filter);
  }

  async findById(id: string): Promise<StudentEntity> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException(`Student with id '${id}' not found`);
    }
    return student;
  }

  async create(dto: CreateStudentDto): Promise<StudentEntity> {
    const existing = await this.studentRepository.findByAdmissionNumber(dto.admissionNumber);
    if (existing) {
      throw new ConflictException(`Student with admission number '${dto.admissionNumber}' already exists`);
    }

    return this.studentRepository.create({
      ...dto,
      status: 'ACTIVE',
    });
  }

  async update(id: string, dto: UpdateStudentDto): Promise<StudentEntity> {
    await this.findById(id);
    return this.studentRepository.update(id, dto);
  }

  async getAttendanceHistory(studentId: string) {
    await this.findById(studentId);
    const records = await this.attendanceRepository.findAll({
      targetType: 'STUDENT',
      studentId,
    });
    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

    return {
      studentId,
      totalClasses: total,
      presentDays: present,
      attendancePercentage: percentage,
      records,
    };
  }

  async getFeeAccount(studentId: string) {
    await this.findById(studentId);
    const invoices = await this.feeRepository.findInvoicesByStudent(studentId);
    const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.netPayableAmount, 0);
    const totalPaid = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
    const outstandingBalance = totalInvoiced - totalPaid;

    return {
      studentId,
      totalInvoiced,
      totalPaid,
      outstandingBalance,
      status: outstandingBalance <= 0 ? 'CLEARED' : 'DUES_PENDING',
      invoices,
    };
  }
}
