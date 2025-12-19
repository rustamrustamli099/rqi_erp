import { CanActivate, ExecutionContext } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { Reflector } from '@nestjs/core';
export declare class MaintenanceGuard implements CanActivate {
    private readonly maintenanceService;
    private readonly reflector;
    constructor(maintenanceService: MaintenanceService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
