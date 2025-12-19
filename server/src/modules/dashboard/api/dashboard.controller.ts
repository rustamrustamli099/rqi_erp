import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardUseCase } from '../application/dashboard.usecase';
import { JwtAuthGuard } from '../../../platform/auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(private readonly dashboardUseCase: DashboardUseCase) { }

    @Get('stats')
    getStats() {
        return this.dashboardUseCase.getStats();
    }
}
