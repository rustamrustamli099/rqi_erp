import { Controller, Post, Get, Body, Param, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { RoleApprovalsService } from '../application/role-approvals.service';
import { JwtAuthGuard } from '../../../../../platform/auth/jwt-auth.guard';
import { PermissionsGuard, RequirePermissions } from '../../../../../platform/auth/permissions.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Admin / IAM / Approvals')
@Controller('admin/iam/role-approvals')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RoleApprovalsController {
    constructor(private readonly approvalsService: RoleApprovalsService) { }

    @Post()
    @ApiOperation({ summary: 'Submit a role change request' })
    @RequirePermissions('role.manage') // Or specific permission
    async create(@Body() body: { roleId: string; diff?: any }, @Request() req) {
        const userId = req.user.sub || req.user.userId;
        return this.approvalsService.submitRequest(body.roleId, userId, body.diff);
    }

    @Get()
    @RequirePermissions('role.view')
    async findAll(@Query('status') status?: string) {
        return this.approvalsService.findAll(status);
    }

    @Post(':id/approve')
    @RequirePermissions('role.approve')
    async approve(@Param('id') id: string, @Request() req) {
        const userId = req.user.sub || req.user.userId;
        return this.approvalsService.approveRequest(id, userId);
    }

    @Post(':id/reject')
    @RequirePermissions('role.approve')
    async reject(@Param('id') id: string, @Body() body: { reason: string }, @Request() req) {
        const userId = req.user.sub || req.user.userId;
        if (!body.reason) throw new BadRequestException('Reason is required');
        return this.approvalsService.rejectRequest(id, body.reason, userId);
    }
}
