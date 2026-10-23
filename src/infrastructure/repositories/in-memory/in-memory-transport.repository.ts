import { Injectable } from '@nestjs/common';
import { BaseInMemoryRepository } from './base-in-memory.repository';
import {
  ITransportRepository,
  TransportRouteEntity,
  TransportAllocationEntity,
} from '../interfaces/transport-repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InMemoryTransportRepository
  extends BaseInMemoryRepository<TransportRouteEntity>
  implements ITransportRepository
{
  private readonly allocations = new Map<string, TransportAllocationEntity>();

  constructor() {
    super('InMemoryTransportRepository');
    this.seedDevTransport();
  }

  private async seedDevTransport() {
    await this.create({
      id: 'rt-001',
      routeName: 'North Campus Route #1',
      routeCode: 'BUS-NCR-01',
      vehicleNumber: 'DL-01-AB-1234',
      driverName: 'Ramesh Kumar',
      driverContact: '+919988776655',
      capacity: 40,
      allocatedStudentsCount: 1,
      monthlyFee: 2500,
      schoolId: 'SCH-001',
    });

    await this.allocateStudent({
      studentId: 'std-001',
      routeId: 'rt-001',
      pickupStop: 'Green Park Metro Station',
      dropStop: 'North Campus Gate 2',
      academicYearId: 'ay-2026',
      status: 'ACTIVE',
    });
  }

  async findByRouteCode(routeCode: string): Promise<TransportRouteEntity | null> {
    const all = Array.from(this.items.values());
    const match = all.find((r) => r.routeCode.toUpperCase() === routeCode.toUpperCase());
    return match ? { ...match } : null;
  }

  async allocateStudent(
    allocation: Omit<TransportAllocationEntity, 'id' | 'createdAt'>,
  ): Promise<TransportAllocationEntity> {
    const id = uuidv4();
    const newAllocation: TransportAllocationEntity = {
      ...allocation,
      id,
      createdAt: new Date(),
    };
    this.allocations.set(id, newAllocation);

    const route = this.items.get(allocation.routeId);
    if (route) {
      route.allocatedStudentsCount += 1;
      this.items.set(allocation.routeId, route);
    }

    return { ...newAllocation };
  }

  async findAllocationsByRoute(routeId: string): Promise<TransportAllocationEntity[]> {
    return Array.from(this.allocations.values()).filter((a) => a.routeId === routeId);
  }

  async findAllocationByStudent(studentId: string): Promise<TransportAllocationEntity | null> {
    const all = Array.from(this.allocations.values());
    const match = all.find((a) => a.studentId === studentId && a.status === 'ACTIVE');
    return match ? { ...match } : null;
  }
}
