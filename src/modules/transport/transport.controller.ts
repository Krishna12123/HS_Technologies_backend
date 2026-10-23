import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransportService } from './transport.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  TransportRouteEntity,
  TransportAllocationEntity,
} from '../../infrastructure/repositories/interfaces/transport-repository.interface';

@ApiTags('Transport & Fleet Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transport')
export class TransportController {
  constructor(private readonly service: TransportService) {}

  @Get('routes')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TRANSPORT_MANAGER', 'PARENT', 'STUDENT')
  @ApiOperation({ summary: 'List all bus routes, vehicle numbers, and seat capacities' })
  async findAllRoutes() {
    return this.service.findAllRoutes();
  }

  @Post('routes')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TRANSPORT_MANAGER')
  @ApiOperation({ summary: 'Register a new transport route' })
  async createRoute(@Body() body: Omit<TransportRouteEntity, 'id' | 'allocatedStudentsCount' | 'createdAt' | 'updatedAt'>) {
    return this.service.createRoute(body);
  }

  @Get('allocations')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TRANSPORT_MANAGER')
  @ApiOperation({ summary: 'Get student route seat allocations' })
  @ApiQuery({ name: 'routeId', required: false })
  async getAllocations(@Query('routeId') routeId?: string) {
    return this.service.getAllocations(routeId);
  }

  @Post('allocations')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TRANSPORT_MANAGER')
  @ApiOperation({ summary: 'Allocate a student to a transport route (enforces vehicle seat capacity limit)' })
  async allocateStudent(@Body() body: Omit<TransportAllocationEntity, 'id' | 'createdAt'>) {
    return this.service.allocateStudent(body);
  }
}
