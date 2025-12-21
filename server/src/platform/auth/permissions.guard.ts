import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma.service';
import { PermissionCacheService } from './permission-cache.service';
import { AuditService } from '../../system/audit/audit.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
        private permissionCache: PermissionCacheService,
        private auditService: AuditService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
        if (!requiredPermissions) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) return false;

        // [AUDIT] Context
        const auditContext = {
            userId: user.sub || user.userId,
            tenantId: user.tenantId,
            branchId: (user as any).branchId || null,
            module: 'ACCESS_CONTROL',
            method: request.method,
            endpoint: request.url,
            action: 'CHECK_PERMISSION',
            details: { required: requiredPermissions }
        };

        try {
            // 1. OWNER BYPASS - REMOVED for Strict DB Enforcement
            // isOwner flag is no longer a magic pass. Permissions must be in DB.

            const userRole = (user as any).role;
            // 2. CACHE LOOKUP (Redis First)
            const scope = user.tenantId ? 'TENANT' : 'SYSTEM';
            let userPermissionSlugs: string[] | null = await this.permissionCache.getPermissions(user.sub, user.tenantId, scope);

            if (!userPermissionSlugs) {
                // 3. DB FALLBACK (Cache Miss)
                // 3. DB FALLBACK (Cache Miss) - Strict Multi-Role + Context
                const userWithRoles = await this.prisma.user.findUnique({
                    where: { id: user.sub },
                    include: {
                        roles: { // Use valid UserRole relation
                            include: {
                                role: {
                                    include: {
                                        permissions: {
                                            include: { permission: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });

                if (!userWithRoles) {
                    await this.auditService.logAction({ ...auditContext, action: 'ACCESS_DENIED_USER_NOT_FOUND' });
                    return false;
                }

                const dbPermissions: string[] = [];
                const contextTenantId = user.tenantId || null;

                if (userWithRoles.roles) {
                    userWithRoles.roles.forEach(ur => {
                        // Strict Context Filter (Must match AuthService logic)
                        // Include if assignment matches context
                        const isMatch = ur.tenantId === contextTenantId;

                        if (isMatch && ur.role && ur.role.permissions) {
                            ur.role.permissions.forEach(rp => {
                                if (rp.permission) dbPermissions.push(rp.permission.slug);
                            });
                        }
                    });
                }
                userPermissionSlugs = dbPermissions;

                // Hydrate Cache
                await this.permissionCache.setPermissions(user.sub, userPermissionSlugs, user.tenantId, scope);
            }

            // 4. CHECK
            const hasPermission = requiredPermissions.some(permission => userPermissionSlugs!.includes(permission));

            if (!hasPermission) {
                await this.auditService.logAction({ ...auditContext, action: 'ACCESS_DENIED', details: { ...auditContext.details, reason: 'Insufficient Permissions' } });
                throw new ForbiddenException('Insufficient Permissions');
            }

            // Log Success
            await this.auditService.logAction({ ...auditContext, action: 'ACCESS_GRANTED' });

            return true;

        } catch (error) {
            if (error instanceof ForbiddenException) throw error;
            // Log unexpected errors
            await this.auditService.logAction({ ...auditContext, action: 'ACCESS_ERROR', details: { error: error.message } });
            return false;
        }
    }
}

export const RequirePermissions = (...permissions: string[]) => {
    return (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => {
        Reflect.defineMetadata('permissions', permissions, descriptor!.value);
        return descriptor;
    };
};
