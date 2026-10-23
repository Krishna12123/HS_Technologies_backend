import { IBaseRepository } from './base-repository.interface';

export interface InventoryItemEntity {
  id: string;
  itemCode: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  unitPrice: number;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovementEntity {
  id: string;
  itemId: string;
  movementType: 'INWARD' | 'OUTWARD' | 'ADJUSTMENT' | 'WRITE_OFF';
  quantity: number;
  referenceDoc: string;
  reason: string;
  recordedBy: string;
  createdAt: Date;
}

export interface IInventoryRepository extends IBaseRepository<InventoryItemEntity> {
  findByItemCode(code: string): Promise<InventoryItemEntity | null>;
  recordMovement(movement: Omit<StockMovementEntity, 'id' | 'createdAt'>): Promise<StockMovementEntity>;
  getMovementsByItem(itemId: string): Promise<StockMovementEntity[]>;
}
