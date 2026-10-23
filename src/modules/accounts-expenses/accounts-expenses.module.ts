import { Module } from '@nestjs/common';
import { AccountsExpensesController } from './accounts-expenses.controller';
import { AccountsExpensesService } from './accounts-expenses.service';

@Module({
  controllers: [AccountsExpensesController],
  providers: [AccountsExpensesService],
  exports: [AccountsExpensesService],
})
export class AccountsExpensesModule {}
