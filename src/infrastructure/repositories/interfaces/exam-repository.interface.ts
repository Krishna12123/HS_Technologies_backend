import { IBaseRepository } from './base-repository.interface';

export interface ExamEntity {
  id: string;
  title: string;
  academicYearId: string;
  term: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'PUBLISHED';
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExamScheduleEntity {
  id: string;
  examId: string;
  subjectId: string;
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  invigilatorStaffId: string;
  maxMarks: number;
  passMarks: number;
}

export interface ExamMarkEntity {
  id: string;
  examScheduleId: string;
  studentId: string;
  marksObtained: number;
  isAbsent: boolean;
  grade: string;
  feedback?: string;
}

export interface IExamRepository extends IBaseRepository<ExamEntity> {
  addSchedule(schedule: Omit<ExamScheduleEntity, 'id'>): Promise<ExamScheduleEntity>;
  findSchedulesByExam(examId: string): Promise<ExamScheduleEntity[]>;
  findScheduleConflicts(date: string, startTime: string, endTime: string, room: string, invigilatorId: string): Promise<ExamScheduleEntity[]>;
  saveMarks(marks: Omit<ExamMarkEntity, 'id'>[]): Promise<ExamMarkEntity[]>;
  getStudentResults(examId: string, studentId: string): Promise<ExamMarkEntity[]>;
}
