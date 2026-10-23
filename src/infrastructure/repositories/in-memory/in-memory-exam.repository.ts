import { Injectable } from '@nestjs/common';
import { BaseInMemoryRepository } from './base-in-memory.repository';
import {
  IExamRepository,
  ExamEntity,
  ExamScheduleEntity,
  ExamMarkEntity,
} from '../interfaces/exam-repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InMemoryExamRepository extends BaseInMemoryRepository<ExamEntity> implements IExamRepository {
  private readonly schedules = new Map<string, ExamScheduleEntity>();
  private readonly marks = new Map<string, ExamMarkEntity>();

  constructor() {
    super('InMemoryExamRepository');
    this.seedDevExam();
  }

  private async seedDevExam() {
    const exam = await this.create({
      id: 'exm-001',
      title: 'Midterm Examination 2026',
      academicYearId: 'ay-2026',
      term: 'TERM_1',
      startDate: '2026-11-01',
      endDate: '2026-11-15',
      status: 'SCHEDULED',
      schoolId: 'SCH-001',
    });

    await this.addSchedule({
      examId: exam.id,
      subjectId: 'sbj-math',
      classId: 'cls-10',
      date: '2026-11-02',
      startTime: '09:00',
      endTime: '12:00',
      roomNumber: 'Hall-A',
      invigilatorStaffId: 'stf-001',
      maxMarks: 100,
      passMarks: 40,
    });
  }

  async addSchedule(schedule: Omit<ExamScheduleEntity, 'id'>): Promise<ExamScheduleEntity> {
    const id = uuidv4();
    const newSchedule: ExamScheduleEntity = { ...schedule, id };
    this.schedules.set(id, newSchedule);
    return { ...newSchedule };
  }

  async findSchedulesByExam(examId: string): Promise<ExamScheduleEntity[]> {
    return Array.from(this.schedules.values()).filter((s) => s.examId === examId);
  }

  async findScheduleConflicts(
    date: string,
    startTime: string,
    endTime: string,
    room: string,
    invigilatorId: string,
  ): Promise<ExamScheduleEntity[]> {
    return Array.from(this.schedules.values()).filter((s) => {
      const sameDate = s.date === date;
      const timeOverlap = !(endTime <= s.startTime || startTime >= s.endTime);
      const roomClash = s.roomNumber.toLowerCase() === room.toLowerCase();
      const staffClash = s.invigilatorStaffId === invigilatorId;
      return sameDate && timeOverlap && (roomClash || staffClash);
    });
  }

  async saveMarks(marksList: Omit<ExamMarkEntity, 'id'>[]): Promise<ExamMarkEntity[]> {
    const saved: ExamMarkEntity[] = [];
    for (const m of marksList) {
      const id = uuidv4();
      const markEntity: ExamMarkEntity = { ...m, id };
      this.marks.set(id, markEntity);
      saved.push(markEntity);
    }
    return saved;
  }

  async getStudentResults(examId: string, studentId: string): Promise<ExamMarkEntity[]> {
    const examSchedules = await this.findSchedulesByExam(examId);
    const scheduleIds = new Set(examSchedules.map((s) => s.id));
    return Array.from(this.marks.values()).filter(
      (m) => scheduleIds.has(m.examScheduleId) && m.studentId === studentId,
    );
  }
}
