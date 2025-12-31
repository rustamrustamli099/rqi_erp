import { Controller, Post, Get, Body, Param, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { RoleApprovalsService } from '../application/role-approvals.service';
import { JwtAuthGuard } from '../../../../../platform/auth/jwt-auth.guard';
import { PermissionsGuard, RequirePermissions } from '../../../../../platform/auth/permissions.guard';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CreateRoleChangeRequestDto } from './dto/create-role-change-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';

@ApiTags('Admin / IAM / Approvals')
@Controller('admin/iam/role-approvals')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RoleApprovalsController {
    constructor(private readonly approvalsService: RoleApprovalsService) { }

    @Post()
    @ApiOperation({ summary: 'Submit a role change request' })
    @RequirePermissions('system.roles.manage')
    @ApiBody({ type: CreateRoleChangeRequestDto })
    async create(@Body() dto: CreateRoleChangeRequestDto, @Request() req) {
        const userId = req.user.sub || req.user.userId;
        return this.approvalsService.submitRequest(dto.roleId, userId, dto.diff, dto.reason);
    }

    @Get()
    @RequirePermissions('system.roles.view')
    async findAll(@Query('status') status?: string) {
        return this.approvalsService.findAll(status);
    }

    @Post(':id/approve')
    @RequirePermissions('system.roles.approve')
    async approve(@Param('id') id: string, @Request() req) {
        const userId = req.user.sub || req.user.userId;
        return this.approvalsService.approveRequest(id, userId);
    }

    @Post(':id/reject')
    @RequirePermissions('system.roles.approve') // Approval permission needed to reject too
    @ApiBody({ type: RejectRequestDto })
    async reject(@Param('id') id: string, @Body() dto: RejectRequestDto, @Request() req) {
        const userId = req.user.sub || req.user.userId;
        return this.approvalsService.rejectRequest(id, dto.reason, userId);
    }
}
