import { Module } from '@nestjs/common';
import { FeeManagementController } from './fee-management.controller';
import { FeeManagementService } from './fee-management.service';
import { InMemoryFeeRepository } from '../../infrastructure/repositories/in-memory/in-memory-fee.repository';

@Module({
  controllers: [FeeManagementController],
  providers: [
    FeeManagementService,
    {
      provide: 'IFeeRepository',
      useClass: InMemoryFeeRepository,
    },
  ],
  exports: [FeeManagementService, 'IFeeRepository'],
})
export class FeeManagementModule {}
