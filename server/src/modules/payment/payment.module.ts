import { Module } from '@nestjs/common';
import { PaymentUseCase } from './application/payment.usecase';
import { StripeStrategy } from './infrastructure/stripe.strategy';
import { PrismaService } from '../../prisma.service';
import { PaymentController } from './api/payment.controller';
import { DomainEventBus } from '../../shared-kernel/event-bus/event-bus.service';

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentUseCase,
    PrismaService,
    DomainEventBus,
    {
      provide: 'IPaymentGateway',
      useClass: StripeStrategy // Default strategy
    }
  ],
  exports: [PaymentUseCase],
})
export class PaymentModule { }
