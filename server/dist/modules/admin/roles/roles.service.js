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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma.service");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../../../system/audit/audit.service");
let RolesService = class RolesService {
    prisma;
    auditService;
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async create(dto, userId) {
        return this.prisma.role.create({
            data: {
                name: dto.name,
                description: dto.description,
                isSystem: false,
                status: client_1.RoleStatus.DRAFT,
            }
        });
    }
    async findAll() {
        return this.prisma.role.findMany({
            include: {
                permissions: true,
                _count: { select: { users: true } }
            }
        });
    }
    async findOne(id) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: { permissions: true }
        });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        return role;
    }
    async submitForApproval(id, userId) {
        const role = await this.findOne(id);
        if (role.status !== client_1.RoleStatus.DRAFT && role.status !== client_1.RoleStatus.REJECTED) {
            throw new common_1.BadRequestException('Only Draft or Rejected roles can be submitted');
        }
        const result = await this.prisma.role.update({
            where: { id },
            data: {
                status: client_1.RoleStatus.PENDING_APPROVAL,
                submittedById: userId
            }
        });
        await this.auditService.logAction({
            action: 'ROLE_SUBMITTED',
            resource: 'Role',
            details: { roleId: id },
            module: 'ACCESS_CONTROL',
            userId: 'SYSTEM',
        });
        return result;
    }
    async approve(id, approverId) {
        const role = await this.findOne(id);
        if (role.status !== client_1.RoleStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Role is not pending approval');
        }
        if (role.submittedById === approverId) {
            throw new common_1.ForbiddenException('You cannot approve your own role request (4-Eyes Principle violation)');
        }
        const result = await this.prisma.role.update({
            where: { id },
            data: {
                status: client_1.RoleStatus.ACTIVE,
                approverId,
                approvalNote: null
            }
        });
        await this.auditService.logAction({
            action: 'ROLE_APPROVED',
            resource: 'Role',
            details: { roleId: id, approverId },
            module: 'ACCESS_CONTROL',
            userId: approverId,
        });
        return result;
    }
    async reject(id, reason) {
        const role = await this.findOne(id);
        if (role.status !== client_1.RoleStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException('Role is not pending approval');
        }
        const result = await this.prisma.role.update({
            where: { id },
            data: {
                status: client_1.RoleStatus.REJECTED,
                approvalNote: reason
            }
        });
        await this.auditService.logAction({
            action: 'ROLE_REJECTED',
            resource: 'Role',
            details: { roleId: id, reason },
            module: 'ACCESS_CONTROL',
            userId: 'SYSTEM',
        });
        return result;
    }
    async update(id, dto) {
        const role = await this.findOne(id);
        const newStatus = role.status === client_1.RoleStatus.ACTIVE ? client_1.RoleStatus.DRAFT : role.status;
        return this.prisma.role.update({
            where: { id },
            data: {
                ...dto,
                status: newStatus
            }
        });
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], RolesService);
//# sourceMappingURL=roles.service.js.map