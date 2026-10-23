import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Subject {
  id: string;
  name: string;
  code: string;
  type: 'THEORY' | 'PRACTICAL';
  creditHours: number;
}

export interface SyllabusItem {
  id: string;
  subjectId: string;
  classId: string;
  title: string;
  description: string;
  estimatedHours: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

@Injectable()
export class AcademicsService {
  private readonly subjects = new Map<string, Subject>();
  private readonly syllabus = new Map<string, SyllabusItem>();

  constructor() {
    this.seedAcademics();
  }

  private seedAcademics() {
    this.subjects.set('sbj-math', {
      id: 'sbj-math',
      name: 'Advanced Mathematics',
      code: 'MTH-101',
      type: 'THEORY',
      creditHours: 4,
    });
    this.subjects.set('sbj-sci', {
      id: 'sbj-sci',
      name: 'Physical Science',
      code: 'SCI-101',
      type: 'THEORY',
      creditHours: 4,
    });

    this.syllabus.set('syl-01', {
      id: 'syl-01',
      subjectId: 'sbj-math',
      classId: 'cls-10',
      title: 'Quadratic Equations & Trigonometry',
      description: 'Standard roots, quadratic formulas, trigonometric ratios',
      estimatedHours: 20,
      status: 'IN_PROGRESS',
    });
  }

  async getSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async createSubject(data: Omit<Subject, 'id'>): Promise<Subject> {
    const id = `sbj-${uuidv4().substring(0, 6)}`;
    const subject = { ...data, id };
    this.subjects.set(id, subject);
    return subject;
  }

  async getSyllabus(subjectId?: string, classId?: string): Promise<SyllabusItem[]> {
    let result = Array.from(this.syllabus.values());
    if (subjectId) result = result.filter((s) => s.subjectId === subjectId);
    if (classId) result = result.filter((s) => s.classId === classId);
    return result;
  }

  async addSyllabusItem(data: Omit<SyllabusItem, 'id'>): Promise<SyllabusItem> {
    const id = `syl-${uuidv4().substring(0, 6)}`;
    const item = { ...data, id };
    this.syllabus.set(id, item);
    return item;
  }
}
