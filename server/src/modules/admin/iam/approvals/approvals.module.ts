import { Module } from '@nestjs/common';
import { ApprovalsController } from './approvals.controller';
import { ApprovalsService } from './approvals.service';
import { RolesModule } from '../roles/roles.module';
import { PrismaService } from '../../../../prisma.service';
import { PermissionCacheService } from '../../../../platform/auth/permission-cache.service';
import { AuditService } from '../../../../system/audit/audit.service';

@Module({
    imports: [
        RolesModule // Import to access RolesService
    ],
    controllers: [ApprovalsController],
    providers: [ApprovalsService, PrismaService, PermissionCacheService, AuditService],
    exports: [ApprovalsService]
})
export class ApprovalsModule { }
