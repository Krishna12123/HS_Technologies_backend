import { Injectable } from '@nestjs/common';
import { BaseInMemoryRepository } from './base-in-memory.repository';
import {
  IInventoryRepository,
  InventoryItemEntity,
  StockMovementEntity,
} from '../interfaces/inventory-repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InMemoryInventoryRepository
  extends BaseInMemoryRepository<InventoryItemEntity>
  implements IInventoryRepository
{
  private readonly movements = new Map<string, StockMovementEntity>();

  constructor() {
    super('InMemoryInventoryRepository');
    this.seedDevInventory();
  }

  private async seedDevInventory() {
    await this.create({
      id: 'itm-001',
      itemCode: 'NB-A4-01',
      name: 'Standard A4 Exercise Notebooks',
      category: 'Stationery',
      unit: 'BOX',
      currentStock: 250,
      reorderLevel: 50,
      unitPrice: 400,
      schoolId: 'SCH-001',
    });
  }

  async findByItemCode(code: string): Promise<InventoryItemEntity | null> {
    const all = Array.from(this.items.values());
    const match = all.find((i) => i.itemCode.toUpperCase() === code.toUpperCase());
    return match ? { ...match } : null;
  }

  async recordMovement(movement: Omit<StockMovementEntity, 'id' | 'createdAt'>): Promise<StockMovementEntity> {
    const id = uuidv4();
    const newMovement: StockMovementEntity = {
      ...movement,
      id,
      createdAt: new Date(),
    };
    this.movements.set(id, newMovement);

    // Update item stock level
    const item = this.items.get(movement.itemId);
    if (item) {
      if (movement.movementType === 'INWARD') {
        item.currentStock += movement.quantity;
      } else if (movement.movementType === 'OUTWARD' || movement.movementType === 'WRITE_OFF') {
        item.currentStock -= movement.quantity;
      } else if (movement.movementType === 'ADJUSTMENT') {
        item.currentStock = movement.quantity;
      }
      item.updatedAt = new Date();
      this.items.set(movement.itemId, item);
    }

    return { ...newMovement };
  }

  async getMovementsByItem(itemId: string): Promise<StockMovementEntity[]> {
    return Array.from(this.movements.values()).filter((m) => m.itemId === itemId);
  }
}
