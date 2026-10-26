import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnprocessableEntityError
} from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-codes';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { AcademicsRepository } from './academics.repository';
import {
  AcademicSubject,
  ClassSubjectTeacherAllocation,
  CreateAllocationInput,
  CreateSubjectInput,
  CreateSyllabusInput,
  SubjectFilters,
  Syllabus,
  SyllabusFilters,
  AllocationFilters,
  TeacherReference
} from './academics.types';

export class AcademicsService {
  constructor(private readonly repository: AcademicsRepository) {}

  // --- Subject Catalog ---

  async createSubject(input: CreateSubjectInput): Promise<AcademicSubject> {
    // Validate subject type
    const validTypes = ['Core', 'Elective', 'Practical'];
    if (!validTypes.includes(input.type)) {
      throw new BadRequestError(
        `Invalid subject type '${input.type}'. Supported types: ${validTypes.join(', ')}`,
        ErrorCode.INVALID_SUBJECT_TYPE,
        [{ field: 'type', message: `Subject type must be one of ${validTypes.join(', ')}`, code: ErrorCode.INVALID_SUBJECT_TYPE }]
      );
    }

    // Validate maximum marks
    if (typeof input.maxMarks !== 'number' || input.maxMarks <= 0) {
      throw new BadRequestError(
        'Maximum marks must be a positive number greater than 0',
        ErrorCode.INVALID_MARKS_RANGE,
        [{ field: 'maxMarks', message: 'Maximum marks must be positive', code: ErrorCode.INVALID_MARKS_RANGE }]
      );
    }

    // Validate minimum passing marks
    if (typeof input.minPassMarks !== 'number' || input.minPassMarks < 0) {
      throw new BadRequestError(
        'Minimum passing marks cannot be negative',
        ErrorCode.INVALID_MARKS_RANGE,
        [{ field: 'minPassMarks', message: 'Minimum passing marks cannot be negative', code: ErrorCode.INVALID_MARKS_RANGE }]
      );
    }

    if (input.minPassMarks > input.maxMarks) {
      throw new BadRequestError(
        `Minimum passing marks (${input.minPassMarks}) cannot exceed maximum marks (${input.maxMarks})`,
        ErrorCode.INVALID_MARKS_RANGE,
        [{ field: 'minPassMarks', message: 'Minimum passing marks cannot exceed maximum marks', code: ErrorCode.INVALID_MARKS_RANGE }]
      );
    }

    // Check duplicate subject code
    const existing = await this.repository.findSubjectByCode(input.code);
    if (existing) {
      throw new ConflictError(
        `A subject with code '${input.code}' already exists`,
        ErrorCode.DUPLICATE_SUBJECT_CODE,
        [{ field: 'code', message: `Code ${input.code} is already in use`, code: ErrorCode.DUPLICATE_SUBJECT_CODE }]
      );
    }

    return this.repository.createSubject(input);
  }

  async getSubjectById(subjectId: string): Promise<AcademicSubject> {
    const subject = await this.repository.findSubjectById(subjectId);
    if (!subject) {
      throw new NotFoundError(
        `Subject '${subjectId}' not found`,
        ErrorCode.SUBJECT_NOT_FOUND,
        [{ field: 'subjectId', message: `Subject with ID ${subjectId} does not exist`, code: ErrorCode.SUBJECT_NOT_FOUND }]
      );
    }
    return subject;
  }

  async listSubjects(filters: SubjectFilters): Promise<PaginatedResult<AcademicSubject>> {
    return this.repository.listSubjects(filters);
  }

  // --- Syllabus Management ---

  async createSyllabus(input: CreateSyllabusInput): Promise<Syllabus> {
    // Validate subject reference exists
    const subject = await this.repository.findSubjectById(input.subjectId);
    if (!subject) {
      throw new NotFoundError(
        `Cannot create syllabus: Subject '${input.subjectId}' does not exist`,
        ErrorCode.SUBJECT_NOT_FOUND,
        [{ field: 'subjectId', message: `Subject ${input.subjectId} not found`, code: ErrorCode.SUBJECT_NOT_FOUND }]
      );
    }

    // Validate milestone sequence uniqueness and positivity
    const seenSequences = new Set<number>();
    for (const m of input.milestones) {
      if (typeof m.sequenceNumber !== 'number' || m.sequenceNumber <= 0 || !Number.isInteger(m.sequenceNumber)) {
        throw new BadRequestError(
          `Milestone sequence number '${m.sequenceNumber}' must be a positive integer`,
          ErrorCode.VALIDATION_ERROR,
          [{ field: 'sequenceNumber', message: 'Sequence numbers must be positive integers', code: ErrorCode.VALIDATION_ERROR }]
        );
      }
      if (seenSequences.has(m.sequenceNumber)) {
        throw new BadRequestError(
          `Duplicate milestone sequence number '${m.sequenceNumber}' within syllabus`,
          ErrorCode.DUPLICATE_MILESTONE_SEQUENCE,
          [{ field: 'sequenceNumber', message: `Duplicate sequence number ${m.sequenceNumber}`, code: ErrorCode.DUPLICATE_MILESTONE_SEQUENCE }]
        );
      }
      seenSequences.add(m.sequenceNumber);
    }

    return this.repository.createSyllabus(input);
  }

  async getSyllabusById(syllabusId: string): Promise<Syllabus> {
    const syllabus = await this.repository.findSyllabusById(syllabusId);
    if (!syllabus) {
      throw new NotFoundError(
        `Syllabus '${syllabusId}' not found`,
        ErrorCode.SYLLABUS_NOT_FOUND,
        [{ field: 'syllabusId', message: `Syllabus with ID ${syllabusId} does not exist`, code: ErrorCode.SYLLABUS_NOT_FOUND }]
      );
    }
    return syllabus;
  }

  async listSyllabus(filters: SyllabusFilters): Promise<Syllabus[]> {
    return this.repository.listSyllabus(filters);
  }

  // --- Teachers Reference ---

  async listTeachers(): Promise<TeacherReference[]> {
    return this.repository.listTeachers();
  }

  // --- Class-Subject-Teacher Allocation ---

  async createAllocation(input: CreateAllocationInput): Promise<ClassSubjectTeacherAllocation> {
    // Validate subject exists
    const subject = await this.repository.findSubjectById(input.subjectId);
    if (!subject) {
      throw new NotFoundError(
        `Cannot create allocation: Subject '${input.subjectId}' not found`,
        ErrorCode.SUBJECT_NOT_FOUND,
        [{ field: 'subjectId', message: `Subject ${input.subjectId} does not exist`, code: ErrorCode.SUBJECT_NOT_FOUND }]
      );
    }

    // Validate teacher exists
    const teacher = await this.repository.findTeacherById(input.teacherId);
    if (!teacher) {
      throw new NotFoundError(
        `Cannot create allocation: Teacher '${input.teacherId}' not found in school records`,
        ErrorCode.TEACHER_NOT_FOUND,
        [{ field: 'teacherId', message: `Teacher ${input.teacherId} does not exist`, code: ErrorCode.TEACHER_NOT_FOUND }]
      );
    }

    if (teacher.status !== 'ACTIVE') {
      throw new UnprocessableEntityError(
        `Cannot allocate inactive teacher '${teacher.name}' (${input.teacherId})`,
        ErrorCode.UNPROCESSABLE_ENTITY,
        [{ field: 'teacherId', message: 'Teacher is currently inactive', code: ErrorCode.UNPROCESSABLE_ENTITY }]
      );
    }

    // Prevent duplicate active allocations for the same class, section, subject, and academic year
    const existingAllocation = await this.repository.findActiveAllocation(
      input.classId,
      input.section,
      input.subjectId,
      input.academicYear
    );

    if (existingAllocation) {
      throw new ConflictError(
        `An active allocation already exists for Class '${input.classId}', Section '${input.section}', Subject '${subject.name}' for Academic Year '${input.academicYear}'`,
        ErrorCode.DUPLICATE_ALLOCATION,
        [{
          field: 'allocation',
          message: `Existing active allocation ID ${existingAllocation.id} already assigns teacher ${existingAllocation.teacherId}`,
          code: ErrorCode.DUPLICATE_ALLOCATION
        }]
      );
    }

    return this.repository.createAllocation(input);
  }

  async listAllocations(filters: AllocationFilters): Promise<ClassSubjectTeacherAllocation[]> {
    return this.repository.listAllocations(filters);
  }
}
