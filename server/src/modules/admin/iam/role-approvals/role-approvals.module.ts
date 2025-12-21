import { Module } from '@nestjs/common';
import { RoleApprovalsController } from './api/role-approvals.controller';
import { RoleApprovalsService } from './application/role-approvals.service';
import { PrismaService } from '../../../../prisma.service';
import { AuditService } from '../../../../system/audit/audit.service';

@Module({
    imports: [],
    controllers: [RoleApprovalsController],
    providers: [RoleApprovalsService, PrismaService, AuditService],
    exports: [RoleApprovalsService],
})
export class RoleApprovalsModule { }
