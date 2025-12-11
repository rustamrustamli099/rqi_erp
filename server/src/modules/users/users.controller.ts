import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccessControlGuard } from '../../common/guards/access-control.guard';
import { PermissionsGuard, RequirePermissions } from '../../common/guards/permissions.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, AccessControlGuard, PermissionsGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @RequirePermissions('users:create')
    create(@Body() createUserDto: any) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @RequirePermissions('users:read')
    findAll(@Request() req, @Query() query) {
        // Basic filtering logic based on user role can be added here
        // For now, returning all (AccessControlGuard handles permission to REACH here)
        return this.usersService.findAll({
            take: query.take ? Number(query.take) : undefined,
            skip: query.skip ? Number(query.skip) : undefined,
            where: query.search ? {
                OR: [
                    { email: { contains: query.search } },
                    { fullName: { contains: query.search } }
                ]
            } : undefined
        });
    }

    @Get(':id')
    @RequirePermissions('users:read')
    findOne(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Patch(':id')
    @RequirePermissions('users:update')
    update(@Param('id') id: string, @Body() updateUserDto: any) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @RequirePermissions('users:delete')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
