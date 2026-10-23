import { IBaseRepository } from './base-repository.interface';

export interface StudentEntity {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  classId: string;
  sectionId: string;
  academicYearId: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'GRADUATED';
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentRepository extends IBaseRepository<StudentEntity> {
  findByAdmissionNumber(admissionNumber: string): Promise<StudentEntity | null>;
  findByClassAndSection(classId: string, sectionId: string): Promise<StudentEntity[]>;
}
