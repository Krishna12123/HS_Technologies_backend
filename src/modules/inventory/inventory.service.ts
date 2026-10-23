import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  IInventoryRepository,
  InventoryItemEntity,
  StockMovementEntity,
} from '../../infrastructure/repositories/interfaces/inventory-repository.interface';

@Injectable()
export class InventoryService {
  constructor(
    @Inject('IInventoryRepository')
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async findAllItems(): Promise<InventoryItemEntity[]> {
    return this.inventoryRepository.findAll();
  }

  async createItem(dto: Omit<InventoryItemEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItemEntity> {
    const existing = await this.inventoryRepository.findByItemCode(dto.itemCode);
    if (existing) {
      throw new BadRequestException(`Item with code '${dto.itemCode}' already exists`);
    }

    return this.inventoryRepository.create({
      ...dto,
      schoolId: 'SCH-001',
    });
  }

  async recordStockMovement(
    itemId: string,
    movementType: 'INWARD' | 'OUTWARD' | 'ADJUSTMENT' | 'WRITE_OFF',
    quantity: number,
    referenceDoc: string,
    reason: string,
    userId: string,
  ): Promise<StockMovementEntity> {
    const item = await this.inventoryRepository.findById(itemId);
    if (!item) {
      throw new NotFoundException(`Inventory item '${itemId}' not found`);
    }

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    // Business Rule: Negative Stock Protection
    if ((movementType === 'OUTWARD' || movementType === 'WRITE_OFF') && item.currentStock < quantity) {
      throw new BadRequestException(
        `Insufficient stock for item '${item.name}'. Current stock: ${item.currentStock}, Requested: ${quantity}`,
      );
    }

    return this.inventoryRepository.recordMovement({
      itemId,
      movementType,
      quantity,
      referenceDoc,
      reason,
      recordedBy: userId,
    });
  }

  async getInventoryReport() {
    const items = await this.inventoryRepository.findAll();
    const lowStockItems = items.filter((i) => i.currentStock <= i.reorderLevel);
    const totalInventoryValue = items.reduce((acc, i) => acc + i.currentStock * i.unitPrice, 0);

    return {
      totalItemsCount: items.length,
      lowStockAlertCount: lowStockItems.length,
      totalInventoryValue,
      lowStockItems,
    };
  }
}
