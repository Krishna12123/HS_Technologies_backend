export const ALLOWED_MASTER_CATEGORIES = [
  'academic-years',
  'exam-types',
  'exam-periods',
  'classes',
  'sections',
  'subjects',
  'grading-schemes',
  'grade-ranges',
  'examination-rooms'
] as const;

export type MasterCategory = typeof ALLOWED_MASTER_CATEGORIES[number];

export type MasterRecordStatus = 'ACTIVE' | 'INACTIVE';

export interface BaseMasterRecord {
  id: string;
  category: MasterCategory;
  code: string;
  name: string;
  status: MasterRecordStatus;
  schoolId: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Specific category attributes
export interface AcademicYearRecord extends BaseMasterRecord {
  category: 'academic-years';
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

export interface ExaminationRoomRecord extends BaseMasterRecord {
  category: 'examination-rooms';
  capacity: number;
  building?: string;
  floor?: string;
}

export interface GradeRangeItem {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  gradePoint?: number;
  isPassing: boolean;
  remarks?: string;
}

export interface GradingSchemeRecord extends BaseMasterRecord {
  category: 'grading-schemes';
  ranges: GradeRangeItem[];
}

export interface CreateMasterInput {
  category: MasterCategory;
  code: string;
  name: string;
  status?: MasterRecordStatus;
  schoolId?: string;
  metadata?: Record<string, any>;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  building?: string;
  floor?: string;
  ranges?: GradeRangeItem[];
}

export interface UpdateMasterInput {
  name?: string;
  metadata?: Record<string, any>;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  building?: string;
  floor?: string;
  ranges?: GradeRangeItem[];
}

export interface MasterFilters {
  category?: MasterCategory;
  status?: MasterRecordStatus;
  search?: string;
  schoolId?: string;
}
