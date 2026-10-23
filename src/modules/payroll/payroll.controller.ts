import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@ApiTags('Payroll & Salary Calculations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private readonly service: PayrollService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HR_STAFF', 'ACCOUNTANT')
  @ApiOperation({ summary: 'List all staff salary compensation structures' })
  async getSalaryStructures() {
    return this.service.getSalaryStructures();
  }

  @Post('runs')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HR_STAFF')
  @ApiOperation({ summary: 'Execute monthly payroll batch calculation' })
  async runMonthlyPayroll(@Body() body: { month: number; year: number }) {
    return this.service.runMonthlyPayroll(body.month, body.year);
  }

  @Get('runs/:id')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HR_STAFF', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Get payroll run batch summary and individual employee payslips' })
  async getPayrollRun(@Param('id') id: string) {
    return this.service.getPayrollRun(id);
  }

  @Post('runs/:id/approve')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  @ApiOperation({ summary: 'Approve payroll run for disbursement' })
  async approvePayrollRun(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.approvePayrollRun(id, user.userId);
  }

  @Get('slips/:id')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'HR_STAFF', 'ACCOUNTANT', 'TEACHER')
  @ApiOperation({ summary: 'Generate and download digital payslip PDF' })
  async getPayslip(@Param('id') id: string) {
    return this.service.getPayslip(id);
  }
}
