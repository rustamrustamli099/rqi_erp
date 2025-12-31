import { EvidenceService } from './evidence.service';
import type { Response } from 'express';
import { PrismaService } from '../../prisma.service';
export declare class ComplianceController {
    private evidenceService;
    private prisma;
    constructor(evidenceService: EvidenceService, prisma: PrismaService);
    exportEvidence(type: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getControls(framework?: string): {
        id: string;
        framework: string;
        controlId: string;
        name: string;
    }[];
    getFrameworks(): ({
        id: string;
        name: string;
        controlCount: number;
        coming?: undefined;
    } | {
        id: string;
        name: string;
        controlCount: number;
        coming: boolean;
    })[];
    getDashboard(): Promise<{
        auditEvents: number;
        pendingApprovals: number;
        activeRoles: number;
        frameworkCoverage: {
            SOC2: number;
            ISO27001: number;
        };
    }>;
    generateEvidencePack(body: {
        framework: string;
        from: string;
        to: string;
    }, req: any, res: Response): Promise<void>;
}
