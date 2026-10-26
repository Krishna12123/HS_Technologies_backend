import { PaginatedResult, PaginationParams } from '../../common/interfaces/pagination.interface';
import { RoomInfo } from './conflict-detector.service';
import {
  CreateExamInput,
  CreateScheduleInput,
  Examination,
  ExamFilters,
  ExamSchedule,
  ExamStatus,
  ScheduleAuditEntry,
  ScheduleStatus,
  UpdateExamInput,
  UpdateScheduleInput
} from './examinations.types';

export interface ExamRepository {
  findById(examId: string): Promise<Examination | null>;
  findMany(filters: ExamFilters, pagination?: PaginationParams): Promise<PaginatedResult<Examination>>;
  create(input: CreateExamInput): Promise<Examination>;
  update(examId: string, input: UpdateExamInput): Promise<Examination | null>;
  updateStatus(examId: string, status: ExamStatus): Promise<Examination | null>;

  findScheduleById(scheduleId: string): Promise<ExamSchedule | null>;
  findSchedulesByExamId(examId: string): Promise<ExamSchedule[]>;
  findActiveSchedules(): Promise<ExamSchedule[]>;
  findActiveSchedulesInTimeRange(
    startTime: string,
    endTime: string,
    excludeScheduleId?: string
  ): Promise<ExamSchedule[]>;
  createSchedule(examId: string, input: CreateScheduleInput, changedBy?: string): Promise<ExamSchedule>;
  updateSchedule(
    scheduleId: string,
    input: UpdateScheduleInput,
    changedBy?: string
  ): Promise<ExamSchedule | null>;
  updateScheduleStatus(
    scheduleId: string,
    status: ScheduleStatus,
    changedBy?: string
  ): Promise<ExamSchedule | null>;

  // Room operations
  getRoom(roomId: string): Promise<RoomInfo | null>;
  addRoom(room: RoomInfo): void;
  listRooms(): Promise<RoomInfo[]>;

  reset(): void;
}

export class InMemoryExamRepository implements ExamRepository {
  private exams: Map<string, Examination> = new Map();
  private schedules: Map<string, ExamSchedule> = new Map();
  private rooms: Map<string, RoomInfo> = new Map();
  private examSeq = 1;
  private schedSeq = 1;

  constructor() {
    this.seedDefaultRooms();
    this.seedSampleExam();
  }

  private seedDefaultRooms(): void {
    const defaultRooms: RoomInfo[] = [
      { id: 'ROOM-101', name: 'Examination Room 101', capacity: 40, isActive: true },
      { id: 'ROOM-102', name: 'Examination Room 102', capacity: 30, isActive: true },
      { id: 'HALL-A', name: 'Main Examination Hall A', capacity: 100, isActive: true },
      { id: 'HALL-B', name: 'Small Examination Hall B', capacity: 50, isActive: true },
      { id: 'LAB-1', name: 'Computer Lab 1', capacity: 25, isActive: false }
    ];
    for (const r of defaultRooms) {
      this.rooms.set(r.id, r);
    }
  }

  private seedSampleExam(): void {
    const id = 'EXAM-001';
    const now = new Date().toISOString();
    this.exams.set(id, {
      id,
      name: 'Midterm Examination 2026',
      academicYear: '2026-2027',
      examPeriod: 'Midterm',
      examType: 'Written',
      classId: 'CLASS-10',
      className: 'Grade 10',
      sectionId: 'SEC-A',
      sectionName: 'Section A',
      subjects: [
        { subjectId: 'SUBJ-001', subjectName: 'Mathematics', maxMarks: 100, passMarks: 40 },
        { subjectId: 'SUBJ-002', subjectName: 'Physics Practical', maxMarks: 50, passMarks: 20 }
      ],
      startDate: '2026-11-01',
      endDate: '2026-11-30',
      status: 'PUBLISHED',
      createdAt: now,
      updatedAt: now
    });
  }

  public reset(): void {
    this.exams.clear();
    this.schedules.clear();
    this.rooms.clear();
    this.seedDefaultRooms();
  }

  // --- Rooms ---
  async getRoom(roomId: string): Promise<RoomInfo | null> {
    return this.rooms.get(roomId) || null;
  }

  addRoom(room: RoomInfo): void {
    this.rooms.set(room.id, room);
  }

  async listRooms(): Promise<RoomInfo[]> {
    return Array.from(this.rooms.values());
  }

  // --- Examinations ---
  async findById(examId: string): Promise<Examination | null> {
    const exam = this.exams.get(examId);
    return exam ? { ...exam, subjects: [...exam.subjects] } : null;
  }

  async findMany(
    filters: ExamFilters,
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResult<Examination>> {
    let list = Array.from(this.exams.values());

    if (filters.schoolId) {
      list = list.filter((e) => e.schoolId === filters.schoolId);
    }
    if (filters.name) {
      const q = filters.name.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q));
    }
    const acYear = filters.academicYear || filters.academicYearId;
    if (acYear) {
      list = list.filter((e) => e.academicYear === acYear);
    }
    const exType = filters.examType || filters.examTypeId;
    if (exType) {
      list = list.filter((e) => e.examType === exType);
    }
    const exPeriod = filters.examPeriod || filters.examPeriodId;
    if (exPeriod) {
      list = list.filter((e) => e.examPeriod === exPeriod);
    }
    if (filters.classId) {
      list = list.filter((e) => e.classId === filters.classId);
    }
    if (filters.sectionId) {
      list = list.filter((e) => e.sectionId === filters.sectionId);
    }
    if (filters.status) {
      list = list.filter((e) => e.status === filters.status);
    }
    if (filters.startDate) {
      list = list.filter((e) => e.startDate >= filters.startDate!);
    }
    if (filters.endDate) {
      list = list.filter((e) => e.endDate <= filters.endDate!);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const page = pagination.page && pagination.page > 0 ? pagination.page : 1;
    const limit = pagination.limit && pagination.limit > 0 ? pagination.limit : 20;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const data = list.slice(startIndex, startIndex + limit);

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

  async create(input: CreateExamInput): Promise<Examination> {
    const id = `EXAM-${String(this.examSeq++).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const exam: Examination = {
      id,
      name: input.name,
      academicYear: input.academicYear,
      examPeriod: input.examPeriod,
      examType: input.examType,
      classId: input.classId,
      className: input.className,
      sectionId: input.sectionId,
      sectionName: input.sectionName,
      subjects: input.subjects,
      startDate: input.startDate,
      endDate: input.endDate,
      status: 'DRAFT',
      gradingCriteriaId: input.gradingCriteriaId,
      schoolId: input.schoolId,
      createdAt: now,
      updatedAt: now
    };
    this.exams.set(id, exam);
    return exam;
  }

  async update(examId: string, input: UpdateExamInput): Promise<Examination | null> {
    const existing = this.exams.get(examId);
    if (!existing) return null;

    const updated: Examination = {
      ...existing,
      ...(input.name !== undefined && { name: input.name }),
      ...(input.academicYear !== undefined && { academicYear: input.academicYear }),
      ...(input.examPeriod !== undefined && { examPeriod: input.examPeriod }),
      ...(input.examType !== undefined && { examType: input.examType }),
      ...(input.subjects !== undefined && { subjects: input.subjects }),
      ...(input.startDate !== undefined && { startDate: input.startDate }),
      ...(input.endDate !== undefined && { endDate: input.endDate }),
      ...(input.gradingCriteriaId !== undefined && { gradingCriteriaId: input.gradingCriteriaId }),
      updatedAt: new Date().toISOString()
    };
    this.exams.set(examId, updated);
    return updated;
  }

  async updateStatus(examId: string, status: ExamStatus): Promise<Examination | null> {
    const existing = this.exams.get(examId);
    if (!existing) return null;

    const updated: Examination = {
      ...existing,
      status,
      updatedAt: new Date().toISOString()
    };
    this.exams.set(examId, updated);
    return updated;
  }

  // --- Schedules ---
  async findScheduleById(scheduleId: string): Promise<ExamSchedule | null> {
    return this.schedules.get(scheduleId) || null;
  }

  async findSchedulesByExamId(examId: string): Promise<ExamSchedule[]> {
    return Array.from(this.schedules.values()).filter((s) => s.examId === examId);
  }

  async findActiveSchedules(): Promise<ExamSchedule[]> {
    return Array.from(this.schedules.values()).filter((s) => s.status !== 'CANCELLED');
  }

  async findActiveSchedulesInTimeRange(
    _startTime: string,
    _endTime: string,
    excludeScheduleId?: string
  ): Promise<ExamSchedule[]> {
    return Array.from(this.schedules.values()).filter((s) => {
      if (s.status === 'CANCELLED') return false;
      if (excludeScheduleId && s.id === excludeScheduleId) return false;
      return true;
    });
  }

  async createSchedule(
    examId: string,
    input: CreateScheduleInput,
    changedBy?: string
  ): Promise<ExamSchedule> {
    const id = `SCHED-${String(this.schedSeq++).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const auditLogs: ScheduleAuditEntry[] = [
      {
        action: 'CREATED',
        timestamp: now,
        changedBy,
        newValues: { ...input }
      }
    ];

    const schedule: ExamSchedule = {
      id,
      examId,
      subjectId: input.subjectId,
      subjectName: input.subjectName,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      roomId: input.roomId,
      roomName: input.roomName,
      studentCount: input.studentCount,
      invigilatorIds: input.invigilatorIds,
      status: 'SCHEDULED',
      auditLogs,
      createdAt: now,
      updatedAt: now
    };

    this.schedules.set(id, schedule);
    return schedule;
  }

  async updateSchedule(
    scheduleId: string,
    input: UpdateScheduleInput,
    changedBy?: string
  ): Promise<ExamSchedule | null> {
    const existing = this.schedules.get(scheduleId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const auditLogs = existing.auditLogs ? [...existing.auditLogs] : [];
    auditLogs.push({
      action: 'UPDATED',
      timestamp: now,
      changedBy,
      previousValues: { ...existing },
      newValues: { ...input }
    });

    const updated: ExamSchedule = {
      ...existing,
      ...(input.subjectId !== undefined && { subjectId: input.subjectId }),
      ...(input.subjectName !== undefined && { subjectName: input.subjectName }),
      ...(input.date !== undefined && { date: input.date }),
      ...(input.startTime !== undefined && { startTime: input.startTime }),
      ...(input.endTime !== undefined && { endTime: input.endTime }),
      ...(input.roomId !== undefined && { roomId: input.roomId }),
      ...(input.roomName !== undefined && { roomName: input.roomName }),
      ...(input.studentCount !== undefined && { studentCount: input.studentCount }),
      ...(input.invigilatorIds !== undefined && { invigilatorIds: input.invigilatorIds }),
      auditLogs,
      updatedAt: now
    };

    this.schedules.set(scheduleId, updated);
    return updated;
  }

  async updateScheduleStatus(
    scheduleId: string,
    status: ScheduleStatus,
    changedBy?: string
  ): Promise<ExamSchedule | null> {
    const existing = this.schedules.get(scheduleId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const auditLogs = existing.auditLogs ? [...existing.auditLogs] : [];
    auditLogs.push({
      action: 'STATUS_CHANGED',
      timestamp: now,
      changedBy,
      previousValues: { status: existing.status },
      newValues: { status }
    });

    const updated: ExamSchedule = {
      ...existing,
      status,
      auditLogs,
      updatedAt: now
    };

    this.schedules.set(scheduleId, updated);
    return updated;
  }
}
