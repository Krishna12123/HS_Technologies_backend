import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface BellSchedule {
  id: string;
  name: string; // e.g. "Morning Assembly", "Period 1 End"
  time: string; // "08:30"
  durationSeconds: number;
  bellType: 'SINGLE' | 'DOUBLE' | 'CONTINUOUS';
  daysOfWeek: number[]; // 1 to 6 (Mon - Sat)
  isActive: boolean;
}

@Injectable()
export class SchoolBellService {
  private readonly schedules = new Map<string, BellSchedule>();

  constructor() {
    this.schedules.set('bell-01', {
      id: 'bell-01',
      name: 'School Commencement Bell',
      time: '08:00',
      durationSeconds: 15,
      bellType: 'SINGLE',
      daysOfWeek: [1, 2, 3, 4, 5, 6],
      isActive: true,
    });
    this.schedules.set('bell-02', {
      id: 'bell-02',
      name: 'Lunch Recess Start',
      time: '12:30',
      durationSeconds: 20,
      bellType: 'DOUBLE',
      daysOfWeek: [1, 2, 3, 4, 5],
      isActive: true,
    });
  }

  async findAll(): Promise<BellSchedule[]> {
    return Array.from(this.schedules.values());
  }

  async create(data: Omit<BellSchedule, 'id'>): Promise<BellSchedule> {
    const id = `bell-${uuidv4().substring(0, 6)}`;
    const schedule: BellSchedule = { ...data, id };
    this.schedules.set(id, schedule);
    return schedule;
  }
}
