
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BillingUseCase } from './application/billing.usecase';
import { BillingEventListener } from './infrastructure/events/billing.event-listener';
import { BillingCron } from './infrastructure/cron/billing.cron';
import { PrismaService } from '../../prisma.service';
import { PrismaSubscriptionRepository } from './infrastructure/prisma-subscription.repository';
import { PrismaInvoiceRepository } from './infrastructure/prisma-invoice.repository';
import { PackagesModule } from '../packages/packages.module';
import { BillingController } from './api/billing.controller';

@Module({
    imports: [
        ScheduleModule,
        PackagesModule
    ],
    controllers: [BillingController],
    providers: [
        BillingUseCase,
        BillingEventListener,
        BillingCron,
        PrismaService,
        {
            provide: 'ISubscriptionRepository',
            useClass: PrismaSubscriptionRepository,
        },
        {
            provide: 'IInvoiceRepository',
            useClass: PrismaInvoiceRepository,
        }
    ],
    exports: [BillingUseCase],
})
export class BillingModule { }
