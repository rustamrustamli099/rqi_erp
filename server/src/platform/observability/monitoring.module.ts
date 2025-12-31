
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { MonitoringController } from './monitoring.controller';
import { MetricsController } from './metrics.controller';
import { PrismaService } from '../../prisma.service';
import { collectDefaultMetrics } from 'prom-client';

@Module({
    imports: [TerminusModule],
    controllers: [MonitoringController, MetricsController],
    providers: [PrismaService],
})
export class MonitoringModule {
    constructor() {
        collectDefaultMetrics();
    }
}
