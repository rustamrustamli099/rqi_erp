import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { StripeStrategy } from './strategies/stripe.strategy';

@Module({
  providers: [PaymentService, StripeStrategy],
  exports: [PaymentService],
})
export class PaymentModule { }
