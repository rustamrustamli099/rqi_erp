import { Module } from '@nestjs/common';
import { RolesService } from './application/roles.service';
import { RolePermissionsService } from './application/role-permissions.service';
import { RolesController } from './api/roles.controller';
import { PrismaService } from '../../../../prisma.service';
import { PermissionCacheService } from '../../../../platform/auth/permission-cache.service';
import { AuditService } from '../../../../system/audit/audit.service';
import { AuthModule } from '../../../../platform/auth/auth.module'; // Or path to PermissionsGuard dependencies

// Assuming PermissionsGuard needs PermissionCacheService and AuditService
// Check Imports of PermissionsGuard: Reflector, PrismaService, PermissionCacheService, AuditService.
// So we must provide these.

@Module({
    imports: [],
    controllers: [RolesController],
    providers: [RolesService, RolePermissionsService, PrismaService, PermissionCacheService, AuditService],
    exports: [RolesService]
})
export class RolesModule { }
