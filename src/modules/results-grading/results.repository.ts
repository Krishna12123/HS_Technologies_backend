import {
  GraceMarksPolicy,
  MarksRecord,
  StudentExamResult,
  StudentReference
} from './results.types';

export interface ResultsRepository {
  // Marks
  saveMarks(marks: MarksRecord): Promise<MarksRecord>;
  findMarksById(id: string): Promise<MarksRecord | null>;
  findMarks(examId: string, studentId: string, subjectId: string): Promise<MarksRecord | null>;
  listMarks(examId: string, studentId?: string, subjectId?: string): Promise<MarksRecord[]>;

  // Students
  findStudentById(studentId: string): Promise<StudentReference | null>;
  listStudents(): Promise<StudentReference[]>;

  // Results
  saveResult(result: StudentExamResult): Promise<StudentExamResult>;
  findResultById(id: string): Promise<StudentExamResult | null>;
  findResultByStudentAndExam(examId: string, studentId: string): Promise<StudentExamResult | null>;
  listResultsByExam(examId: string): Promise<StudentExamResult[]>;

  // Grace Policy
  getGracePolicy(examId?: string): Promise<GraceMarksPolicy | null>;
  setGracePolicy(policy: GraceMarksPolicy, examId?: string): Promise<void>;

  reset(): void;
}

export class InMemoryResultsRepository implements ResultsRepository {
  private marks: Map<string, MarksRecord> = new Map();
  private results: Map<string, StudentExamResult> = new Map();
  private students: Map<string, StudentReference> = new Map();
  private gracePolicies: Map<string, GraceMarksPolicy> = new Map();

  private marksSeq = 1;
  private resultSeq = 1;

  constructor() {
    this.seedDefaultStudents();
  }

  private seedDefaultStudents(): void {
    const defaultStudents: StudentReference[] = [
      { id: 'S-101', name: 'Alice Walker', classId: 'CLASS-10', section: 'SEC-A', status: 'ACTIVE' },
      { id: 'S-102', name: 'Bob Smith', classId: 'CLASS-10', section: 'SEC-A', status: 'ACTIVE' },
      { id: 'S-103', name: 'Charlie Brown', classId: 'CLASS-10', section: 'SEC-A', status: 'ACTIVE' },
      { id: 'S-104', name: 'Diana Prince', classId: 'CLASS-10', section: 'SEC-B', status: 'INACTIVE' }
    ];
    for (const s of defaultStudents) {
      this.students.set(s.id, s);
    }
  }

  public reset(): void {
    this.marks.clear();
    this.results.clear();
    this.gracePolicies.clear();
    this.seedDefaultStudents();
  }

  // --- Marks Operations ---
  async saveMarks(marks: MarksRecord): Promise<MarksRecord> {
    if (!marks.id) {
      marks.id = `MARKS-${String(this.marksSeq++).padStart(3, '0')}`;
    }
    this.marks.set(marks.id, { ...marks });
    return marks;
  }

  async findMarksById(id: string): Promise<MarksRecord | null> {
    const item = this.marks.get(id);
    return item ? { ...item } : null;
  }

  async findMarks(examId: string, studentId: string, subjectId: string): Promise<MarksRecord | null> {
    for (const m of this.marks.values()) {
      if (m.examId === examId && m.studentId === studentId && m.subjectId === subjectId) {
        return { ...m };
      }
    }
    return null;
  }

  async listMarks(examId: string, studentId?: string, subjectId?: string): Promise<MarksRecord[]> {
    let items = Array.from(this.marks.values()).filter((m) => m.examId === examId);

    if (studentId) {
      items = items.filter((m) => m.studentId === studentId);
    }
    if (subjectId) {
      items = items.filter((m) => m.subjectId === subjectId);
    }

    return items.map((m) => ({ ...m }));
  }

  // --- Students ---
  async findStudentById(studentId: string): Promise<StudentReference | null> {
    return this.students.get(studentId) || null;
  }

  async listStudents(): Promise<StudentReference[]> {
    return Array.from(this.students.values());
  }

  // --- Results Operations ---
  async saveResult(result: StudentExamResult): Promise<StudentExamResult> {
    if (!result.id) {
      result.id = `RES-${String(this.resultSeq++).padStart(3, '0')}`;
    }
    this.results.set(result.id, { ...result });
    return result;
  }

  async findResultById(id: string): Promise<StudentExamResult | null> {
    const item = this.results.get(id);
    return item ? { ...item } : null;
  }

  async findResultByStudentAndExam(examId: string, studentId: string): Promise<StudentExamResult | null> {
    for (const r of this.results.values()) {
      if (r.examId === examId && r.studentId === studentId) {
        return { ...r };
      }
    }
    return null;
  }

  async listResultsByExam(examId: string): Promise<StudentExamResult[]> {
    return Array.from(this.results.values())
      .filter((r) => r.examId === examId)
      .map((r) => ({ ...r }));
  }

  // --- Grace Policy ---
  async getGracePolicy(examId?: string): Promise<GraceMarksPolicy | null> {
    if (examId && this.gracePolicies.has(examId)) {
      return this.gracePolicies.get(examId)!;
    }
    return this.gracePolicies.get('GLOBAL') || null;
  }

  async setGracePolicy(policy: GraceMarksPolicy, examId?: string): Promise<void> {
    const key = examId || 'GLOBAL';
    this.gracePolicies.set(key, policy);
  }
}
