import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { FeeManagementModule } from '../fee-management/fee-management.module';
import { MockPaymentGatewayProvider } from '../../infrastructure/payment-gateways/mock-payment-gateway.provider';
import { MockDocumentGenerator } from '../../infrastructure/document-generation/mock-document-generator';

@Module({
  imports: [FeeManagementModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    {
      provide: 'IPaymentGatewayProvider',
      useClass: MockPaymentGatewayProvider,
    },
    {
      provide: 'IDocumentGenerator',
      useClass: MockDocumentGenerator,
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
