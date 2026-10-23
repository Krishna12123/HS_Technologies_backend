import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeeManagementService } from './fee-management.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FeeStructureEntity } from '../../infrastructure/repositories/interfaces/fee-repository.interface';

@ApiTags('Fee Management & Fee Structures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fee-structures')
export class FeeManagementController {
  constructor(private readonly service: FeeManagementService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PARENT')
  @ApiOperation({ summary: 'List all fee structures by academic year & class' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Get fee structure details' })
  async findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Define a new institutional fee structure' })
  async create(@Body() body: Omit<FeeStructureEntity, 'id' | 'createdAt' | 'updatedAt' | 'totalAnnualAmount'>) {
    return this.service.create(body);
  }
}
