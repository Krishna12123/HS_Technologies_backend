import { IBaseRepository } from './base-repository.interface';

export interface TransportRouteEntity {
  id: string;
  routeName: string;
  routeCode: string;
  vehicleNumber: string;
  driverName: string;
  driverContact: string;
  capacity: number;
  allocatedStudentsCount: number;
  monthlyFee: number;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransportAllocationEntity {
  id: string;
  studentId: string;
  routeId: string;
  pickupStop: string;
  dropStop: string;
  academicYearId: string;
  status: 'ACTIVE' | 'CANCELLED';
  createdAt: Date;
}

export interface ITransportRepository extends IBaseRepository<TransportRouteEntity> {
  findByRouteCode(routeCode: string): Promise<TransportRouteEntity | null>;
  allocateStudent(allocation: Omit<TransportAllocationEntity, 'id' | 'createdAt'>): Promise<TransportAllocationEntity>;
  findAllocationsByRoute(routeId: string): Promise<TransportAllocationEntity[]>;
  findAllocationByStudent(studentId: string): Promise<TransportAllocationEntity | null>;
}
