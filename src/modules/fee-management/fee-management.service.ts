import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IFeeRepository, FeeStructureEntity } from '../../infrastructure/repositories/interfaces/fee-repository.interface';

@Injectable()
export class FeeManagementService {
  constructor(
    @Inject('IFeeRepository')
    private readonly feeRepository: IFeeRepository,
  ) {}

  async findAll(): Promise<FeeStructureEntity[]> {
    return this.feeRepository.findAll();
  }

  async findById(id: string): Promise<FeeStructureEntity> {
    const fs = await this.feeRepository.findById(id);
    if (!fs) {
      throw new NotFoundException(`Fee structure '${id}' not found`);
    }
    return fs;
  }

  async create(data: Omit<FeeStructureEntity, 'id' | 'createdAt' | 'updatedAt' | 'totalAnnualAmount'>): Promise<FeeStructureEntity> {
    const totalAnnualAmount =
      data.tuitionFee + data.transportFee + data.labFee + data.libraryFee;

    return this.feeRepository.create({
      ...data,
      totalAnnualAmount,
      schoolId: 'SCH-001',
    });
  }
}
