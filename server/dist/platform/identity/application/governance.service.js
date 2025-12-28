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
var GovernanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma.service");
const sod_rules_1 = require("../domain/sod-rules");
const risk_scoring_1 = require("../domain/risk-scoring");
let GovernanceService = GovernanceService_1 = class GovernanceService {
    prisma;
    logger = new common_1.Logger(GovernanceService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validatePermissions(permissionSlugs) {
        const sodResult = (0, sod_rules_1.validateSoD)(permissionSlugs);
        const hasSodConflicts = sodResult.conflicts.length > 0;
        const riskScore = (0, risk_scoring_1.calculateRiskScore)(permissionSlugs, hasSodConflicts);
        const needsApproval = (0, risk_scoring_1.requiresApproval)(riskScore);
        const canProceed = sodResult.criticalCount === 0;
        let blockedReason;
        if (!canProceed) {
            blockedReason = `${sodResult.criticalCount} critical SoD conflict(s) detected. These must be resolved before saving.`;
        }
        return {
            sodResult,
            riskScore,
            requiresApproval: needsApproval,
            canProceed,
            blockedReason
        };
    }
    async createApprovalRequest(dto) {
        this.logger.log(`Creating approval request for ${dto.entityType}:${dto.entityId}`);
        if (dto.entityType === 'ROLE' && (dto.action === 'CREATE' || dto.action === 'UPDATE')) {
            const request = await this.prisma.roleChangeRequest.create({
                data: {
                    roleId: dto.entityId,
                    requestedBy: dto.requestedById,
                    status: 'PENDING',
                    diffJson: dto.changes || {},
                    reason: `Risk score: ${dto.riskScore || 'N/A'}`
                }
            });
            await this.prisma.role.update({
                where: { id: dto.entityId },
                data: { status: 'PENDING_APPROVAL' }
            });
            await this.logAudit({
                action: 'APPROVAL_REQUESTED',
                resource: 'ROLE',
                resourceId: dto.entityId,
                userId: dto.requestedById,
                details: {
                    requestId: request.id,
                    action: dto.action,
                    riskScore: dto.riskScore,
                    riskLevel: dto.riskLevel
                }
            });
            return request;
        }
        throw new common_1.BadRequestException(`Approval for ${dto.entityType} not yet implemented`);
    }
    async approveRequest(requestId, approverId, comment) {
        const request = await this.prisma.roleChangeRequest.findUnique({
            where: { id: requestId },
            include: { role: true }
        });
        if (!request) {
            throw new common_1.BadRequestException('Approval request not found');
        }
        if (request.status !== 'PENDING') {
            throw new common_1.BadRequestException('Request is not pending');
        }
        if (request.requestedBy === approverId) {
            throw new common_1.BadRequestException('You cannot approve your own request (4-eyes principle)');
        }
        await this.prisma.roleChangeRequest.update({
            where: { id: requestId },
            data: {
                status: 'APPROVED',
                approvedBy: approverId,
                reason: comment
            }
        });
        await this.prisma.role.update({
            where: { id: request.roleId },
            data: {
                status: 'ACTIVE',
                approverId: approverId,
                approvalNote: comment
            }
        });
        await this.logAudit({
            action: 'APPROVED',
            resource: 'ROLE',
            resourceId: request.roleId,
            userId: approverId,
            details: {
                requestId,
                comment
            }
        });
        return { success: true };
    }
    async rejectRequest(requestId, rejecterId, reason) {
        if (!reason || reason.trim().length === 0) {
            throw new common_1.BadRequestException('Rejection reason is required');
        }
        const request = await this.prisma.roleChangeRequest.findUnique({
            where: { id: requestId },
            include: { role: true }
        });
        if (!request) {
            throw new common_1.BadRequestException('Approval request not found');
        }
        if (request.status !== 'PENDING') {
            throw new common_1.BadRequestException('Request is not pending');
        }
        await this.prisma.roleChangeRequest.update({
            where: { id: requestId },
            data: {
                status: 'REJECTED',
                approvedBy: rejecterId,
                reason
            }
        });
        await this.prisma.role.update({
            where: { id: request.roleId },
            data: {
                status: 'REJECTED',
                approvalNote: reason
            }
        });
        await this.logAudit({
            action: 'REJECTED',
            resource: 'ROLE',
            resourceId: request.roleId,
            userId: rejecterId,
            details: {
                requestId,
                reason
            }
        });
        return { success: true };
    }
    async getPendingApprovals(userId) {
        const requests = await this.prisma.roleChangeRequest.findMany({
            where: {
                status: 'PENDING',
                requestedBy: { not: userId }
            },
            include: {
                role: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return requests.map(r => ({
            id: r.id,
            entityType: 'ROLE',
            entityId: r.roleId,
            entityName: r.role.name,
            action: 'UPDATE',
            status: r.status,
            requestedBy: r.requestedBy,
            requestedAt: r.createdAt,
            changes: r.diffJson
        }));
    }
    async logAudit(data) {
        await this.prisma.auditLog.create({
            data: {
                action: data.action,
                resource: data.resource,
                module: 'GOVERNANCE',
                userId: data.userId,
                details: {
                    resourceId: data.resourceId,
                    ...data.details
                }
            }
        });
    }
};
exports.GovernanceService = GovernanceService;
exports.GovernanceService = GovernanceService = GovernanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GovernanceService);
//# sourceMappingURL=governance.service.js.map