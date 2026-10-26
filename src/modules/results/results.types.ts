export type ResultStatus = 'DRAFT' | 'PUBLISHED' | 'CORRECTED';

export interface ResultAuditEntry {
  action: 'CREATED' | 'UPDATED' | 'PUBLISHED' | 'CORRECTED';
  timestamp: string;
  changedBy?: string;
  reason?: string;
  previousMarks?: number;
  newMarks?: number;
  previousGrade?: string;
  newGrade?: string;
}

export interface Result {
  id: string;
  studentId: string;
  studentName?: string;
  examId: string;
  examName?: string;
  subjectId: string;
  subjectName?: string;
  maxMarks: number;
  marksObtained: number;
  percentage: number;
  grade: string;
  isPassing: boolean;
  remarks?: string;
  status: ResultStatus;
  schoolId: string;
  auditLogs: ResultAuditEntry[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResultInput {
  studentId: string;
  studentName?: string;
  examId: string;
  subjectId: string;
  subjectName?: string;
  maxMarks: number;
  marksObtained: number;
  remarks?: string;
  schoolId?: string;
}

export interface UpdateResultInput {
  marksObtained?: number;
  remarks?: string;
  reason?: string; // Required when updating a PUBLISHED result (correction workflow)
}

export interface BulkCreateResultInput {
  examId: string;
  results: Array<{
    studentId: string;
    studentName?: string;
    subjectId: string;
    subjectName?: string;
    maxMarks: number;
    marksObtained: number;
    remarks?: string;
  }>;
}

export interface ResultFilters {
  examId?: string;
  studentId?: string;
  subjectId?: string;
  status?: ResultStatus;
  schoolId?: string;
}

export interface StudentReportCard {
  studentId: string;
  studentName?: string;
  examId: string;
  examName: string;
  academicYear?: string;
  subjects: Array<{
    subjectId: string;
    subjectName: string;
    maxMarks: number;
    marksObtained: number;
    percentage: number;
    grade: string;
    isPassing: boolean;
    remarks?: string;
  }>;
  summary: {
    totalMaxMarks: number;
    totalMarksObtained: number;
    overallPercentage: number;
    overallGrade: string;
    overallResult: 'PASS' | 'FAIL';
    passedSubjectsCount: number;
    totalSubjectsCount: number;
  };
  status: 'DRAFT' | 'PARTIALLY_PUBLISHED' | 'PUBLISHED';
  generatedAt: string;
}
