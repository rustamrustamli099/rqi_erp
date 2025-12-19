
import { Controller, Get, Post, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { SystemService } from './system.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
// import { Role } from '@prisma/client';

// TODO: Enable Guards after testing
@Controller('admin/system')
export class SystemController {
    constructor(private readonly systemService: SystemService) { }

    @Get('metrics')
    async getMetrics() {
        const sys = await this.systemService.getSystemMetrics();
        const db = await this.systemService.getDatabaseStats();
        const redis = await this.systemService.getRedisStats();

        return {
            system: sys,
            database: db,
            redis: redis
        };
    }

    @Post('cache/clear')
    async clearCache() {
        return this.systemService.clearCache();
    }

    @Post('services/reload')
    async reloadServices() {
        return this.systemService.reloadServices();
    }

    @Post('sessions/kill-all')
    async killAllSessions() {
        return this.systemService.killSessions();
    }
}
