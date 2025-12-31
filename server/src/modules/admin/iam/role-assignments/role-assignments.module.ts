import { Module } from '@nestjs/common';
import { RoleAssignmentsService } from './application/role-assignments.service';
import { RoleAssignmentsController } from './api/role-assignments.controller';
import { PrismaService } from '../../../../prisma.service';
import { AuditModule } from '../../../../system/audit/audit.module';

@Module({
    imports: [AuditModule],
    controllers: [RoleAssignmentsController],
    providers: [RoleAssignmentsService, PrismaService],
    exports: [RoleAssignmentsService]
})
export class RoleAssignmentsModule { }
