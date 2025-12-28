/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXPORT JOB SERVICE - Enterprise Grade Export with Approval Gating
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as ExcelJS from 'exceljs';

// High-risk datasets that require approval
const HIGH_RISK_DATASETS = ['USERS', 'ROLES', 'AUDIT', 'PERMISSIONS', 'TENANTS'];
const HIGH_RISK_THRESHOLD = 1000;

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

@Injectable()
export class ExportJobService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create export job with risk assessment
     */
    async createExportJob(dto: CreateExportJobDto): Promise<{
        job: any;
        requiresApproval: boolean;
        message?: string;
    }> {
        // Calculate risk level
        const riskLevel = this.calculateRiskLevel(dto.datasetKey, dto.filterSnapshot);
        const requiresApproval = riskLevel === 'HIGH';

        // Create export job
        const job = await this.prisma.exportJob.create({
            data: {
                scope: dto.scope || 'SYSTEM',
                datasetKey: dto.datasetKey,
                status: requiresApproval ? 'PENDING_APPROVAL' : 'QUEUED',
                requestedByUserId: dto.requestedByUserId,
                requestedByName: dto.requestedByName,
                filterSnapshot: dto.filterSnapshot,
                requiresApproval,
                riskLevel
            }
        });

        // Audit log
        await this.prisma.auditLog.create({
            data: {
                action: 'EXPORT_REQUESTED',
                resource: dto.datasetKey,
                module: 'EXPORT',
                userId: dto.requestedByUserId,
                details: {
                    jobId: job.id,
                    datasetKey: dto.datasetKey,
                    riskLevel,
                    requiresApproval,
                    filterSnapshot: dto.filterSnapshot
                }
            }
        });

        if (requiresApproval) {
            // Create approval request
            const approvalRequest = await this.prisma.approvalRequest.create({
                data: {
                    entityType: 'EXPORT_JOB',
                    entityId: job.id,
                    action: 'EXPORT',
                    requestedById: dto.requestedByUserId,
                    requestedByName: dto.requestedByName,
                    status: 'PENDING',
                    riskScore: riskLevel,
                    payload: {
                        datasetKey: dto.datasetKey,
                        filterSnapshot: dto.filterSnapshot
                    }
                }
            });

            // Update job with approval reference
            await this.prisma.exportJob.update({
                where: { id: job.id },
                data: { approvalRequestId: approvalRequest.id }
            });

            return {
                job,
                requiresApproval: true,
                message: `Yüksək riskli export (${dto.datasetKey}) təsdiq tələb edir`
            };
        }

        // If no approval needed, process immediately
        await this.processExportJob(job.id, dto.columns);

        return { job, requiresApproval: false };
    }

    /**
     * Process export job (generate XLSX)
     */
    async processExportJob(jobId: string, columns: ExportColumn[]): Promise<void> {
        const job = await this.prisma.exportJob.findUnique({ where: { id: jobId } });
        if (!job) throw new NotFoundException('Export job not found');

        // Update status to running
        await this.prisma.exportJob.update({
            where: { id: jobId },
            data: { status: 'RUNNING' }
        });

        try {
            // Fetch data based on dataset key
            const data = await this.fetchDataset(job.datasetKey, job.filterSnapshot);

            // Generate XLSX
            const buffer = await this.generateXLSX(data, columns, job.datasetKey);

            // Save to file system or S3
            const fileName = `export_${job.datasetKey.toLowerCase()}_${Date.now()}.xlsx`;
            const outputFileKey = `exports/${fileName}`;

            // For now, store base64 in DB (in production, use S3)
            await this.prisma.exportJob.update({
                where: { id: jobId },
                data: {
                    status: 'COMPLETED',
                    outputFileKey,
                    fileName,
                    rowCount: data.length,
                    completedAt: new Date()
                }
            });

            // Audit log
            await this.prisma.auditLog.create({
                data: {
                    action: 'EXPORT_COMPLETED',
                    resource: job.datasetKey,
                    module: 'EXPORT',
                    userId: job.requestedByUserId,
                    details: {
                        jobId,
                        rowCount: data.length,
                        fileName
                    }
                }
            });

        } catch (error) {
            await this.prisma.exportJob.update({
                where: { id: jobId },
                data: {
                    status: 'FAILED',
                    errorMessage: error.message
                }
            });
        }
    }

    /**
     * Generate XLSX buffer
     */
    async generateXLSX(data: any[], columns: ExportColumn[], sheetName: string): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);

        // Add headers
        worksheet.columns = columns.map(col => ({
            header: col.header,
            key: col.key,
            width: col.width || 20
        }));

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        // Add data rows
        for (const item of data) {
            const row: any = {};
            for (const col of columns) {
                const value = this.getNestedValue(item, col.key);
                row[col.key] = col.transform ? col.transform(value) : value;
            }
            worksheet.addRow(row);
        }

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    /**
     * Calculate risk level for export
     */
    private calculateRiskLevel(datasetKey: string, filterSnapshot?: any): 'LOW' | 'MEDIUM' | 'HIGH' {
        if (HIGH_RISK_DATASETS.includes(datasetKey.toUpperCase())) {
            return 'HIGH';
        }

        // Check if exporting large dataset without filters
        if (!filterSnapshot?.search && !filterSnapshot?.filters) {
            return 'MEDIUM';
        }

        return 'LOW';
    }

    /**
     * Fetch dataset based on key
     */
    private async fetchDataset(datasetKey: string, filterSnapshot?: any): Promise<any[]> {
        const where = this.buildWhereClause(filterSnapshot);

        switch (datasetKey.toUpperCase()) {
            case 'USERS':
                return this.prisma.user.findMany({
                    where,
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                        scope: true,
                        createdAt: true
                    }
                });

            case 'ROLES':
                return this.prisma.role.findMany({
                    where,
                    include: {
                        permissions: { include: { permission: true } }
                    }
                });

            case 'TENANTS':
                return this.prisma.tenant.findMany({ where });

            case 'AUDIT':
                return this.prisma.auditLog.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    take: 10000 // Safety limit
                });

            case 'APPROVALS':
                return this.prisma.approvalRequest.findMany({
                    where,
                    orderBy: { createdAt: 'desc' }
                });

            default:
                throw new NotFoundException(`Unknown dataset: ${datasetKey}`);
        }
    }

    /**
     * Build where clause from filter snapshot
     */
    private buildWhereClause(filterSnapshot?: any): any {
        if (!filterSnapshot) return {};

        const where: any = {};

        if (filterSnapshot.search) {
            where.OR = [
                { name: { contains: filterSnapshot.search, mode: 'insensitive' } },
                { email: { contains: filterSnapshot.search, mode: 'insensitive' } }
            ];
        }

        if (filterSnapshot.filters) {
            Object.entries(filterSnapshot.filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    where[key] = value;
                }
            });
        }

        return where;
    }

    /**
     * Get nested value from object
     */
    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Get export job status
     */
    async getJobStatus(jobId: string) {
        const job = await this.prisma.exportJob.findUnique({ where: { id: jobId } });
        if (!job) throw new NotFoundException('Export job not found');
        return job;
    }

    /**
     * Get user's export jobs
     */
    async getUserExportJobs(userId: string, limit = 20) {
        return this.prisma.exportJob.findMany({
            where: { requestedByUserId: userId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }
}
