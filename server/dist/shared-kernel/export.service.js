"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const HIGH_RISK_ENTITIES = ['users', 'roles', 'audit_logs', 'permissions', 'billing'];
const HIGH_RISK_THRESHOLD = 1000;
let ExportService = class ExportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkExportApproval(request) {
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
    async logExportAudit(request, status) {
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
    generateCSV(data, columns) {
        const headers = columns.map(c => c.header).join(',');
        const rows = data.map(item => {
            return columns.map(col => {
                const value = this.getNestedValue(item, col.key);
                const transformed = col.transform ? col.transform(value) : value;
                const str = String(transformed ?? '');
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(',');
        });
        return [headers, ...rows].join('\n');
    }
    generateXLSX(data, columns, sheetName = 'Export') {
        const csv = this.generateCSV(data, columns);
        const tsv = csv.replace(/,/g, '\t');
        return Buffer.from(tsv, 'utf-8');
    }
    async generateExport(data, columns, request) {
        const approvalCheck = await this.checkExportApproval(request);
        if (approvalCheck.requiresApproval) {
            await this.logExportAudit(request, 'PENDING_APPROVAL');
            throw new common_1.ForbiddenException({
                message: 'Bu export təsdiq tələb edir',
                reason: approvalCheck.reason,
                requiresApproval: true
            });
        }
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
        const csv = this.generateCSV(data, columns);
        return {
            buffer: Buffer.from(csv, 'utf-8'),
            mimeType: 'text/csv',
            filename: `${baseFilename}.csv`
        };
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    generateCSVBuffer(data, columns) {
        const csv = this.generateCSV(data, columns);
        return Buffer.from(csv, 'utf-8');
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExportService);
//# sourceMappingURL=export.service.js.map