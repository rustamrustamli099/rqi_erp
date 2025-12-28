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
exports.ComplianceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const evidence_service_1 = require("./evidence.service");
const jwt_auth_guard_1 = require("../../platform/auth/jwt-auth.guard");
const permissions_guard_1 = require("../../platform/auth/permissions.guard");
const prisma_service_1 = require("../../prisma.service");
const COMPLIANCE_CONTROLS = [
    { id: 'SOC2-CC6.1', framework: 'SOC2', controlId: 'CC6.1', name: 'Logical Access Security' },
    { id: 'SOC2-CC6.2', framework: 'SOC2', controlId: 'CC6.2', name: 'User Access Reviews' },
    { id: 'SOC2-CC6.3', framework: 'SOC2', controlId: 'CC6.3', name: 'Role-Based Access' },
    { id: 'SOC2-CC8.1', framework: 'SOC2', controlId: 'CC8.1', name: 'Change Authorization' },
    { id: 'SOC2-CC7.2', framework: 'SOC2', controlId: 'CC7.2', name: 'Security Monitoring' },
    { id: 'ISO-A.9.2.1', framework: 'ISO27001', controlId: 'A.9.2.1', name: 'User Registration' },
    { id: 'ISO-A.9.2.2', framework: 'ISO27001', controlId: 'A.9.2.2', name: 'Privileged Access' },
    { id: 'ISO-A.12.4.1', framework: 'ISO27001', controlId: 'A.12.4.1', name: 'Event Logging' },
];
let ComplianceController = class ComplianceController {
    evidenceService;
    prisma;
    constructor(evidenceService, prisma) {
        this.evidenceService = evidenceService;
        this.prisma = prisma;
    }
    async exportEvidence(type, res) {
        let data;
        if (type === 'soc2') {
            data = await this.evidenceService.generateSoc2Evidence();
        }
        else if (type === 'iso27001') {
            data = await this.evidenceService.generateIsoSoa();
        }
        else {
            throw new common_1.NotFoundException('Unsupported evidence type');
        }
        res.set({
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${type}_evidence_${Date.now()}.json"`,
        });
        return res.json(data);
    }
    getControls(framework) {
        if (framework) {
            return COMPLIANCE_CONTROLS.filter(c => c.framework === framework);
        }
        return COMPLIANCE_CONTROLS;
    }
    getFrameworks() {
        return [
            { id: 'SOC2', name: 'SOC 2 Type II', controlCount: 5 },
            { id: 'ISO27001', name: 'ISO 27001:2022', controlCount: 3 },
            { id: 'PCI_DSS', name: 'PCI DSS 4.0', controlCount: 0, coming: true }
        ];
    }
    async getDashboard() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [auditEvents, pendingApprovals, activeRoles] = await Promise.all([
            this.prisma.auditLog.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            this.prisma.approvalRequest.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
            this.prisma.role.count({ where: { status: 'ACTIVE' } })
        ]);
        return {
            auditEvents,
            pendingApprovals,
            activeRoles,
            frameworkCoverage: {
                SOC2: COMPLIANCE_CONTROLS.filter(c => c.framework === 'SOC2').length,
                ISO27001: COMPLIANCE_CONTROLS.filter(c => c.framework === 'ISO27001').length
            }
        };
    }
    async generateEvidencePack(body, req, res) {
        const period = { from: new Date(body.from), to: new Date(body.to) };
        const controls = COMPLIANCE_CONTROLS.filter(c => c.framework === body.framework);
        await this.prisma.auditLog.create({
            data: {
                action: 'COMPLIANCE_EVIDENCE_EXPORT',
                resource: body.framework,
                module: 'COMPLIANCE',
                userId: req.user?.id,
                details: { framework: body.framework, period, controlCount: controls.length }
            }
        });
        const evidence = body.framework === 'SOC2'
            ? await this.evidenceService.generateSoc2Evidence()
            : await this.evidenceService.generateIsoSoa();
        const pack = {
            generatedAt: new Date().toISOString(),
            framework: body.framework,
            period: { from: period.from.toISOString(), to: period.to.toISOString() },
            controls,
            evidence,
            metadata: { generatedBy: req.user?.email }
        };
        const filename = `evidence_pack_${body.framework}_${Date.now()}.json`;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(JSON.stringify(pack, null, 2));
    }
};
exports.ComplianceController = ComplianceController;
__decorate([
    (0, common_1.Get)('export/:type'),
    (0, swagger_1.ApiOperation)({ summary: 'Export evidence by type' }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "exportEvidence", null);
__decorate([
    (0, common_1.Get)('controls'),
    (0, swagger_1.ApiOperation)({ summary: 'Get compliance controls by framework' }),
    __param(0, (0, common_1.Query)('framework')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "getControls", null);
__decorate([
    (0, common_1.Get)('frameworks'),
    (0, swagger_1.ApiOperation)({ summary: 'Get supported compliance frameworks' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "getFrameworks", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get compliance dashboard statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Post)('evidence-pack'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate full evidence pack' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ComplianceController.prototype, "generateEvidencePack", null);
exports.ComplianceController = ComplianceController = __decorate([
    (0, swagger_1.ApiTags)('Compliance'),
    (0, common_1.Controller)('compliance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [evidence_service_1.EvidenceService,
        prisma_service_1.PrismaService])
], ComplianceController);
//# sourceMappingURL=compliance.controller.js.map