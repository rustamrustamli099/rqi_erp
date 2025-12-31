
import { Module } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { RedisModule } from '../../platform/redis/redis.module';

@Module({
    imports: [RedisModule],
    providers: [MaintenanceService],
    controllers: [MaintenanceController],
    exports: [MaintenanceService],
})
export class MaintenanceModule { }
