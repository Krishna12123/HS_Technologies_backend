import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeeLedgerService } from './fee-ledger.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Fee Ledger & Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class FeeLedgerController {
  constructor(private readonly service: FeeLedgerService) {}

  @Get('invoices')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'List all generated fee invoices' })
  async findAllInvoices() {
    return this.service.findAllInvoices();
  }

  @Get('invoices/:id')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PARENT', 'STUDENT')
  @ApiOperation({ summary: 'Get invoice details by ID' })
  async findInvoiceById(@Param('id') id: string) {
    return this.service.findInvoiceById(id);
  }

  @Post('invoices')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Generate a new student fee invoice' })
  async createInvoice(
    @Body()
    body: {
      studentId: string;
      feeStructureId: string;
      term: string;
      totalAmount: number;
      discountAmount: number;
      dueDate: string;
    },
  ) {
    return this.service.createInvoice(body);
  }

  @Get('fee-accounts/:studentId')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PARENT', 'STUDENT')
  @ApiOperation({ summary: 'Get comprehensive student fee ledger and outstanding balance' })
  async getStudentFeeAccount(@Param('studentId') studentId: string) {
    return this.service.getStudentFeeAccount(studentId);
  }
}
