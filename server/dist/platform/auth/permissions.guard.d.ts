import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma.service';
import { CachedEffectivePermissionsService } from './cached-effective-permissions.service';
import { AuditService } from '../../system/audit/audit.service';
import { DecisionCenterService } from '../decision/decision-center.service';
export declare class PermissionsGuard implements CanActivate {
    private reflector;
    private prisma;
    private effectivePermissionsService;
    private auditService;
    private decisionCenter;
    constructor(reflector: Reflector, prisma: PrismaService, effectivePermissionsService: CachedEffectivePermissionsService, auditService: AuditService, decisionCenter: DecisionCenterService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export declare const RequirePermissions: (...permissions: string[]) => (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => PropertyDescriptor | undefined;
