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
exports.RequirePermissions = exports.PermissionsGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../prisma.service");
const permission_cache_service_1 = require("./permission-cache.service");
const audit_service_1 = require("../../system/audit/audit.service");
let PermissionsGuard = class PermissionsGuard {
    reflector;
    prisma;
    permissionCache;
    auditService;
    constructor(reflector, prisma, permissionCache, auditService) {
        this.reflector = reflector;
        this.prisma = prisma;
        this.permissionCache = permissionCache;
        this.auditService = auditService;
    }
    async canActivate(context) {
        const requiredPermissions = this.reflector.get('permissions', context.getHandler());
        if (!requiredPermissions) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user)
            return false;
        const auditContext = {
            userId: user.sub || user.userId,
            tenantId: user.tenantId,
            branchId: user.branchId || null,
            module: 'ACCESS_CONTROL',
            method: request.method,
            endpoint: request.url,
            action: 'CHECK_PERMISSION',
            details: { required: requiredPermissions }
        };
        try {
            const userRole = user.role;
            const scope = user.tenantId ? 'TENANT' : 'SYSTEM';
            let userPermissionSlugs = await this.permissionCache.getPermissions(user.sub, user.tenantId, scope);
            if (!userPermissionSlugs) {
                const userWithRole = await this.prisma.user.findUnique({
                    where: { id: user.sub },
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: { permission: true }
                                }
                            }
                        }
                    }
                });
                if (!userWithRole || !userWithRole.role) {
                    await this.auditService.logAction({ ...auditContext, action: 'ACCESS_DENIED_NO_ROLE' });
                    return false;
                }
                const dbPermissions = [];
                if (userWithRole.role.permissions) {
                    userWithRole.role.permissions.forEach(rp => {
                        if (rp.permission)
                            dbPermissions.push(rp.permission.slug);
                    });
                }
                userPermissionSlugs = dbPermissions;
                await this.permissionCache.setPermissions(user.sub, userPermissionSlugs, user.tenantId, scope);
            }
            const hasPermission = requiredPermissions.some(permission => userPermissionSlugs.includes(permission));
            if (!hasPermission) {
                await this.auditService.logAction({ ...auditContext, action: 'ACCESS_DENIED', details: { ...auditContext.details, reason: 'Insufficient Permissions' } });
                throw new common_1.ForbiddenException('Insufficient Permissions');
            }
            await this.auditService.logAction({ ...auditContext, action: 'ACCESS_GRANTED' });
            return true;
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException)
                throw error;
            await this.auditService.logAction({ ...auditContext, action: 'ACCESS_ERROR', details: { error: error.message } });
            return false;
        }
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService,
        permission_cache_service_1.PermissionCacheService,
        audit_service_1.AuditService])
], PermissionsGuard);
const RequirePermissions = (...permissions) => {
    return (target, key, descriptor) => {
        Reflect.defineMetadata('permissions', permissions, descriptor.value);
        return descriptor;
    };
};
exports.RequirePermissions = RequirePermissions;
//# sourceMappingURL=permissions.guard.js.map