import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { InMemoryInventoryRepository } from '../../infrastructure/repositories/in-memory/in-memory-inventory.repository';
import { BadRequestException } from '@nestjs/common';

describe('InventoryService (Business Logic)', () => {
  let service: InventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: 'IInventoryRepository',
          useClass: InMemoryInventoryRepository,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should prevent stock movements that result in negative stock balance', async () => {
    // itm-001 has currentStock = 250
    await expect(
      service.recordStockMovement(
        'itm-001',
        'OUTWARD',
        300, // exceeds 250
        'REQ-001',
        'Bulk department dispatch',
        'usr-admin-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow valid outward stock movements within limits', async () => {
    const movement = await service.recordStockMovement(
      'itm-001',
      'OUTWARD',
      50,
      'REQ-002',
      'Classroom stock issue',
      'usr-admin-1',
    );

    expect(movement).toBeDefined();
    expect(movement.quantity).toEqual(50);
  });
});
