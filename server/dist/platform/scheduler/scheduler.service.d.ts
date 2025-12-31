import { OnApplicationBootstrap } from '@nestjs/common';
import { RedisService } from '../../platform/redis/redis.service';
export declare class SchedulerService implements OnApplicationBootstrap {
    private readonly redisService;
    private readonly logger;
    constructor(redisService: RedisService);
    onApplicationBootstrap(): void;
    handleNightlyCleanup(): Promise<void>;
}
