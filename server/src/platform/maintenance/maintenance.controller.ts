
import { Controller, Post, Body, Delete, Get, UseGuards } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../../platform/auth/jwt-auth.guard';
// import { RolesGuard } from '../../platform/auth/roles.guard'; // Assume we have one or use Permissions
import { Roles } from '../../platform/auth/roles.decorator';

@Controller('system/maintenance')
@UseGuards(JwtAuthGuard)
export class MaintenanceController {
    constructor(private readonly maintenanceService: MaintenanceService) { }

    @Post()
    @Roles('SuperAdmin', 'Owner') // Restrict to admins
    async enable(@Body('message') message: string) {
        await this.maintenanceService.enableMaintenance(message);
        return { message: 'Maintenance mode enabled' };
    }

    @Delete()
    @Roles('SuperAdmin', 'Owner')
    async disable() {
        await this.maintenanceService.disableMaintenance();
        return { message: 'Maintenance mode disabled' };
    }

    @Get()
    async status() {
        return this.maintenanceService.isMaintenanceMode();
    }
}
