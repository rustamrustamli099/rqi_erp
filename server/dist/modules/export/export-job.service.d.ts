import { PrismaService } from '../../prisma.service';
export interface ExportColumn {
    key: string;
    header: string;
    width?: number;
    transform?: (value: any) => any;
}
export interface CreateExportJobDto {
    datasetKey: string;
    scope?: string;
    filterSnapshot?: any;
    columns: ExportColumn[];
    requestedByUserId: string;
    requestedByName?: string;
}
export declare class ExportJobService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createExportJob(dto: CreateExportJobDto): Promise<{
        job: any;
        requiresApproval: boolean;
        message?: string;
    }>;
    processExportJob(jobId: string, columns: ExportColumn[]): Promise<void>;
    generateXLSX(data: any[], columns: ExportColumn[], sheetName: string): Promise<Buffer>;
    private calculateRiskLevel;
    private fetchDataset;
    private buildWhereClause;
    private getNestedValue;
    getJobStatus(jobId: string): Promise<{
        id: string;
        scope: string;
        datasetKey: string;
        status: string;
        requestedByUserId: string;
        requestedByName: string | null;
        filterSnapshot: import(".prisma/client").Prisma.JsonValue | null;
        outputFileKey: string | null;
        fileName: string | null;
        mimeType: string;
        rowCount: number | null;
        requiresApproval: boolean;
        riskLevel: string;
        approvalRequestId: string | null;
        errorMessage: string | null;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
    }>;
    getUserExportJobs(userId: string, limit?: number): Promise<{
        id: string;
        scope: string;
        datasetKey: string;
        status: string;
        requestedByUserId: string;
        requestedByName: string | null;
        filterSnapshot: import(".prisma/client").Prisma.JsonValue | null;
        outputFileKey: string | null;
        fileName: string | null;
        mimeType: string;
        rowCount: number | null;
        requiresApproval: boolean;
        riskLevel: string;
        approvalRequestId: string | null;
        errorMessage: string | null;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
    }[]>;
}
