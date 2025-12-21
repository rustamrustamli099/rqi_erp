import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardUseCase } from '../application/dashboard.usecase';
import { JwtAuthGuard } from '../../../platform/auth/jwt-auth.guard';
import { Permissions } from '../../../platform/auth/permissions.decorator';
import { PermissionRegistry } from '../../../platform/auth/permissions';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(private readonly dashboardUseCase: DashboardUseCase) { }

    @Get('stats')
    @Permissions(PermissionRegistry.DASHBOARD.VIEW)
    getStats() {
        return this.dashboardUseCase.getStats();
    }
}
