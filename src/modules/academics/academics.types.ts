export type SubjectType = 'Core' | 'Elective' | 'Practical';
export type AcademicStatus = 'ACTIVE' | 'INACTIVE';
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface AcademicSubject {
  id: string;
  name: string;
  code: string;
  type: SubjectType;
  description: string;
  maxMarks: number;
  minPassMarks: number;
  status: AcademicStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectInput {
  name: string;
  code: string;
  type: SubjectType;
  description?: string;
  maxMarks: number;
  minPassMarks: number;
  status?: AcademicStatus;
}

export interface SubjectFilters {
  type?: SubjectType;
  status?: AcademicStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SyllabusMilestone {
  id: string;
  title: string;
  description: string;
  sequenceNumber: number;
  status: MilestoneStatus;
}

export interface CreateMilestoneInput {
  title: string;
  description?: string;
  sequenceNumber: number;
  status?: MilestoneStatus;
}

export interface Syllabus {
  id: string;
  subjectId: string;
  classId: string;
  academicYear: string;
  title: string;
  description: string;
  milestones: SyllabusMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSyllabusInput {
  subjectId: string;
  classId: string;
  academicYear: string;
  title: string;
  description?: string;
  milestones: CreateMilestoneInput[];
}

export interface SyllabusFilters {
  subjectId?: string;
  classId?: string;
  academicYear?: string;
}

export interface TeacherReference {
  id: string;
  name: string;
  email: string;
  status: AcademicStatus;
}

export interface ClassSubjectTeacherAllocation {
  id: string;
  classId: string;
  section: string;
  subjectId: string;
  teacherId: string;
  academicYear: string;
  status: AcademicStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAllocationInput {
  classId: string;
  section: string;
  subjectId: string;
  teacherId: string;
  academicYear: string;
  status?: AcademicStatus;
}

export interface AllocationFilters {
  classId?: string;
  section?: string;
  subjectId?: string;
  teacherId?: string;
  academicYear?: string;
  status?: AcademicStatus;
}
