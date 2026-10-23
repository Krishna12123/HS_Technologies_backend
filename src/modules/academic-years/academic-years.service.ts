import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2026-2027"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  schoolId: string;
}

@Injectable()
export class AcademicYearsService {
  private readonly years = new Map<string, AcademicYear>();

  constructor() {
    this.years.set('ay-2026', {
      id: 'ay-2026',
      name: '2026-2027',
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      isCurrent: true,
      schoolId: 'SCH-001',
    });
  }

  async findAll(): Promise<AcademicYear[]> {
    return Array.from(this.years.values());
  }

  async findCurrent(): Promise<AcademicYear> {
    const current = Array.from(this.years.values()).find((y) => y.isCurrent);
    if (!current) {
      throw new NotFoundException('No active academic session marked.');
    }
    return current;
  }

  async create(data: Omit<AcademicYear, 'id'>): Promise<AcademicYear> {
    const id = `ay-${uuidv4().substring(0, 8)}`;
    if (data.isCurrent) {
      this.years.forEach((y) => (y.isCurrent = false));
    }
    const newYear = { ...data, id };
    this.years.set(id, newYear);
    return newYear;
  }
}
