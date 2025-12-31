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
exports.ComplianceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const COMPLIANCE_CONTROLS = [
    {
        id: 'SOC2-CC6.1',
        framework: 'SOC2',
        controlId: 'CC6.1',
        controlName: 'Logical Access Security',
        description: 'Logical access to information assets is restricted',
        evidenceSources: ['roles', 'role_permissions', 'user_roles', 'audit_logs']
    },
    {
        id: 'SOC2-CC6.2',
        framework: 'SOC2',
        controlId: 'CC6.2',
        controlName: 'User Access Reviews',
        description: 'Periodic review of access rights',
        evidenceSources: ['role_change_requests', 'approval_requests', 'audit_logs']
    },
    {
        id: 'SOC2-CC6.3',
        framework: 'SOC2',
        controlId: 'CC6.3',
        controlName: 'Role-Based Access',
        description: 'Access based on job function using RBAC',
        evidenceSources: ['roles', 'role_permissions', 'permissions']
    },
    {
        id: 'SOC2-CC8.1',
        framework: 'SOC2',
        controlId: 'CC8.1',
        controlName: 'Change Authorization',
        description: 'Changes require authorized approval',
        evidenceSources: ['role_change_requests', 'approval_requests', 'audit_logs']
    },
    {
        id: 'SOC2-CC7.2',
        framework: 'SOC2',
        controlId: 'CC7.2',
        controlName: 'Security Monitoring',
        description: 'System activity is logged and monitored',
        evidenceSources: ['audit_logs', 'security_logs']
    },
    {
        id: 'ISO-A.9.2.1',
        framework: 'ISO27001',
        controlId: 'A.9.2.1',
        controlName: 'User Registration',
        description: 'User registration and de-registration process',
        evidenceSources: ['users', 'user_roles', 'audit_logs']
    },
    {
        id: 'ISO-A.9.2.2',
        framework: 'ISO27001',
        controlId: 'A.9.2.2',
        controlName: 'Privileged Access',
        description: 'Management of privileged access rights',
        evidenceSources: ['roles', 'role_permissions', 'role_change_requests']
    },
    {
        id: 'ISO-A.12.4.1',
        framework: 'ISO27001',
        controlId: 'A.12.4.1',
        controlName: 'Event Logging',
        description: 'Event logs recording user activities',
        evidenceSources: ['audit_logs', 'security_logs']
    }
];
let ComplianceService = class ComplianceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getControls(framework) {
        if (framework) {
            return COMPLIANCE_CONTROLS.filter(c => c.framework === framework);
        }
        return COMPLIANCE_CONTROLS;
    }
    async generateEvidencePack(framework, period, generatedBy) {
        const controls = this.getControls(framework);
        const evidenceItems = [];
        for (const control of controls) {
            const evidence = await this.collectEvidenceForControl(control, period);
            evidenceItems.push(evidence);
        }
        const correlationId = `EVID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await this.prisma.auditLog.create({
            data: {
                action: 'COMPLIANCE_EVIDENCE_EXPORT',
                resource: framework,
                module: 'COMPLIANCE',
                userId: generatedBy.id,
                details: {
                    framework,
                    period: { from: period.from.toISOString(), to: period.to.toISOString() },
                    controlsExported: evidenceItems.length,
                    correlationId
                }
            }
        });
        return {
            generatedAt: new Date().toISOString(),
            framework,
            period: {
                from: period.from.toISOString(),
                to: period.to.toISOString()
            },
            controls: evidenceItems,
            metadata: {
                generatedBy: generatedBy.name,
                correlationId
            }
        };
    }
    async collectEvidenceForControl(control, period) {
        let recordCount = 0;
        const sampleData = [];
        for (const source of control.evidenceSources) {
            try {
                const count = await this.countRecordsInPeriod(source, period);
                recordCount += count;
                if (sampleData.length < 5) {
                    const samples = await this.getSampleRecords(source, period, 5 - sampleData.length);
                    sampleData.push(...samples);
                }
            }
            catch (err) {
                console.warn(`Failed to collect evidence from ${source}:`, err);
            }
        }
        return {
            controlId: control.controlId,
            evidenceType: control.controlName,
            recordCount,
            sampleData: sampleData.slice(0, 5),
            exportedAt: new Date().toISOString()
        };
    }
    async countRecordsInPeriod(source, period) {
        const tableMap = {
            'audit_logs': this.prisma.auditLog,
            'security_logs': this.prisma.securityLog,
            'roles': this.prisma.role,
            'role_permissions': this.prisma.rolePermission,
            'users': this.prisma.user,
            'user_roles': this.prisma.userRole,
            'permissions': this.prisma.permission,
            'role_change_requests': this.prisma.roleChangeRequest,
            'approval_requests': this.prisma.approvalRequest
        };
        const model = tableMap[source];
        if (!model)
            return 0;
        const hasCreatedAt = ['audit_logs', 'security_logs', 'role_change_requests', 'approval_requests'].includes(source);
        if (hasCreatedAt) {
            return model.count({
                where: {
                    createdAt: {
                        gte: period.from,
                        lte: period.to
                    }
                }
            });
        }
        return model.count();
    }
    async getSampleRecords(source, period, limit) {
        const tableMap = {
            'audit_logs': this.prisma.auditLog,
            'security_logs': this.prisma.securityLog,
            'roles': this.prisma.role,
            'role_change_requests': this.prisma.roleChangeRequest,
            'approval_requests': this.prisma.approvalRequest
        };
        const model = tableMap[source];
        if (!model)
            return [];
        try {
            return await model.findMany({
                take: limit,
                orderBy: { createdAt: 'desc' },
                where: {
                    createdAt: {
                        gte: period.from,
                        lte: period.to
                    }
                }
            });
        }
        catch {
            return await model.findMany({ take: limit });
        }
    }
    async getComplianceDashboard() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [recentAuditEvents, pendingApprovals] = await Promise.all([
            this.prisma.auditLog.count({
                where: { createdAt: { gte: thirtyDaysAgo } }
            }),
            this.prisma.approvalRequest.count({
                where: { status: { in: ['PENDING', 'IN_PROGRESS'] } }
            })
        ]);
        const frameworkCoverage = {};
        for (const framework of ['SOC2', 'ISO27001', 'PCI_DSS']) {
            const controls = this.getControls(framework);
            frameworkCoverage[framework] = controls.length;
        }
        return {
            frameworkCoverage,
            recentAuditEvents,
            pendingApprovals
        };
    }
};
exports.ComplianceService = ComplianceService;
exports.ComplianceService = ComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ComplianceService);
//# sourceMappingURL=compliance.service.js.map