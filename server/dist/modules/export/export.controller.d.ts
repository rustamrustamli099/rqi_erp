import { ExportJobService } from './export-job.service';
import type { Response } from 'express';
export declare class ExportController {
    private readonly exportJobService;
    constructor(exportJobService: ExportJobService);
    createExportJob(body: {
        datasetKey: string;
        filterSnapshot?: any;
        columns: any[];
    }, req: any): Promise<{
        job: any;
        requiresApproval: boolean;
        message?: string;
    }>;
    getJobStatus(id: string): Promise<{
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
    getMyJobs(req: any, limit?: string): Promise<{
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
    downloadExport(id: string, req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
