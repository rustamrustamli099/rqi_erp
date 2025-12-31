
import { Injectable } from '@nestjs/common';
import { RedisService } from '../../platform/redis/redis.service';

@Injectable()
export class MaintenanceService {
    private readonly MAINTENANCE_KEY = 'sys:maintenance';
    private readonly MSG_KEY = 'sys:maintenance:msg';

    constructor(private readonly redisService: RedisService) { }

    async enableMaintenance(message: string = 'System is under maintenance. Please try again later.'): Promise<void> {
        await this.redisService.set(this.MAINTENANCE_KEY, 'true');
        await this.redisService.set(this.MSG_KEY, message);
    }

    async disableMaintenance(): Promise<void> {
        await this.redisService.del(this.MAINTENANCE_KEY);
        await this.redisService.del(this.MSG_KEY);
    }

    async isMaintenanceMode(): Promise<{ isEnabled: boolean; message?: string }> {
        const isEnabled = await this.redisService.get(this.MAINTENANCE_KEY);
        if (isEnabled === 'true') {
            const message = await this.redisService.get(this.MSG_KEY) || 'Maintenance';
            return { isEnabled: true, message };
        }
        return { isEnabled: false };
    }
}
