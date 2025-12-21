import { RedisService } from '../../platform/redis/redis.service';
export declare class MaintenanceService {
    private readonly redisService;
    private readonly MAINTENANCE_KEY;
    private readonly MSG_KEY;
    constructor(redisService: RedisService);
    enableMaintenance(message?: string): Promise<void>;
    disableMaintenance(): Promise<void>;
    isMaintenanceMode(): Promise<{
        isEnabled: boolean;
        message?: string;
    }>;
}
