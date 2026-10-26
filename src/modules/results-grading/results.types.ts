export type MarksStatus = 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'PUBLISHED' | 'CORRECTED';
export type ResultStatus = 'DRAFT' | 'COMPUTED' | 'PUBLISHED' | 'CORRECTED';

export interface StudentReference {
  id: string;
  name: string;
  classId: string;
  section: string;
  rollNumber?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface MarksRecord {
  id: string;
  examId: string;
  studentId: string;
  subjectId: string;
  marksObtained: number;
  maxMarks: number;
  status: MarksStatus;
  enteredBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitMarksInput {
  studentId: string;
  subjectId: string;
  marksObtained: number;
  maxMarks?: number;
  enteredBy?: string;
}

export interface UpdateMarksInput {
  marksObtained: number;
  reason?: string;
  changedBy?: string;
}

export interface GraceMarksPolicy {
  enabled: boolean;
  maxGraceMarksPerSubject: number;
  maxTotalGraceMarks: number;
  applicableOnlyIfPassingPossible: boolean;
}

export interface SubjectResultComputation {
  subjectId: string;
  subjectName?: string;
  marksObtained: number;
  graceMarks: number;
  finalMarks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  isPassing: boolean;
}

export interface OverallResultComputation {
  totalObtainedMarks: number;
  totalGraceMarks: number;
  totalFinalMarks: number;
  totalMaxMarks: number;
  overallPercentage: number;
  overallStatus: 'PASS' | 'FAIL';
  passedSubjectsCount: number;
  totalSubjectsCount: number;
}

export interface StudentExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName?: string;
  subjects: SubjectResultComputation[];
  overall: OverallResultComputation;
  status: ResultStatus;
  publishedAt?: string;
  publishedBy?: string;
  auditTrail: ResultAuditTrailEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ResultAuditTrailEntry {
  action: 'COMPUTED' | 'PUBLISHED' | 'CORRECTED';
  timestamp: string;
  actor?: string;
  reason?: string;
  details?: Record<string, any>;
}

export interface StudentReportCard {
  studentId: string;
  studentName?: string;
  examId: string;
  examName?: string;
  subjectWiseResults: SubjectResultComputation[];
  totalObtainedMarks: number;
  totalMaxMarks: number;
  overallPercentage: number;
  overallResultStatus: 'PASS' | 'FAIL';
  publicationStatus: ResultStatus;
  publishedAt?: string;
}
