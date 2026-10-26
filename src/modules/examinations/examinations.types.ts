export type ExamPeriod = 'Term 1' | 'Midterm' | 'Final' | string;

export type ExamStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type ScheduleStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface ExamSubject {
  subjectId: string;
  subjectName?: string;
  maxMarks: number;
  passMarks: number;
}

export interface ScheduleAuditEntry {
  action: 'CREATED' | 'UPDATED' | 'CANCELLED' | 'STATUS_CHANGED';
  timestamp: string;
  changedBy?: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

export interface ExamSchedule {
  id: string;
  examId: string;
  subjectId: string;
  subjectName?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO 8601 or HH:mm
  endTime: string; // ISO 8601 or HH:mm
  roomId: string;
  roomName?: string;
  studentCount: number;
  invigilatorIds: string[];
  status: ScheduleStatus;
  auditLogs?: ScheduleAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface GradeBoundary {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  isPassing: boolean;
  gradePoint?: number;
  remarks?: string;
}

export interface GradingCriteriaConfig {
  id: string;
  examId?: string;
  name: string;
  minScale: number;
  maxScale: number;
  boundaries: GradeBoundary[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGradingCriteriaInput {
  name: string;
  examId?: string;
  minScale?: number;
  maxScale?: number;
  boundaries: GradeBoundary[];
}

export interface Examination {
  id: string;
  name: string;
  academicYear: string;
  academicYearId?: string;
  examPeriod: ExamPeriod;
  examType: string;
  classId: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  subjects: ExamSubject[];
  passingCriteria?: {
    minPassPercentage: number;
  };
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: ExamStatus;
  gradingCriteriaId?: string;
  schoolId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamInput {
  name: string;
  academicYear: string;
  examPeriod: ExamPeriod;
  examType: string;
  classId: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  subjects: ExamSubject[];
  startDate: string;
  endDate: string;
  gradingCriteriaId?: string;
  schoolId?: string;
}

export interface UpdateExamInput {
  name?: string;
  academicYear?: string;
  examPeriod?: ExamPeriod;
  examType?: string;
  subjects?: ExamSubject[];
  startDate?: string;
  endDate?: string;
  gradingCriteriaId?: string;
}

export interface CreateScheduleInput {
  subjectId: string;
  subjectName?: string;
  date: string;
  startTime: string;
  endTime: string;
  roomId: string;
  roomName?: string;
  studentCount: number;
  invigilatorIds: string[];
}

export interface UpdateScheduleInput {
  subjectId?: string;
  subjectName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  roomId?: string;
  roomName?: string;
  studentCount?: number;
  invigilatorIds?: string[];
}

export interface ExamFilters {
  name?: string;
  academicYear?: string;
  academicYearId?: string;
  examType?: string;
  examTypeId?: string;
  examPeriod?: ExamPeriod;
  examPeriodId?: string;
  classId?: string;
  sectionId?: string;
  status?: ExamStatus;
  startDate?: string;
  endDate?: string;
  schoolId?: string;
}
