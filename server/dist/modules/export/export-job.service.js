"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportJobService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const ExcelJS = __importStar(require("exceljs"));
const HIGH_RISK_DATASETS = ['USERS', 'ROLES', 'AUDIT', 'PERMISSIONS', 'TENANTS'];
const HIGH_RISK_THRESHOLD = 1000;
let ExportJobService = class ExportJobService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createExportJob(dto) {
        const riskLevel = this.calculateRiskLevel(dto.datasetKey, dto.filterSnapshot);
        const requiresApproval = riskLevel === 'HIGH';
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
        await this.processExportJob(job.id, dto.columns);
        return { job, requiresApproval: false };
    }
    async processExportJob(jobId, columns) {
        const job = await this.prisma.exportJob.findUnique({ where: { id: jobId } });
        if (!job)
            throw new common_1.NotFoundException('Export job not found');
        await this.prisma.exportJob.update({
            where: { id: jobId },
            data: { status: 'RUNNING' }
        });
        try {
            const data = await this.fetchDataset(job.datasetKey, job.filterSnapshot);
            const buffer = await this.generateXLSX(data, columns, job.datasetKey);
            const fileName = `export_${job.datasetKey.toLowerCase()}_${Date.now()}.xlsx`;
            const outputFileKey = `exports/${fileName}`;
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
        }
        catch (error) {
            await this.prisma.exportJob.update({
                where: { id: jobId },
                data: {
                    status: 'FAILED',
                    errorMessage: error.message
                }
            });
        }
    }
    async generateXLSX(data, columns, sheetName) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);
        worksheet.columns = columns.map(col => ({
            header: col.header,
            key: col.key,
            width: col.width || 20
        }));
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        for (const item of data) {
            const row = {};
            for (const col of columns) {
                const value = this.getNestedValue(item, col.key);
                row[col.key] = col.transform ? col.transform(value) : value;
            }
            worksheet.addRow(row);
        }
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    calculateRiskLevel(datasetKey, filterSnapshot) {
        if (HIGH_RISK_DATASETS.includes(datasetKey.toUpperCase())) {
            return 'HIGH';
        }
        if (!filterSnapshot?.search && !filterSnapshot?.filters) {
            return 'MEDIUM';
        }
        return 'LOW';
    }
    async fetchDataset(datasetKey, filterSnapshot) {
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
                    take: 10000
                });
            case 'APPROVALS':
                return this.prisma.approvalRequest.findMany({
                    where,
                    orderBy: { createdAt: 'desc' }
                });
            default:
                throw new common_1.NotFoundException(`Unknown dataset: ${datasetKey}`);
        }
    }
    buildWhereClause(filterSnapshot) {
        if (!filterSnapshot)
            return {};
        const where = {};
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
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    async getJobStatus(jobId) {
        const job = await this.prisma.exportJob.findUnique({ where: { id: jobId } });
        if (!job)
            throw new common_1.NotFoundException('Export job not found');
        return job;
    }
    async getUserExportJobs(userId, limit = 20) {
        return this.prisma.exportJob.findMany({
            where: { requestedByUserId: userId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }
};
exports.ExportJobService = ExportJobService;
exports.ExportJobService = ExportJobService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExportJobService);
//# sourceMappingURL=export-job.service.js.map