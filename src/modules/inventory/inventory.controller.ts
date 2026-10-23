import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { InventoryItemEntity } from '../../infrastructure/repositories/interfaces/inventory-repository.interface';

@ApiTags('Inventory & Stock Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get('items')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'List all inventory items and current stock balances' })
  async findAllItems() {
    return this.service.findAllItems();
  }

  @Post('items')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Add a new catalog item to school inventory' })
  async createItem(@Body() body: Omit<InventoryItemEntity, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.service.createItem(body);
  }

  @Post('stock-movements')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Record stock movement (enforces negative stock prevention)' })
  async recordStockMovement(
    @Body()
    body: {
      itemId: string;
      movementType: 'INWARD' | 'OUTWARD' | 'ADJUSTMENT' | 'WRITE_OFF';
      quantity: number;
      referenceDoc: string;
      reason: string;
    },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.recordStockMovement(
      body.itemId,
      body.movementType,
      body.quantity,
      body.referenceDoc,
      body.reason,
      user.userId,
    );
  }

  @Get('reports')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Get stock valuation and low stock alerts' })
  async getInventoryReport() {
    return this.service.getInventoryReport();
  }
}
