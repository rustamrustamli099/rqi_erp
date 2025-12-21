import { HealthCheckService, PrismaHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../../prisma.service';
export declare class MonitoringController {
    private health;
    private prisma;
    private memory;
    private disk;
    private prismaService;
    constructor(health: HealthCheckService, prisma: PrismaHealthIndicator, memory: MemoryHealthIndicator, disk: DiskHealthIndicator, prismaService: PrismaService);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
