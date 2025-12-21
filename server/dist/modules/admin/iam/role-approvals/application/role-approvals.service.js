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
exports.RoleApprovalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../prisma.service");
const audit_service_1 = require("../../../../../system/audit/audit.service");
const client_1 = require("@prisma/client");
let RoleApprovalsService = class RoleApprovalsService {
    prisma;
    auditService;
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async submitRequest(roleId, userId, diffJson = {}) {
        const role = await this.prisma.role.findUnique({ where: { id: roleId } });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        if (role.status === client_1.RoleStatus.ACTIVE) {
        }
        const request = await this.prisma.roleChangeRequest.create({
            data: {
                roleId: role.id,
                requestedBy: userId,
                status: 'PENDING',
                scope: role.tenantId ? 'TENANT' : 'SYSTEM',
                diffJson: diffJson,
            }
        });
        await this.prisma.role.update({
            where: { id: role.id },
            data: {
                status: client_1.RoleStatus.PENDING_APPROVAL,
                submittedById: userId
            }
        });
        await this.auditService.logAction({
            action: 'ROLE_CHANGE_REQUESTED',
            resource: 'Role',
            details: { requestId: request.id, roleId: role.id },
            module: 'IAM',
            userId: userId,
        });
        return request;
    }
    async approveRequest(requestId, approverId) {
        const request = await this.prisma.roleChangeRequest.findUnique({
            where: { id: requestId },
            include: { role: true }
        });
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        if (request.status !== 'PENDING') {
            throw new common_1.BadRequestException('Request is not pending');
        }
        if (request.requestedBy === approverId) {
            throw new common_1.ForbiddenException('Approver cannot be the same as Requestor (4-Eyes Violation)');
        }
        const updatedRequest = await this.prisma.roleChangeRequest.update({
            where: { id: requestId },
            data: {
                status: 'APPROVED',
                approvedBy: approverId
            }
        });
        await this.prisma.role.update({
            where: { id: request.roleId },
            data: {
                status: client_1.RoleStatus.ACTIVE,
                approverId: approverId
            }
        });
        await this.auditService.logAction({
            action: 'ROLE_CHANGE_APPROVED',
            resource: 'Role',
            details: { requestId: request.id, roleId: request.roleId },
            module: 'IAM',
            userId: approverId,
        });
        return updatedRequest;
    }
    async rejectRequest(requestId, reason, rejectorId) {
        const request = await this.prisma.roleChangeRequest.findUnique({ where: { id: requestId } });
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        const updatedRequest = await this.prisma.roleChangeRequest.update({
            where: { id: requestId },
            data: {
                status: 'REJECTED',
                reason: reason
            }
        });
        await this.prisma.role.update({
            where: { id: request.roleId },
            data: {
                status: client_1.RoleStatus.REJECTED,
                approvalNote: reason
            }
        });
        await this.auditService.logAction({
            action: 'ROLE_CHANGE_REJECTED',
            resource: 'Role',
            details: { requestId: request.id, reason },
            module: 'IAM',
            userId: rejectorId,
        });
        return updatedRequest;
    }
    async findAll(status) {
        return this.prisma.roleChangeRequest.findMany({
            where: status ? { status } : {},
            include: { role: true },
            orderBy: { createdAt: 'desc' }
        });
    }
};
exports.RoleApprovalsService = RoleApprovalsService;
exports.RoleApprovalsService = RoleApprovalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], RoleApprovalsService);
//# sourceMappingURL=role-approvals.service.js.map