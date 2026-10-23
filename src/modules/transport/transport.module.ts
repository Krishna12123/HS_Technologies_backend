import { Module } from '@nestjs/common';
import { TransportController } from './transport.controller';
import { TransportService } from './transport.service';
import { InMemoryTransportRepository } from '../../infrastructure/repositories/in-memory/in-memory-transport.repository';

@Module({
  controllers: [TransportController],
  providers: [
    TransportService,
    {
      provide: 'ITransportRepository',
      useClass: InMemoryTransportRepository,
    },
  ],
  exports: [TransportService, 'ITransportRepository'],
})
export class TransportModule {}
