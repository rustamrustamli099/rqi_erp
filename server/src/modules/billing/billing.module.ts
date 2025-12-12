import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingScheduler } from './billing.scheduler';
import { PaymentModule } from '../payment/payment.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        PaymentModule
    ],
    providers: [BillingService, BillingScheduler, PrismaService],
    exports: [BillingService],
})
export class BillingModule { }
