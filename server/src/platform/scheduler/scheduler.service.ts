
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { RedisService } from '../../platform/redis/redis.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SchedulerService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(private readonly redisService: RedisService) { }

    onApplicationBootstrap() {
        this.logger.log('Scheduler initialized with Redis distributed locks.');
    }

    // Example Job: Nightly Cleanup
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleNightlyCleanup() {
        const jobId = 'job:nightly_cleanup';
        const lockTtl = 60 * 60; // 1 hour lock

        const acquired = await this.redisService.acquireLock(jobId, lockTtl);
        if (!acquired) {
            this.logger.log('Nightly cleanup job skipped (lock held by another instance).');
            return;
        }

        try {
            this.logger.warn('Starting Nightly Cleanup...');
            // Delegation to RetentionModule would happen here
            // await this.retentionService.executePolicy();
            await new Promise(resolve => setTimeout(resolve, 5000)); // Simulating work
            this.logger.log('Nightly Cleanup Completed.');
        } catch (error) {
            this.logger.error('Nightly Cleanup Failed', error);
        } finally {
            await this.redisService.releaseLock(jobId);
        }
    }
}
