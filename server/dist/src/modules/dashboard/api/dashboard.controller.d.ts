import { DashboardUseCase } from '../application/dashboard.usecase';
export declare class DashboardController {
    private readonly dashboardUseCase;
    constructor(dashboardUseCase: DashboardUseCase);
    getStats(): Promise<{
        userCount: number;
        tenantCount: number;
        branchCount: number;
        recentActivity: never[] | ({
            user: {
                email: string;
            } | null;
        } & {
            id: string;
            action: string;
            resource: string | null;
            module: string | null;
            userId: string | null;
            branchId: string | null;
            tenantId: string | null;
            details: import(".prisma/client").Prisma.JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
            createdAt: Date;
        })[];
    }>;
}
