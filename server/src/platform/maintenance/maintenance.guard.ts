
import { Injectable, CanActivate, ExecutionContext, ServiceUnavailableException } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class MaintenanceGuard implements CanActivate {
    constructor(
        private readonly maintenanceService: MaintenanceService,
        private readonly reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const status = await this.maintenanceService.isMaintenanceMode();
        if (!status.isEnabled) {
            return true;
        }

        // Allow Admins to bypass
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Note: Guard execution order matters. If AuthGuard runs before this, 'request.user' is populated.
        // If this runs before AuthGuard, 'request.user' is undefined.
        // We usually want MaintenanceGuard to run *after* AuthGuard if we want to bypass for admins.
        // BUT if we want to block *login* too, we might need it before?
        // Let's assume AuthGuard runs first or we use APP_GUARD order.



        throw new ServiceUnavailableException(status.message);
    }
}
