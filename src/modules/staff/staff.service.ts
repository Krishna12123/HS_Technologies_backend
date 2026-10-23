import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { IStaffRepository, StaffEntity } from '../../infrastructure/repositories/interfaces/staff-repository.interface';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @Inject('IStaffRepository')
    private readonly staffRepository: IStaffRepository,
  ) {}

  async findAll(): Promise<StaffEntity[]> {
    return this.staffRepository.findAll();
  }

  async findById(id: string): Promise<StaffEntity> {
    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundException(`Staff member with id '${id}' not found`);
    }
    return staff;
  }

  async create(dto: CreateStaffDto): Promise<StaffEntity> {
    const existingCode = await this.staffRepository.findByEmployeeCode(dto.employeeCode);
    if (existingCode) {
      throw new ConflictException(`Staff with employee code '${dto.employeeCode}' already exists`);
    }

    const existingEmail = await this.staffRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException(`Staff with email '${dto.email}' already exists`);
    }

    return this.staffRepository.create({
      ...dto,
      status: 'ACTIVE',
    });
  }

  async update(id: string, dto: UpdateStaffDto): Promise<StaffEntity> {
    await this.findById(id);
    return this.staffRepository.update(id, dto);
  }
}
