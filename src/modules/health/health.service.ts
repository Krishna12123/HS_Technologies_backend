import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  check() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      architecture: 'Modular Monolith',
      persistenceMode: 'IN_MEMORY_ADAPTERS',
      externalIntegrations: {
        paymentGateway: 'MOCK_PROVIDER',
        notificationProvider: 'MOCK_PROVIDER',
        documentGenerator: 'MOCK_PROVIDER',
        queue: 'IN_MEMORY_EVENT_RUNNER',
      },
    };
  }
}
