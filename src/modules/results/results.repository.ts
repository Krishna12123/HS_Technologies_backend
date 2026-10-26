import { PaginatedResult, PaginationParams } from '../../common/interfaces/pagination.interface';
import { Result, ResultAuditEntry, ResultFilters } from './results.types';
import crypto from 'crypto';

export interface ResultRepository {
  findById(resultId: string): Promise<Result | null>;
  findByUnique(studentId: string, examId: string, subjectId: string): Promise<Result | null>;
  findByStudent(studentId: string, examId?: string): Promise<Result[]>;
  findByExam(examId: string): Promise<Result[]>;
  findMany(filters: ResultFilters, pagination?: PaginationParams): Promise<PaginatedResult<Result>>;
  create(
    data: Omit<Result, 'id' | 'createdAt' | 'updatedAt' | 'auditLogs'>,
    changedBy?: string
  ): Promise<Result>;
  update(
    resultId: string,
    data: Partial<Result>,
    auditEntry?: ResultAuditEntry
  ): Promise<Result | null>;
  reset(): void;
}

export class InMemoryResultRepository implements ResultRepository {
  private results: Map<string, Result> = new Map();

  public reset(): void {
    this.results.clear();
  }

  private getUniqueKey(studentId: string, examId: string, subjectId: string): string {
    return `${studentId}:${examId}:${subjectId}`;
  }

  async findById(resultId: string): Promise<Result | null> {
    const item = this.results.get(resultId);
    return item ? { ...item, auditLogs: [...item.auditLogs] } : null;
  }

  async findByUnique(studentId: string, examId: string, subjectId: string): Promise<Result | null> {
    for (const r of this.results.values()) {
      if (r.studentId === studentId && r.examId === examId && r.subjectId === subjectId) {
        return { ...r, auditLogs: [...r.auditLogs] };
      }
    }
    return null;
  }

  async findByStudent(studentId: string, examId?: string): Promise<Result[]> {
    return Array.from(this.results.values())
      .filter((r) => r.studentId === studentId && (!examId || r.examId === examId))
      .map((r) => ({ ...r, auditLogs: [...r.auditLogs] }));
  }

  async findByExam(examId: string): Promise<Result[]> {
    return Array.from(this.results.values())
      .filter((r) => r.examId === examId)
      .map((r) => ({ ...r, auditLogs: [...r.auditLogs] }));
  }

  async findMany(
    filters: ResultFilters,
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResult<Result>> {
    let list = Array.from(this.results.values());

    if (filters.schoolId) {
      list = list.filter((r) => r.schoolId === filters.schoolId);
    }
    if (filters.examId) {
      list = list.filter((r) => r.examId === filters.examId);
    }
    if (filters.studentId) {
      list = list.filter((r) => r.studentId === filters.studentId);
    }
    if (filters.subjectId) {
      list = list.filter((r) => r.subjectId === filters.subjectId);
    }
    if (filters.status) {
      list = list.filter((r) => r.status === filters.status);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const page = pagination.page && pagination.page > 0 ? pagination.page : 1;
    const limit = pagination.limit && pagination.limit > 0 ? pagination.limit : 20;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit).map((r) => ({ ...r, auditLogs: [...r.auditLogs] }));

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  async create(
    data: Omit<Result, 'id' | 'createdAt' | 'updatedAt' | 'auditLogs'>,
    changedBy?: string
  ): Promise<Result> {
    const id = `res-${crypto.randomUUID().substring(0, 8)}`;
    const now = new Date().toISOString();

    const auditEntry: ResultAuditEntry = {
      action: 'CREATED',
      timestamp: now,
      changedBy,
      newMarks: data.marksObtained,
      newGrade: data.grade
    };

    const result: Result = {
      ...data,
      id,
      auditLogs: [auditEntry],
      createdAt: now,
      updatedAt: now
    };

    this.results.set(id, result);
    return { ...result };
  }

  async update(
    resultId: string,
    data: Partial<Result>,
    auditEntry?: ResultAuditEntry
  ): Promise<Result | null> {
    const existing = await this.findById(resultId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const auditLogs = auditEntry ? [...existing.auditLogs, auditEntry] : existing.auditLogs;

    const updated: Result = {
      ...existing,
      ...data,
      auditLogs,
      updatedAt: now
    };

    this.results.set(resultId, updated);
    return { ...updated };
  }
}
