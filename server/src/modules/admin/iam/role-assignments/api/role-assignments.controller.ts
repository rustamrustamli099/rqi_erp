import { Controller, Post, Body, Delete, Param, Get, Query, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { RoleAssignmentsService } from '../application/role-assignments.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../../../../../platform/auth/jwt-auth.guard';
import { PermissionsGuard, RequirePermissions } from '../../../../../platform/auth/permissions.guard';

@Controller('admin/iam/assignments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RoleAssignmentsController {
    constructor(private readonly service: RoleAssignmentsService) { }

    @Post()
    @RequirePermissions('iam.assignments.create')
    async assign(@Body() dto: AssignRoleDto, @Request() req) {
        const userId = req.user.sub || req.user.userId;
        const context = {
            scopeType: req.user.scopeType || 'SYSTEM',
            scopeId: req.user.scopeId || null
        };
        return this.service.assign(dto, userId, context);
    }

    @Delete(':userId/:roleId')
    @RequirePermissions('iam.assignments.delete')
    async revoke(
        @Param('userId') userId: string,
        @Param('roleId') roleId: string,
        @Query('scopeType') scopeType: string,
        @Query('scopeId') scopeId: string | undefined,
        @Request() req
    ) {
        // [PFCG] Explicit Scope Requirement
        if (!scopeType) {
            throw new BadRequestException('scopeType is required (SYSTEM or TENANT)');
        }
        if (scopeType === 'TENANT' && !scopeId) {
            throw new BadRequestException('scopeId is required for TENANT scope');
        }

        const currentUserId = req.user.sub || req.user.userId;
        const userContext = {
            scopeType: req.user.scopeType || 'SYSTEM',
            scopeId: req.user.scopeId || null
        };

        // Access Check
        if (userContext.scopeType === 'TENANT') {
            if (scopeType === 'SYSTEM') {
                throw new BadRequestException('Security Violation: Tenant Admin cannot revoke SYSTEM assignments.');
            }
            if (scopeType === 'TENANT' && scopeId !== userContext.scopeId) {
                throw new BadRequestException('Security Violation: Cross-Tenant revocation denied.');
            }
        }

        const targetContext = {
            scopeType,
            scopeId: scopeId || null
        };

        return this.service.revoke(userId, roleId, currentUserId, targetContext);
    }

    @Get('user/:userId')
    @RequirePermissions('iam.assignments.read')
    async listByUser(
        @Param('userId') userId: string,
        @Query('scopeType') scopeType: string,
        @Query('scopeId') scopeId: string | undefined,
        @Request() req
    ) {
        // [PFCG] Explicit Scope Requirement
        if (!scopeType) {
            throw new BadRequestException('scopeType is required (SYSTEM or TENANT)');
        }
        if (scopeType === 'TENANT' && !scopeId) {
            throw new BadRequestException('scopeId is required for TENANT scope');
        }

        // Validate Access to Requested Scope
        const userContext = {
            scopeType: req.user.scopeType || 'SYSTEM',
            scopeId: req.user.scopeId || null
        };

        // Rule: Can I read assignments for Scope X?
        // If I am System Admin -> I can read SYSTEM and ANY TENANT (usually, or restricted?)
        // If I am Tenant Admin (T1) -> I can read T1. I CANNOT read T2. I CANNOT read SYSTEM?.

        if (userContext.scopeType === 'TENANT') {
            if (scopeType === 'SYSTEM') {
                // Policy: Can Tenant Admin see System Assignments? 
                // Usually NO, they only care about their tenant.
                // Strict PFCG: No.
                throw new BadRequestException('Security Violation: Tenant Admin cannot view SYSTEM assignments.');
            }
            if (scopeType === 'TENANT' && scopeId !== userContext.scopeId) {
                throw new BadRequestException('Security Violation: Cross-Tenant access denied.');
            }
        }

        // If System Admin: 
        // Can view SYSTEM.
        // Can view TENANT? Yes, usually System Admin provisions Tenants.

        const targetContext = {
            scopeType,
            scopeId: scopeId || null
        };

        return this.service.listByUser(userId, targetContext);
    }
}
