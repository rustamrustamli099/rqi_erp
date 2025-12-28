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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../platform/auth/jwt-auth.guard");
const export_job_service_1 = require("./export-job.service");
let ExportController = class ExportController {
    exportJobService;
    constructor(exportJobService) {
        this.exportJobService = exportJobService;
    }
    async createExportJob(body, req) {
        const result = await this.exportJobService.createExportJob({
            datasetKey: body.datasetKey,
            filterSnapshot: body.filterSnapshot,
            columns: body.columns,
            requestedByUserId: req.user.id,
            requestedByName: req.user.fullName || req.user.email
        });
        return result;
    }
    async getJobStatus(id) {
        return this.exportJobService.getJobStatus(id);
    }
    async getMyJobs(req, limit) {
        return this.exportJobService.getUserExportJobs(req.user.id, limit ? parseInt(limit) : 20);
    }
    async downloadExport(id, req, res) {
        const job = await this.exportJobService.getJobStatus(id);
        if (!job)
            throw new common_1.NotFoundException('Export job not found');
        if (job.status !== 'COMPLETED') {
            return res.status(400).json({ error: 'Export not ready' });
        }
        res.setHeader('Content-Type', job.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${job.fileName}"`);
        res.send(Buffer.from('XLSX data would be here'));
    }
};
exports.ExportController = ExportController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create export job' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "createExportJob", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get export job status' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "getJobStatus", null);
__decorate([
    (0, common_1.Get)('my-jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user export jobs' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "getMyJobs", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Download export file' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "downloadExport", null);
exports.ExportController = ExportController = __decorate([
    (0, swagger_1.ApiTags)('Export'),
    (0, common_1.Controller)('exports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [export_job_service_1.ExportJobService])
], ExportController);
//# sourceMappingURL=export.controller.js.map