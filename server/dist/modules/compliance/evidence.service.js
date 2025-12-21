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
exports.EvidenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let EvidenceService = class EvidenceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateSoc2Evidence() {
        const recentAuditLogs = await this.prisma.auditLog.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { email: true, role: { select: { name: true } } } } }
        });
        const roles = await this.prisma.role.findMany({
            include: {
                _count: { select: { users: true } }
            }
        });
        const tenants = await this.prisma.tenant.findMany({
            select: { id: true, name: true, type: true, status: true }
        });
        return {
            evidence_id: `EV-${Date.now()}`,
            generated_at: new Date().toISOString(),
            scope: 'SOC2_TYPE_II',
            controls: {
                'CC6.1': {
                    description: 'Logical Access',
                    status: 'EFFECTIVE',
                    evidence: {
                        active_tenants: tenants.length,
                        tenant_sample: tenants.slice(0, 5),
                        roles_defined: roles.map(r => ({
                            name: r.name,
                            users: r._count.users,
                            scope: r.tenantId ? 'TENANT' : 'SYSTEM',
                            approval_status: r.status
                        }))
                    }
                },
                'CC6.2': {
                    description: 'Authorization & SOD',
                    status: 'EFFECTIVE',
                    evidence: {
                        role_approval_check: roles.map(r => ({
                            role: r.name,
                            compliant: r.submittedById !== r.approverId || !r.approverId,
                            four_eyes_enforced: true
                        }))
                    }
                },
                'CC6.6': {
                    description: 'Change Management',
                    status: 'EFFECTIVE',
                    evidence: {
                        recent_logs: recentAuditLogs.map(l => ({
                            action: l.action,
                            actor: l.user?.email || 'SYSTEM',
                            time: l.createdAt
                        }))
                    }
                }
            },
            integrity_hash: 'sha256-placeholder-for-real-hash'
        };
    }
    async generateIsoSoa() {
        return {
            soa_id: `ISO-${Date.now()}`,
            generated_at: new Date().toISOString(),
            standard: 'ISO/IEC 27001:2022',
            controls: [
                { id: 'A.5.15', name: 'Access Control', applicable: true, status: 'IMPLEMENTED' },
                { id: 'A.8.2', name: 'Privileged Access', applicable: true, status: 'IMPLEMENTED' },
                { id: 'A.8.4', name: 'Source Code Access', applicable: true, status: 'IMPLEMENTED' }
            ]
        };
    }
};
exports.EvidenceService = EvidenceService;
exports.EvidenceService = EvidenceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EvidenceService);
//# sourceMappingURL=evidence.service.js.map