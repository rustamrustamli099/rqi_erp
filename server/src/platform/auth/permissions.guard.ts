import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma.service';
import { CachedEffectivePermissionsService } from './cached-effective-permissions.service';
import { AuditService } from '../../system/audit/audit.service';
import { PermissionDryRunEngine } from '../../common/utils/dry-run.engine';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
        private effectivePermissionsService: CachedEffectivePermissionsService,
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
            console.log('[DEBUG-GUARD] PermissionsGuard: Checking...', { userId: auditContext.userId, url: request.url });

            // [STRICT] Permissions via EffectivePermissionsService
            const userPermissionSlugs = await this.effectivePermissionsService.computeEffectivePermissions({
                userId: auditContext.userId,
                scopeType: auditContext.scopeType,
                scopeId: auditContext.scopeId
            });

            // 4. CHECK (Using centralized Dry-Run Engine)
            const validation = PermissionDryRunEngine.evaluate(userPermissionSlugs!, requiredPermissions);

            if (!validation.allowed) {
                console.log('[DEBUG-GUARD] PermissionsGuard: DENIED');
                await this.auditService.logAction({ ...auditContext, action: 'ACCESS_DENIED', details: { ...auditContext.details, reason: 'Insufficient Permissions' } });
                throw new ForbiddenException('Insufficient Permissions');
            }

            // Log Success
            console.log('[DEBUG-GUARD] PermissionsGuard: GRANTED -> Logging Action...');
            await this.auditService.logAction({ ...auditContext, action: 'ACCESS_GRANTED' });
            console.log('[DEBUG-GUARD] PermissionsGuard: Action Logged Successfully');

            return true;

        } catch (error) {
            console.error('[FATAL-GUARD] PermissionsGuard CRASH:', error);
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
