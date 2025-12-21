import { PrismaService } from '../../prisma.service';
export declare class RetentionService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createPolicy(data: {
        entity: string;
        days: number;
        action: string;
    }): Promise<{
        id: string;
        entity: string;
        days: number;
        action: string;
        isActive: boolean;
        lastRunAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getPolicies(): Promise<{
        id: string;
        entity: string;
        days: number;
        action: string;
        isActive: boolean;
        lastRunAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    deletePolicy(id: string): Promise<{
        id: string;
        entity: string;
        days: number;
        action: string;
        isActive: boolean;
        lastRunAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    executePolicy(dryRun?: boolean): Promise<any[]>;
}
