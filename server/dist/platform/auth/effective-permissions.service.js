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
var EffectivePermissionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EffectivePermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let EffectivePermissionsService = EffectivePermissionsService_1 = class EffectivePermissionsService {
    prisma;
    logger = new common_1.Logger(EffectivePermissionsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async computeEffectivePermissions(params) {
        const { userId, scopeType, scopeId } = params;
        this.logger.debug(`Computing permissions for User: ${userId}, Scope: ${scopeType}:${scopeId}`);
        const assignments = await this.prisma.userRole.findMany({
            where: {
                userId: userId,
                tenantId: scopeType === 'SYSTEM' ? null : scopeId
            },
            select: {
                roleId: true
            }
        });
        if (!assignments || assignments.length === 0) {
            return [];
        }
        const assignedRoleIds = assignments.map((a) => a.roleId);
        const effectiveRoleIds = await this.resolveRoleHierarchy(assignedRoleIds);
        const rolePermissions = await this.prisma.rolePermission.findMany({
            where: {
                roleId: { in: Array.from(effectiveRoleIds) }
            },
            select: {
                permission: {
                    select: {
                        slug: true
                    }
                }
            }
        });
        const uniqueSlugs = new Set();
        rolePermissions.forEach((rp) => {
            if (rp.permission?.slug) {
                uniqueSlugs.add(rp.permission.slug);
            }
        });
        const result = Array.from(uniqueSlugs).sort();
        this.logger.debug(`Computed ${result.length} unique permissions for User ${userId}`);
        return result;
    }
    async resolveRoleHierarchy(initialRoleIds) {
        const visited = new Set();
        const toVisit = [...initialRoleIds];
        const resolved = new Set();
        while (toVisit.length > 0) {
            const currentId = toVisit.pop();
            if (!currentId || visited.has(currentId)) {
                continue;
            }
            visited.add(currentId);
            resolved.add(currentId);
            const children = await this.prisma.compositeRole.findMany({
                where: {
                    parentRoleId: currentId
                },
                select: {
                    childRoleId: true
                }
            });
            if (children && children.length > 0) {
                children.forEach((c) => {
                    if (!visited.has(c.childRoleId)) {
                        toVisit.push(c.childRoleId);
                    }
                });
            }
        }
        return resolved;
    }
};
exports.EffectivePermissionsService = EffectivePermissionsService;
exports.EffectivePermissionsService = EffectivePermissionsService = EffectivePermissionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EffectivePermissionsService);
//# sourceMappingURL=effective-permissions.service.js.map