import { Injectable, NotFoundException } from '@nestjs/common';

export interface ClassSection {
  id: string;
  name: string; // e.g., "Grade 10"
  code: string;
  sections: { id: string; name: string; capacity: number; classTeacherStaffId?: string }[];
  schoolId: string;
}

@Injectable()
export class ClassesSectionsService {
  private readonly classes = new Map<string, ClassSection>();

  constructor() {
    this.classes.set('cls-10', {
      id: 'cls-10',
      name: 'Class 10',
      code: 'CLS-10',
      sections: [
        { id: 'sec-a', name: 'Section A', capacity: 40, classTeacherStaffId: 'stf-001' },
        { id: 'sec-b', name: 'Section B', capacity: 40 },
      ],
      schoolId: 'SCH-001',
    });
  }

  async findAll(): Promise<ClassSection[]> {
    return Array.from(this.classes.values());
  }

  async findById(id: string): Promise<ClassSection> {
    const cls = this.classes.get(id);
    if (!cls) {
      throw new NotFoundException(`Class '${id}' not found`);
    }
    return cls;
  }
}
