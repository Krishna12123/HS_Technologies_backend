import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccountsExpensesService, ExpenseRecord } from './accounts-expenses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@ApiTags('Accounts & Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('accounts')
export class AccountsExpensesController {
  constructor(private readonly service: AccountsExpensesService) {}

  @Get('expenses')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'List all institution expense vouchers' })
  async findAll() {
    return this.service.findAll();
  }

  @Post('expenses')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Record a new expense disbursement voucher' })
  async recordExpense(
    @Body() body: Omit<ExpenseRecord, 'id' | 'voucherNumber' | 'approvedBy'>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.recordExpense({ ...body, approvedBy: user.userId });
  }

  @Get('reports/financial')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Get fiscal expense and category breakdown reports' })
  async getReport() {
    return this.service.getFinancialReport();
  }
}
