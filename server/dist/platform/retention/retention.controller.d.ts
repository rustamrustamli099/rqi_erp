import { RetentionService } from './retention.service';
export declare class RetentionController {
    private readonly retentionService;
    constructor(retentionService: RetentionService);
    createPolicy(body: {
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
    runRetention(dryRun: boolean): Promise<any[]>;
}
