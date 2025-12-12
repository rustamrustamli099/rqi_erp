import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BillingService } from './billing.service';

@Injectable()
export class BillingCronService {
    private readonly logger = new Logger(BillingCronService.name);

    constructor(private readonly billingService: BillingService) { }

    // Runs every day at midnight (00:00)
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailyBilling() {
        this.logger.log('Starting daily billing process...');
        try {
            const result = await this.billingService.processRecurringBilling();
            this.logger.log(`Daily billing completed. Processed ${result.processed} subscriptions.`);
        } catch (error) {
            this.logger.error('Failed to process daily billing', error.stack);
        }
    }

    // Runs every hour to check for overdue invoices and trigger dunning actions (retries/suspensions)
    @Cron(CronExpression.EVERY_HOUR) // or EVERY_DAY if daily check is enough
    async handleDunningProcess() {
        this.logger.log('Starting dunning process checks...');
        // TODO: Implement processDunning() in BillingService
        // const result = await this.billingService.processDunning();
    }
}
