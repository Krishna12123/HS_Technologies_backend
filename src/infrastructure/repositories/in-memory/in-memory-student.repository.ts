import { Injectable } from '@nestjs/common';
import { BaseInMemoryRepository } from './base-in-memory.repository';
import { IStudentRepository, StudentEntity } from '../interfaces/student-repository.interface';

@Injectable()
export class InMemoryStudentRepository extends BaseInMemoryRepository<StudentEntity> implements IStudentRepository {
  constructor() {
    super('InMemoryStudentRepository');
    this.seedDevStudents();
  }

  private async seedDevStudents() {
    const students: Partial<StudentEntity>[] = [
      {
        id: 'std-001',
        admissionNumber: 'ADM-2026-001',
        firstName: 'Leo',
        lastName: 'Taylor',
        dateOfBirth: '2012-05-14',
        gender: 'MALE',
        classId: 'cls-10',
        sectionId: 'sec-a',
        academicYearId: 'ay-2026',
        parentEmail: 'parent@schoolerp.internal',
        parentPhone: '+1234567890',
        address: '123 Academic Way, Education City',
        status: 'ACTIVE',
        schoolId: 'SCH-001',
      },
      {
        id: 'std-002',
        admissionNumber: 'ADM-2026-002',
        firstName: 'Emma',
        lastName: 'Watson',
        dateOfBirth: '2012-08-20',
        gender: 'FEMALE',
        classId: 'cls-10',
        sectionId: 'sec-a',
        academicYearId: 'ay-2026',
        parentEmail: 'emma.parent@schoolerp.internal',
        parentPhone: '+1234567891',
        address: '456 Oxford Street',
        status: 'ACTIVE',
        schoolId: 'SCH-001',
      },
    ];

    for (const s of students) {
      await this.create(s);
    }
  }

  async findByAdmissionNumber(admissionNumber: string): Promise<StudentEntity | null> {
    const all = Array.from(this.items.values());
    const student = all.find((s) => s.admissionNumber.toUpperCase() === admissionNumber.toUpperCase());
    return student ? { ...student } : null;
  }

  async findByClassAndSection(classId: string, sectionId: string): Promise<StudentEntity[]> {
    return (await this.findAll()).filter((s) => s.classId === classId && s.sectionId === sectionId);
  }
}
