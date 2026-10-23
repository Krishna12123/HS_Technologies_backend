import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InMemoryInventoryRepository } from '../../infrastructure/repositories/in-memory/in-memory-inventory.repository';

@Module({
  controllers: [InventoryController],
  providers: [
    InventoryService,
    {
      provide: 'IInventoryRepository',
      useClass: InMemoryInventoryRepository,
    },
  ],
  exports: [InventoryService, 'IInventoryRepository'],
})
export class InventoryModule {}
