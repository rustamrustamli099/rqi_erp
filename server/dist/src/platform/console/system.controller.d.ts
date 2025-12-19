import { SystemService } from './system.service';
export declare class SystemController {
    private readonly systemService;
    constructor(systemService: SystemService);
    getMetrics(): Promise<{
        system: {
            cpu: {
                usage: number;
                cores: number;
            };
            memory: {
                total: number;
                free: number;
                used: number;
                usagePercentage: number;
            };
            uptime: number;
            platform: NodeJS.Platform;
        };
        database: {
            activeConnections: number;
            poolUtilization: number;
        };
        redis: {
            hitRatio: string;
            memoryUsed: string;
            connectedClients: number;
        };
    }>;
    clearCache(): Promise<{
        success: boolean;
        message: string;
    }>;
    reloadServices(): Promise<{
        success: boolean;
        message: string;
    }>;
    killAllSessions(): Promise<{
        success: boolean;
        message: string;
    }>;
}
