import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccessControlGuard } from '../../common/guards/access-control.guard';
import { PermissionsGuard, RequirePermissions } from '../../common/guards/permissions.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard, AccessControlGuard, PermissionsGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Get()
    @RequirePermissions('config:roles:read')
    findAll() {
        return this.rolesService.findAll();
    }

    @Get('permissions')
    @RequirePermissions('config:roles:read')
    findAllPermissions() {
        return this.rolesService.findAllPermissions();
    }

    @Get(':id')
    @RequirePermissions('config:roles:read')
    findOne(@Param('id') id: string) {
        return this.rolesService.findOne(id);
    }

    @Post()
    @RequirePermissions('config:roles:create')
    create(@Body() createRoleDto: any) {
        return this.rolesService.create(createRoleDto);
    }

    @Patch(':id')
    @RequirePermissions('config:roles:update')
    update(@Param('id') id: string, @Body() updateRoleDto: any) {
        return this.rolesService.update(id, updateRoleDto);
    }

    @Delete(':id')
    @RequirePermissions('config:roles:delete')
    remove(@Param('id') id: string) {
        return this.rolesService.remove(id);
    }
}
