import { PrismaService } from '../../prisma.service';
export interface ComplianceControl {
    id: string;
    framework: 'SOC2' | 'ISO27001' | 'PCI_DSS';
    controlId: string;
    controlName: string;
    description: string;
    evidenceSources: string[];
}
export interface EvidencePackItem {
    controlId: string;
    evidenceType: string;
    recordCount: number;
    sampleData?: any[];
    exportedAt: string;
}
export interface EvidencePack {
    generatedAt: string;
    framework: string;
    period: {
        from: string;
        to: string;
    };
    controls: EvidencePackItem[];
    metadata: {
        generatedBy: string;
        correlationId: string;
    };
}
export declare class ComplianceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getControls(framework?: string): ComplianceControl[];
    generateEvidencePack(framework: 'SOC2' | 'ISO27001' | 'PCI_DSS', period: {
        from: Date;
        to: Date;
    }, generatedBy: {
        id: string;
        name: string;
    }): Promise<EvidencePack>;
    private collectEvidenceForControl;
    private countRecordsInPeriod;
    private getSampleRecords;
    getComplianceDashboard(): Promise<{
        frameworkCoverage: Record<string, number>;
        recentAuditEvents: number;
        pendingApprovals: number;
        lastEvidenceExport?: Date;
    }>;
}
