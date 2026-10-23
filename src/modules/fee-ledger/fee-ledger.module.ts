import { Module } from '@nestjs/common';
import { FeeLedgerController } from './fee-ledger.controller';
import { FeeLedgerService } from './fee-ledger.service';
import { FeeManagementModule } from '../fee-management/fee-management.module';

@Module({
  imports: [FeeManagementModule],
  controllers: [FeeLedgerController],
  providers: [FeeLedgerService],
  exports: [FeeLedgerService],
})
export class FeeLedgerModule {}
