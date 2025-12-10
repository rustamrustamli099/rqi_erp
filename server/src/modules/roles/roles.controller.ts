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
    @RequirePermissions('roles:read')
    findAll() {
        return this.rolesService.findAll();
    }

    @Get('permissions')
    @RequirePermissions('roles:read')
    findAllPermissions() {
        return this.rolesService.findAllPermissions();
    }

    @Get(':id')
    @RequirePermissions('roles:read')
    findOne(@Param('id') id: string) {
        return this.rolesService.findOne(id);
    }

    @Post()
    @RequirePermissions('roles:create')
    create(@Body() createRoleDto: any) {
        return this.rolesService.create(createRoleDto);
    }

    @Patch(':id')
    @RequirePermissions('roles:update')
    update(@Param('id') id: string, @Body() updateRoleDto: any) {
        return this.rolesService.update(id, updateRoleDto);
    }

    @Delete(':id')
    @RequirePermissions('roles:delete')
    remove(@Param('id') id: string) {
        return this.rolesService.remove(id);
    }
}
