import { PaginatedResult, PaginationParams } from '../../common/interfaces/pagination.interface';
import {
  BaseMasterRecord,
  CreateMasterInput,
  MasterCategory,
  MasterFilters,
  MasterRecordStatus,
  UpdateMasterInput
} from './masters.types';
import crypto from 'crypto';

export interface MasterRepository {
  findById(category: MasterCategory, id: string): Promise<BaseMasterRecord | null>;
  findByCode(category: MasterCategory, code: string, schoolId: string): Promise<BaseMasterRecord | null>;
  findMany(filters: MasterFilters, pagination?: PaginationParams): Promise<PaginatedResult<BaseMasterRecord>>;
  create(input: CreateMasterInput): Promise<BaseMasterRecord>;
  update(category: MasterCategory, id: string, input: UpdateMasterInput): Promise<BaseMasterRecord | null>;
  updateStatus(category: MasterCategory, id: string, status: MasterRecordStatus): Promise<BaseMasterRecord | null>;
  reset(): void;
  seedDefaults(schoolId?: string): void;
}

export class InMemoryMasterRepository implements MasterRepository {
  private records: Map<string, BaseMasterRecord> = new Map();

  constructor() {
    this.seedDefaults('SCH-001');
  }

  private getKey(category: string, id: string): string {
    return `${category}:${id}`;
  }

  public reset(): void {
    this.records.clear();
  }

  public seedDefaults(schoolId = 'SCH-001'): void {
    const now = new Date().toISOString();

    const initialRecords: Array<Omit<BaseMasterRecord, 'createdAt' | 'updatedAt'>> = [
      // Academic Years
      {
        id: 'ay-2025-26',
        category: 'academic-years',
        code: 'AY2025-26',
        name: 'Academic Year 2025-2026',
        status: 'ACTIVE',
        schoolId,
        metadata: { startDate: '2025-06-01', endDate: '2026-04-30', isCurrent: true }
      },
      // Exam Types
      {
        id: 'et-midterm',
        category: 'exam-types',
        code: 'MIDTERM',
        name: 'Mid-Term Examination',
        status: 'ACTIVE',
        schoolId
      },
      {
        id: 'et-final',
        category: 'exam-types',
        code: 'FINAL',
        name: 'Annual Final Examination',
        status: 'ACTIVE',
        schoolId
      },
      // Exam Periods
      {
        id: 'ep-term1',
        category: 'exam-periods',
        code: 'TERM1',
        name: 'Term 1 Period',
        status: 'ACTIVE',
        schoolId
      },
      // Classes
      {
        id: 'cls-10',
        category: 'classes',
        code: 'CLASS-10',
        name: 'Grade 10',
        status: 'ACTIVE',
        schoolId
      },
      {
        id: 'cls-9',
        category: 'classes',
        code: 'CLASS-9',
        name: 'Grade 9',
        status: 'ACTIVE',
        schoolId
      },
      // Sections
      {
        id: 'sec-a',
        category: 'sections',
        code: 'SEC-A',
        name: 'Section A',
        status: 'ACTIVE',
        schoolId
      },
      {
        id: 'sec-b',
        category: 'sections',
        code: 'SEC-B',
        name: 'Section B',
        status: 'ACTIVE',
        schoolId
      },
      // Subjects
      {
        id: 'sub-math',
        category: 'subjects',
        code: 'MATH101',
        name: 'Mathematics',
        status: 'ACTIVE',
        schoolId
      },
      {
        id: 'sub-sci',
        category: 'subjects',
        code: 'SCI101',
        name: 'Science',
        status: 'ACTIVE',
        schoolId
      },
      {
        id: 'sub-eng',
        category: 'subjects',
        code: 'ENG101',
        name: 'English Language',
        status: 'ACTIVE',
        schoolId
      },
      // Examination Rooms
      {
        id: 'rm-101',
        category: 'examination-rooms',
        code: 'ROOM-101',
        name: 'Hall 101',
        status: 'ACTIVE',
        schoolId,
        metadata: { capacity: 40, building: 'Main Block', floor: '1st Floor' }
      },
      {
        id: 'rm-102',
        category: 'examination-rooms',
        code: 'ROOM-102',
        name: 'Hall 102',
        status: 'ACTIVE',
        schoolId,
        metadata: { capacity: 30, building: 'Main Block', floor: '1st Floor' }
      },
      {
        id: 'rm-auditorium',
        category: 'examination-rooms',
        code: 'AUDITORIUM',
        name: 'Main Auditorium',
        status: 'ACTIVE',
        schoolId,
        metadata: { capacity: 150, building: 'Auditorium Block', floor: 'Ground Floor' }
      },
      // Grading Scheme
      {
        id: 'gs-standard',
        category: 'grading-schemes',
        code: 'STANDARD_100',
        name: 'Standard Percentage Grading Scheme',
        status: 'ACTIVE',
        schoolId,
        metadata: {
          ranges: [
            { grade: 'A+', minPercentage: 90, maxPercentage: 100, gradePoint: 10, isPassing: true, remarks: 'Outstanding' },
            { grade: 'A', minPercentage: 80, maxPercentage: 89.99, gradePoint: 9, isPassing: true, remarks: 'Excellent' },
            { grade: 'B+', minPercentage: 70, maxPercentage: 79.99, gradePoint: 8, isPassing: true, remarks: 'Very Good' },
            { grade: 'B', minPercentage: 60, maxPercentage: 69.99, gradePoint: 7, isPassing: true, remarks: 'Good' },
            { grade: 'C', minPercentage: 50, maxPercentage: 59.99, gradePoint: 6, isPassing: true, remarks: 'Above Average' },
            { grade: 'D', minPercentage: 40, maxPercentage: 49.99, gradePoint: 5, isPassing: true, remarks: 'Pass' },
            { grade: 'F', minPercentage: 0, maxPercentage: 39.99, gradePoint: 0, isPassing: false, remarks: 'Fail' }
          ]
        }
      }
    ];

    for (const record of initialRecords) {
      const fullRecord: BaseMasterRecord = {
        ...record,
        createdAt: now,
        updatedAt: now
      };
      this.records.set(this.getKey(fullRecord.category, fullRecord.id), fullRecord);
    }
  }

  async findById(category: MasterCategory, id: string): Promise<BaseMasterRecord | null> {
    const record = this.records.get(this.getKey(category, id));
    return record || null;
  }

  async findByCode(category: MasterCategory, code: string, schoolId: string): Promise<BaseMasterRecord | null> {
    for (const record of this.records.values()) {
      if (
        record.category === category &&
        record.code.toUpperCase() === code.toUpperCase() &&
        record.schoolId === schoolId
      ) {
        return record;
      }
    }
    return null;
  }

  async findMany(
    filters: MasterFilters,
    pagination: PaginationParams = { page: 1, limit: 50 }
  ): Promise<PaginatedResult<BaseMasterRecord>> {
    let list = Array.from(this.records.values());

    if (filters.category) {
      list = list.filter((r) => r.category === filters.category);
    }
    if (filters.status) {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters.schoolId) {
      list = list.filter((r) => r.schoolId === filters.schoolId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q));
    }

    // Sort by name or createdAt
    list.sort((a, b) => a.name.localeCompare(b.name));

    const total = list.length;
    const page = pagination.page && pagination.page > 0 ? pagination.page : 1;
    const limit = pagination.limit && pagination.limit > 0 ? pagination.limit : 50;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit);

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

  async create(input: CreateMasterInput): Promise<BaseMasterRecord> {
    const id = `mst-${crypto.randomUUID().substring(0, 8)}`;
    const now = new Date().toISOString();

    const metadata: Record<string, any> = {
      ...(input.metadata || {})
    };
    if (input.capacity !== undefined) metadata.capacity = input.capacity;
    if (input.building) metadata.building = input.building;
    if (input.floor) metadata.floor = input.floor;
    if (input.startDate) metadata.startDate = input.startDate;
    if (input.endDate) metadata.endDate = input.endDate;
    if (input.ranges) metadata.ranges = input.ranges;

    const record: BaseMasterRecord = {
      id,
      category: input.category,
      code: input.code.toUpperCase(),
      name: input.name,
      status: input.status || 'ACTIVE',
      schoolId: input.schoolId || 'SCH-001',
      metadata,
      createdAt: now,
      updatedAt: now
    };

    this.records.set(this.getKey(record.category, record.id), record);
    return record;
  }

  async update(category: MasterCategory, id: string, input: UpdateMasterInput): Promise<BaseMasterRecord | null> {
    const existing = await this.findById(category, id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updatedMetadata = { ...existing.metadata, ...(input.metadata || {}) };

    if (input.capacity !== undefined) updatedMetadata.capacity = input.capacity;
    if (input.building) updatedMetadata.building = input.building;
    if (input.floor) updatedMetadata.floor = input.floor;
    if (input.startDate) updatedMetadata.startDate = input.startDate;
    if (input.endDate) updatedMetadata.endDate = input.endDate;
    if (input.ranges) updatedMetadata.ranges = input.ranges;

    const updated: BaseMasterRecord = {
      ...existing,
      name: input.name !== undefined ? input.name : existing.name,
      metadata: updatedMetadata,
      updatedAt: now
    };

    this.records.set(this.getKey(category, id), updated);
    return updated;
  }

  async updateStatus(category: MasterCategory, id: string, status: MasterRecordStatus): Promise<BaseMasterRecord | null> {
    const existing = await this.findById(category, id);
    if (!existing) return null;

    const updated: BaseMasterRecord = {
      ...existing,
      status,
      updatedAt: new Date().toISOString()
    };

    this.records.set(this.getKey(category, id), updated);
    return updated;
  }
}
