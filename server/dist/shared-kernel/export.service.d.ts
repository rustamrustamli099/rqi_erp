import { PrismaService } from '../prisma.service';
export interface ExportColumn {
    key: string;
    header: string;
    width?: number;
    transform?: (value: any) => string;
}
export interface ExportOptions {
    format: 'CSV' | 'XLSX';
    scope: 'CURRENT_PAGE' | 'ALL_FILTERED' | 'SELECTED';
    columns: string[];
    selectedIds?: string[];
}
export interface ExportRequest {
    entityType: string;
    userId: string;
    userName?: string;
    options: ExportOptions;
    totalRecords: number;
    filters?: Record<string, any>;
}
export declare class ExportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    checkExportApproval(request: ExportRequest): Promise<{
        requiresApproval: boolean;
        reason?: string;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    }>;
    logExportAudit(request: ExportRequest, status: 'SUCCESS' | 'DENIED' | 'PENDING_APPROVAL'): Promise<void>;
    generateCSV<T extends Record<string, any>>(data: T[], columns: ExportColumn[]): string;
    generateXLSX<T extends Record<string, any>>(data: T[], columns: ExportColumn[], sheetName?: string): Buffer;
    generateExport<T extends Record<string, any>>(data: T[], columns: ExportColumn[], request: ExportRequest): Promise<{
        buffer: Buffer;
        mimeType: string;
        filename: string;
    }>;
    private getNestedValue;
    generateCSVBuffer<T extends Record<string, any>>(data: T[], columns: ExportColumn[]): Buffer;
}
