import { MaintenanceService } from './maintenance.service';
export declare class MaintenanceController {
    private readonly maintenanceService;
    constructor(maintenanceService: MaintenanceService);
    enable(message: string): Promise<{
        message: string;
    }>;
    disable(): Promise<{
        message: string;
    }>;
    status(): Promise<{
        isEnabled: boolean;
        message?: string;
    }>;
}
