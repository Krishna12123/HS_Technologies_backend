import { PaginatedResult, PaginationParams } from '../../common/interfaces/pagination.interface';
import {
  AcademicSubject,
  ClassSubjectTeacherAllocation,
  CreateAllocationInput,
  CreateSubjectInput,
  CreateSyllabusInput,
  SubjectFilters,
  Syllabus,
  SyllabusFilters,
  TeacherReference,
  AllocationFilters
} from './academics.types';

export interface AcademicsRepository {
  // Subjects
  createSubject(input: CreateSubjectInput): Promise<AcademicSubject>;
  findSubjectById(id: string): Promise<AcademicSubject | null>;
  findSubjectByCode(code: string): Promise<AcademicSubject | null>;
  listSubjects(filters: SubjectFilters): Promise<PaginatedResult<AcademicSubject>>;

  // Syllabus
  createSyllabus(input: CreateSyllabusInput): Promise<Syllabus>;
  findSyllabusById(id: string): Promise<Syllabus | null>;
  listSyllabus(filters: SyllabusFilters): Promise<Syllabus[]>;

  // Teachers
  findTeacherById(id: string): Promise<TeacherReference | null>;
  listTeachers(): Promise<TeacherReference[]>;

  // Allocations
  createAllocation(input: CreateAllocationInput): Promise<ClassSubjectTeacherAllocation>;
  findAllocationById(id: string): Promise<ClassSubjectTeacherAllocation | null>;
  findActiveAllocation(
    classId: string,
    section: string,
    subjectId: string,
    academicYear: string
  ): Promise<ClassSubjectTeacherAllocation | null>;
  listAllocations(filters: AllocationFilters): Promise<ClassSubjectTeacherAllocation[]>;
}

export class InMemoryAcademicsRepository implements AcademicsRepository {
  private subjects: Map<string, AcademicSubject> = new Map();
  private syllabi: Map<string, Syllabus> = new Map();
  private allocations: Map<string, ClassSubjectTeacherAllocation> = new Map();
  private teachers: Map<string, TeacherReference> = new Map();

  private subjectSeq = 1;
  private syllabusSeq = 1;
  private allocationSeq = 1;

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults(): void {
    // Seed initial teachers for allocation testing
    const defaultTeachers: TeacherReference[] = [
      { id: 'T-101', name: 'Dr. Jane Smith', email: 'jane.smith@school.edu', status: 'ACTIVE' },
      { id: 'T-102', name: 'Prof. Alan Turing', email: 'alan.turing@school.edu', status: 'ACTIVE' },
      { id: 'T-103', name: 'Ms. Ada Lovelace', email: 'ada.lovelace@school.edu', status: 'ACTIVE' },
      { id: 'T-104', name: 'Mr. Richard Feynman', email: 'richard.feynman@school.edu', status: 'INACTIVE' }
    ];
    for (const t of defaultTeachers) {
      this.teachers.set(t.id, t);
    }

    // Seed a couple of default subjects
    this.createSubject({
      name: 'Mathematics',
      code: 'MATH101',
      type: 'Core',
      description: 'Core Mathematics Grade 10',
      maxMarks: 100,
      minPassMarks: 40,
      status: 'ACTIVE'
    });
    this.createSubject({
      name: 'Physics Practical',
      code: 'PHY101-P',
      type: 'Practical',
      description: 'Physics Laboratory Experiments',
      maxMarks: 50,
      minPassMarks: 20,
      status: 'ACTIVE'
    });
  }

  // --- Subject Operations ---
  async createSubject(input: CreateSubjectInput): Promise<AcademicSubject> {
    const id = `SUBJ-${String(this.subjectSeq++).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const subject: AcademicSubject = {
      id,
      name: input.name,
      code: input.code.toUpperCase().trim(),
      type: input.type,
      description: input.description || '',
      maxMarks: input.maxMarks,
      minPassMarks: input.minPassMarks,
      status: input.status || 'ACTIVE',
      createdAt: now,
      updatedAt: now
    };
    this.subjects.set(id, subject);
    return subject;
  }

  async findSubjectById(id: string): Promise<AcademicSubject | null> {
    return this.subjects.get(id) || null;
  }

  async findSubjectByCode(code: string): Promise<AcademicSubject | null> {
    const formatted = code.toUpperCase().trim();
    for (const subject of this.subjects.values()) {
      if (subject.code === formatted) return subject;
    }
    return null;
  }

  async listSubjects(filters: SubjectFilters): Promise<PaginatedResult<AcademicSubject>> {
    let items = Array.from(this.subjects.values());

    if (filters.type) {
      items = items.filter((s) => s.type === filters.type);
    }
    if (filters.status) {
      items = items.filter((s) => s.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
      );
    }

    const total = items.length;
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const data = items.slice(startIndex, startIndex + limit);

    const paginationData = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };

    return {
      items: data,
      pagination: paginationData,
      data,
      meta: paginationData
    };
  }

  // --- Syllabus Operations ---
  async createSyllabus(input: CreateSyllabusInput): Promise<Syllabus> {
    const id = `SYL-${String(this.syllabusSeq++).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const sortedMilestones = [...input.milestones]
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
      .map((m, idx) => ({
        id: `MS-${id}-${idx + 1}`,
        title: m.title,
        description: m.description || '',
        sequenceNumber: m.sequenceNumber,
        status: m.status || 'PENDING'
      }));

    const syllabus: Syllabus = {
      id,
      subjectId: input.subjectId,
      classId: input.classId,
      academicYear: input.academicYear,
      title: input.title,
      description: input.description || '',
      milestones: sortedMilestones,
      createdAt: now,
      updatedAt: now
    };

    this.syllabi.set(id, syllabus);
    return syllabus;
  }

  async findSyllabusById(id: string): Promise<Syllabus | null> {
    return this.syllabi.get(id) || null;
  }

  async listSyllabus(filters: SyllabusFilters): Promise<Syllabus[]> {
    let items = Array.from(this.syllabi.values());

    if (filters.subjectId) {
      items = items.filter((s) => s.subjectId === filters.subjectId);
    }
    if (filters.classId) {
      items = items.filter((s) => s.classId === filters.classId);
    }
    if (filters.academicYear) {
      items = items.filter((s) => s.academicYear === filters.academicYear);
    }

    // Ensure milestones in each syllabus returned are in sequence order
    return items.map((s) => ({
      ...s,
      milestones: [...s.milestones].sort((a, b) => a.sequenceNumber - b.sequenceNumber)
    }));
  }

  // --- Teacher Operations ---
  async findTeacherById(id: string): Promise<TeacherReference | null> {
    return this.teachers.get(id) || null;
  }

  async listTeachers(): Promise<TeacherReference[]> {
    return Array.from(this.teachers.values());
  }

  // --- Allocation Operations ---
  async createAllocation(input: CreateAllocationInput): Promise<ClassSubjectTeacherAllocation> {
    const id = `ALLOC-${String(this.allocationSeq++).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const allocation: ClassSubjectTeacherAllocation = {
      id,
      classId: input.classId,
      section: input.section,
      subjectId: input.subjectId,
      teacherId: input.teacherId,
      academicYear: input.academicYear,
      status: input.status || 'ACTIVE',
      createdAt: now,
      updatedAt: now
    };
    this.allocations.set(id, allocation);
    return allocation;
  }

  async findAllocationById(id: string): Promise<ClassSubjectTeacherAllocation | null> {
    return this.allocations.get(id) || null;
  }

  async findActiveAllocation(
    classId: string,
    section: string,
    subjectId: string,
    academicYear: string
  ): Promise<ClassSubjectTeacherAllocation | null> {
    for (const alloc of this.allocations.values()) {
      if (
        alloc.classId === classId &&
        alloc.section === section &&
        alloc.subjectId === subjectId &&
        alloc.academicYear === academicYear &&
        alloc.status === 'ACTIVE'
      ) {
        return alloc;
      }
    }
    return null;
  }

  async listAllocations(filters: AllocationFilters): Promise<ClassSubjectTeacherAllocation[]> {
    let items = Array.from(this.allocations.values());

    if (filters.classId) {
      items = items.filter((a) => a.classId === filters.classId);
    }
    if (filters.section) {
      items = items.filter((a) => a.section === filters.section);
    }
    if (filters.subjectId) {
      items = items.filter((a) => a.subjectId === filters.subjectId);
    }
    if (filters.teacherId) {
      items = items.filter((a) => a.teacherId === filters.teacherId);
    }
    if (filters.academicYear) {
      items = items.filter((a) => a.academicYear === filters.academicYear);
    }
    if (filters.status) {
      items = items.filter((a) => a.status === filters.status);
    }

    return items;
  }
}
