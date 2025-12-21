export declare class SystemService {
    getSystemMetrics(): Promise<{
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
    }>;
    getDatabaseStats(): Promise<{
        activeConnections: number;
        poolUtilization: number;
    }>;
    getRedisStats(): Promise<{
        hitRatio: string;
        memoryUsed: string;
        connectedClients: number;
    }>;
    clearCache(): Promise<{
        success: boolean;
        message: string;
    }>;
    reloadServices(): Promise<{
        success: boolean;
        message: string;
    }>;
    killSessions(): Promise<{
        success: boolean;
        message: string;
    }>;
}
