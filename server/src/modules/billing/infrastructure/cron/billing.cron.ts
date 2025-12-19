
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BillingUseCase } from '../../application/billing.usecase';

@Injectable()
export class BillingCron {
    private readonly logger = new Logger(BillingCron.name);

    constructor(private readonly billingUseCase: BillingUseCase) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailyBilling() {
        this.logger.log('Running daily billing cron...');
        try {
            await this.billingUseCase.processRecurringBilling();
            this.logger.log('Daily billing cycle complete.');
        } catch (error) {
            this.logger.error('Critical failure in billing cycle', error.stack);
        }
    }
}
