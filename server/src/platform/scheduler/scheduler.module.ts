
import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { RedisModule } from '../../platform/redis/redis.module';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        RedisModule,
        NestScheduleModule.forRoot()
    ],
    providers: [SchedulerService],
    exports: [SchedulerService]
})
export class SchedulerModule { }
