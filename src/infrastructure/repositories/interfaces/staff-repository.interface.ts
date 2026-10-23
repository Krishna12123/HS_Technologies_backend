import { IBaseRepository } from './base-repository.interface';

export interface StaffEntity {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  qualification: string;
  dateOfJoining: string;
  salary: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStaffRepository extends IBaseRepository<StaffEntity> {
  findByEmployeeCode(employeeCode: string): Promise<StaffEntity | null>;
  findByEmail(email: string): Promise<StaffEntity | null>;
}
