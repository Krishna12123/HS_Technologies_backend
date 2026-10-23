import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import {
  ITransportRepository,
  TransportRouteEntity,
  TransportAllocationEntity,
} from '../../infrastructure/repositories/interfaces/transport-repository.interface';

@Injectable()
export class TransportService {
  constructor(
    @Inject('ITransportRepository')
    private readonly transportRepository: ITransportRepository,
  ) {}

  async findAllRoutes(): Promise<TransportRouteEntity[]> {
    return this.transportRepository.findAll();
  }

  async createRoute(data: Omit<TransportRouteEntity, 'id' | 'allocatedStudentsCount' | 'createdAt' | 'updatedAt'>): Promise<TransportRouteEntity> {
    const existing = await this.transportRepository.findByRouteCode(data.routeCode);
    if (existing) {
      throw new ConflictException(`Route with code '${data.routeCode}' already exists`);
    }

    return this.transportRepository.create({
      ...data,
      allocatedStudentsCount: 0,
      schoolId: 'SCH-001',
    });
  }

  async allocateStudent(data: Omit<TransportAllocationEntity, 'id' | 'createdAt'>): Promise<TransportAllocationEntity> {
    const route = await this.transportRepository.findById(data.routeId);
    if (!route) {
      throw new NotFoundException(`Transport route '${data.routeId}' not found`);
    }

    // Business Rule: Vehicle Capacity Check
    if (route.allocatedStudentsCount >= route.capacity) {
      throw new BadRequestException(
        `Route '${route.routeName}' has reached maximum vehicle capacity (${route.capacity} seats). Cannot allocate more students.`,
      );
    }

    // Check if student already allocated to an active route
    const existingAllocation = await this.transportRepository.findAllocationByStudent(data.studentId);
    if (existingAllocation) {
      throw new ConflictException(`Student '${data.studentId}' already has an active route allocation.`);
    }

    return this.transportRepository.allocateStudent(data);
  }

  async getAllocations(routeId?: string): Promise<TransportAllocationEntity[]> {
    if (routeId) {
      return this.transportRepository.findAllocationsByRoute(routeId);
    }
    return (this.transportRepository as any).allocations ? Array.from((this.transportRepository as any).allocations.values()) : [];
  }
}
