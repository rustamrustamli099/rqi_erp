
import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    PrismaHealthIndicator,
    MemoryHealthIndicator,
    DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../../prisma.service';

@Controller('system/health')
export class MonitoringController {
    constructor(
        private health: HealthCheckService,
        private prisma: PrismaHealthIndicator,
        private memory: MemoryHealthIndicator,
        private disk: DiskHealthIndicator,
        private prismaService: PrismaService, // Inject for manual ping if needed or terminus wrapper
    ) { }

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            // Database Check
            () => this.prisma.pingCheck('database', this.prismaService),

            // Memory Check (Heap > 150MB is warning)
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),

            // Disk Storage (Threshold 90% full) -- commenting out for compatibility if path varies, or use basic
            // () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
        ]);
    }
}
