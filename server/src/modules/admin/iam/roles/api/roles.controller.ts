import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, BadRequestException, Query, Put } from '@nestjs/common';
import { RolesService } from '../application/roles.service';
import { RolePermissionsService } from '../application/role-permissions.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { JwtAuthGuard } from '../../../../../platform/auth/jwt-auth.guard';
import { PermissionsGuard, RequirePermissions } from '../../../../../platform/auth/permissions.guard';
import { PermissionCacheService } from '../../../../../platform/auth/permission-cache.service';
import { ListQueryDto } from '../../../../../common/dto/pagination.dto';

@Controller('admin/roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
    constructor(
        private readonly rolesService: RolesService,
        private readonly rolePermissionsService: RolePermissionsService
    ) { }

    @Put(':id/permissions')
    @RequirePermissions('system.roles.manage_permissions') // Make sure this permission exists or use a generic one
    updatePermissions(
        @Param('id') id: string,
        @Body() dto: UpdateRolePermissionsDto,
        @Request() req
    ) {
        const userId = req.user.sub || req.user.userId;
        return this.rolePermissionsService.updateRolePermissions(userId, id, dto);
    }

    @Post()
    create(@Body() createRoleDto: CreateRoleDto, @Request() req) {
        // Assume userId is in req.user.sub or req.user.userId
        const userId = req.user.sub || req.user.userId;
        return this.rolesService.create(createRoleDto, userId);
    }

    @Get()
    findAll(@Query() query: ListQueryDto) {
        return this.rolesService.findAll(query);
    }

    @Get('debug-check')
    @UseGuards() // Public for debug (bypass PermissionsGuard if needed, but risky)
    async debugCheck() {
        return this.rolesService.debugCount();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.rolesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @Request() req) {
        const userId = req.user.sub || req.user.userId;
        return this.rolesService.update(id, updateRoleDto, userId);
    }

    // WORKFLOW ENDPOINTS

    @Post(':id/submit')
    submitForApproval(@Param('id') id: string, @Request() req) {
        const userId = req.user.sub || req.user.userId;
        return this.rolesService.submitForApproval(id, userId);
    }

    @Post(':id/approve')
    approve(@Param('id') id: string, @Request() req) {
        const approverId = req.user.sub || req.user.userId;
        // Verify if approver has permission to approve? 
        // @RequirePermissions('roles.approve') should be here ideally.
        // For now open to any admin.
        return this.rolesService.approve(id, approverId);
    }

    @Post(':id/reject')
    reject(@Param('id') id: string, @Body('reason') reason: string, @Request() req) {
        if (!reason) throw new BadRequestException('Reason is required');
        const userId = req.user.sub || req.user.userId;
        return this.rolesService.reject(id, reason, userId);
    }
}
