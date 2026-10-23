import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '../../common/decorators/roles.decorator';

@ApiTags('Health & Readiness Probes')
@Controller('health')
export class HealthController {
  constructor(private readonly service: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'System health check and runtime state probe' })
  check() {
    return this.service.check();
  }
}
