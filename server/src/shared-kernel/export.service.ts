/**
 * SAP-Grade Export Service
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * CSV/XLSX export funksionallığı.
 * Filters, search, sorting-ə riayət edir.
 * High-risk exports üçün approval tələb edir.
 * Audit log yazır.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Injectable, ForbiddenException } from '@nestjs/common';
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
    columns: string[]; // Column keys to include
    selectedIds?: string[]; // For SELECTED scope
}

export interface ExportRequest {
    entityType: string;
    userId: string;
    userName?: string;
    options: ExportOptions;
    totalRecords: number;
    filters?: Record<string, any>;
}

// High-risk entity types that require approval for export
const HIGH_RISK_ENTITIES = ['users', 'roles', 'audit_logs', 'permissions', 'billing'];
const HIGH_RISK_THRESHOLD = 1000; // Records over this require approval

@Injectable()
export class ExportService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Check if export requires approval
     */
    async checkExportApproval(request: ExportRequest): Promise<{
        requiresApproval: boolean;
        reason?: string;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    }> {
        const isHighRiskEntity = HIGH_RISK_ENTITIES.includes(request.entityType.toLowerCase());
        const isLargeExport = request.totalRecords > HIGH_RISK_THRESHOLD;

        if (isHighRiskEntity && isLargeExport) {
            return {
                requiresApproval: true,
                reason: `High-risk entity (${request.entityType}) with ${request.totalRecords} records requires approval`,
                riskLevel: 'HIGH'
            };
        }

        if (isHighRiskEntity) {
            return {
                requiresApproval: false,
                riskLevel: 'MEDIUM'
            };
        }

        if (isLargeExport) {
            return {
                requiresApproval: false,
                riskLevel: 'MEDIUM'
            };
        }

        return {
            requiresApproval: false,
            riskLevel: 'LOW'
        };
    }

    /**
     * Log export action for audit
     */
    async logExportAudit(request: ExportRequest, status: 'SUCCESS' | 'DENIED' | 'PENDING_APPROVAL') {
        await this.prisma.auditLog.create({
            data: {
                action: 'EXPORT',
                resource: request.entityType,
                module: 'EXPORT_ENGINE',
                userId: request.userId,
                details: {
                    format: request.options.format,
                    scope: request.options.scope,
                    totalRecords: request.totalRecords,
                    status,
                    filters: request.filters,
                    columnsExported: request.options.columns.length
                }
            }
        });
    }

    /**
     * Generate CSV from data
     */
    generateCSV<T extends Record<string, any>>(
        data: T[],
        columns: ExportColumn[]
    ): string {
        const headers = columns.map(c => c.header).join(',');
        const rows = data.map(item => {
            return columns.map(col => {
                const value = this.getNestedValue(item, col.key);
                const transformed = col.transform ? col.transform(value) : value;
                // Escape quotes and wrap in quotes if contains comma
                const str = String(transformed ?? '');
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(',');
        });

        return [headers, ...rows].join('\n');
    }

    /**
     * Generate XLSX from data (simple implementation)
     * For full XLSX support, use 'xlsx' or 'exceljs' library
     */
    generateXLSX<T extends Record<string, any>>(
        data: T[],
        columns: ExportColumn[],
        sheetName: string = 'Export'
    ): Buffer {
        // For now, return CSV with .xlsx extension hint
        // In production, integrate 'exceljs' for proper XLSX
        const csv = this.generateCSV(data, columns);

        // Tab-separated for basic Excel compatibility
        const tsv = csv.replace(/,/g, '\t');
        return Buffer.from(tsv, 'utf-8');
    }

    /**
     * Generate export buffer based on format
     */
    async generateExport<T extends Record<string, any>>(
        data: T[],
        columns: ExportColumn[],
        request: ExportRequest
    ): Promise<{ buffer: Buffer; mimeType: string; filename: string }> {
        // Check approval requirement
        const approvalCheck = await this.checkExportApproval(request);

        if (approvalCheck.requiresApproval) {
            await this.logExportAudit(request, 'PENDING_APPROVAL');
            throw new ForbiddenException({
                message: 'Bu export təsdiq tələb edir',
                reason: approvalCheck.reason,
                requiresApproval: true
            });
        }

        // Log successful export
        await this.logExportAudit(request, 'SUCCESS');

        const timestamp = new Date().toISOString().split('T')[0];
        const baseFilename = `${request.entityType}_export_${timestamp}`;

        if (request.options.format === 'XLSX') {
            const buffer = this.generateXLSX(data, columns);
            return {
                buffer,
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                filename: `${baseFilename}.xlsx`
            };
        }

        // Default to CSV
        const csv = this.generateCSV(data, columns);
        return {
            buffer: Buffer.from(csv, 'utf-8'),
            mimeType: 'text/csv',
            filename: `${baseFilename}.csv`
        };
    }

    /**
     * Get nested value from object using dot notation
     */
    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Generate CSV as Buffer (for streaming response)
     */
    generateCSVBuffer<T extends Record<string, any>>(
        data: T[],
        columns: ExportColumn[]
    ): Buffer {
        const csv = this.generateCSV(data, columns);
        return Buffer.from(csv, 'utf-8');
    }
}
