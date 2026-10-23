import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  IExamRepository,
  ExamEntity,
  ExamScheduleEntity,
} from '../../infrastructure/repositories/interfaces/exam-repository.interface';
import { CreateExamDto } from './dto/create-exam.dto';
import { CreateExamScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class ExaminationsService {
  constructor(
    @Inject('IExamRepository')
    private readonly examRepository: IExamRepository,
  ) {}

  async findAll(): Promise<ExamEntity[]> {
    return this.examRepository.findAll();
  }

  async findById(id: string): Promise<ExamEntity> {
    const exam = await this.examRepository.findById(id);
    if (!exam) {
      throw new NotFoundException(`Exam with id '${id}' not found`);
    }
    return exam;
  }

  async create(dto: CreateExamDto): Promise<ExamEntity> {
    return this.examRepository.create({
      ...dto,
      schoolId: 'SCH-001',
    });
  }

  async getSchedules(examId: string): Promise<ExamScheduleEntity[]> {
    await this.findById(examId);
    return this.examRepository.findSchedulesByExam(examId);
  }

  async addSchedule(examId: string, dto: CreateExamScheduleDto): Promise<ExamScheduleEntity> {
    await this.findById(examId);

    // Business Rule: Conflict Detection (Hall or Invigilator double-booking)
    const conflicts = await this.examRepository.findScheduleConflicts(
      dto.date,
      dto.startTime,
      dto.endTime,
      dto.roomNumber,
      dto.invigilatorStaffId,
    );

    if (conflicts.length > 0) {
      const roomConflict = conflicts.some((c) => c.roomNumber.toLowerCase() === dto.roomNumber.toLowerCase());
      const staffConflict = conflicts.some((c) => c.invigilatorStaffId === dto.invigilatorStaffId);

      const conflictReason = roomConflict
        ? `Room '${dto.roomNumber}' is already booked on ${dto.date} between ${dto.startTime}-${dto.endTime}`
        : `Invigilator '${dto.invigilatorStaffId}' is already assigned to another exam slot on ${dto.date} between ${dto.startTime}-${dto.endTime}`;

      throw new ConflictException(`Exam schedule conflict: ${conflictReason}`);
    }

    return this.examRepository.addSchedule({
      examId,
      ...dto,
    });
  }
}
