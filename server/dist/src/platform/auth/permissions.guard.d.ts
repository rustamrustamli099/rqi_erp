import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma.service';
import { PermissionCacheService } from './permission-cache.service';
import { AuditService } from '../../system/audit/audit.service';
export declare class PermissionsGuard implements CanActivate {
    private reflector;
    private prisma;
    private permissionCache;
    private auditService;
    constructor(reflector: Reflector, prisma: PrismaService, permissionCache: PermissionCacheService, auditService: AuditService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export declare const RequirePermissions: (...permissions: string[]) => (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => PropertyDescriptor | undefined;
