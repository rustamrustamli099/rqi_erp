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
const cached_effective_permissions_service_1 = require("./cached-effective-permissions.service");
const audit_service_1 = require("../../system/audit/audit.service");
const decision_center_service_1 = require("../decision/decision-center.service");
let PermissionsGuard = class PermissionsGuard {
    reflector;
    prisma;
    effectivePermissionsService;
    auditService;
    decisionCenter;
    constructor(reflector, prisma, effectivePermissionsService, auditService, decisionCenter) {
        this.reflector = reflector;
        this.prisma = prisma;
        this.effectivePermissionsService = effectivePermissionsService;
        this.auditService = auditService;
        this.decisionCenter = decisionCenter;
    }
    async canActivate(context) {
        const requiredPermissions = this.reflector.get('permissions', context.getHandler());
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user)
            return false;
        const auditContext = {
            userId: user.userId || user.sub,
            scopeType: user.scopeType,
            scopeId: user.scopeId,
            module: 'ACCESS_CONTROL',
            method: request.method,
            endpoint: request.url,
            action: 'CHECK_PERMISSION',
            details: { required: requiredPermissions }
        };
        try {
            const userPermissionSlugs = await this.effectivePermissionsService.computeEffectivePermissions({
                userId: auditContext.userId,
                scopeType: auditContext.scopeType,
                scopeId: auditContext.scopeId
            });
            const isAllowed = this.decisionCenter.isAllowed(userPermissionSlugs, requiredPermissions);
            if (!isAllowed) {
                console.log('[DEBUG-GUARD] PermissionsGuard: DENIED');
                await this.auditService.logAction({ ...auditContext, action: 'ACCESS_DENIED', details: { ...auditContext.details, reason: 'Insufficient Permissions' } });
                throw new common_1.ForbiddenException('Insufficient Permissions');
            }
            await this.auditService.logAction({ ...auditContext, action: 'ACCESS_GRANTED' });
            return true;
        }
        catch (error) {
            console.error('[FATAL-GUARD] PermissionsGuard CRASH:', error);
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
        cached_effective_permissions_service_1.CachedEffectivePermissionsService,
        audit_service_1.AuditService,
        decision_center_service_1.DecisionCenterService])
], PermissionsGuard);
const RequirePermissions = (...permissions) => {
    return (target, key, descriptor) => {
        Reflect.defineMetadata('permissions', permissions, descriptor.value);
        return descriptor;
    };
};
exports.RequirePermissions = RequirePermissions;
//# sourceMappingURL=permissions.guard.js.map