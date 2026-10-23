import { Injectable } from '@nestjs/common';
import { BaseInMemoryRepository } from './base-in-memory.repository';
import { IStaffRepository, StaffEntity } from '../interfaces/staff-repository.interface';

@Injectable()
export class InMemoryStaffRepository extends BaseInMemoryRepository<StaffEntity> implements IStaffRepository {
  constructor() {
    super('InMemoryStaffRepository');
    this.seedDevStaff();
  }

  private async seedDevStaff() {
    const staffMembers: Partial<StaffEntity>[] = [
      {
        id: 'stf-001',
        employeeCode: 'EMP-001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'teacher@schoolerp.internal',
        phone: '+1987654321',
        department: 'Mathematics',
        designation: 'Senior Faculty',
        qualification: 'M.Sc, B.Ed',
        dateOfJoining: '2020-06-01',
        salary: 45000,
        status: 'ACTIVE',
        schoolId: 'SCH-001',
      },
    ];

    for (const m of staffMembers) {
      await this.create(m);
    }
  }

  async findByEmployeeCode(employeeCode: string): Promise<StaffEntity | null> {
    const all = Array.from(this.items.values());
    const member = all.find((m) => m.employeeCode.toUpperCase() === employeeCode.toUpperCase());
    return member ? { ...member } : null;
  }

  async findByEmail(email: string): Promise<StaffEntity | null> {
    const all = Array.from(this.items.values());
    const member = all.find((m) => m.email.toLowerCase() === email.toLowerCase());
    return member ? { ...member } : null;
  }
}
