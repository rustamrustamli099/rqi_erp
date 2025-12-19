import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PackagesUseCase } from '../application/packages.usecase';
import { Prisma } from '@prisma/client';
import { Permissions } from '../../../platform/auth/permissions.decorator';
import { PermissionsGuard } from '../../../platform/auth/permissions.guard';
import { JwtAuthGuard } from '../../../platform/auth/jwt-auth.guard';

@Controller('packages')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PackagesController {
    constructor(private readonly packagesUseCase: PackagesUseCase) { }

    @Post()
    @Permissions('system:packages:create')
    create(@Body() data: Prisma.PackageCreateInput) {
        return this.packagesUseCase.create(data);
    }

    @Get()
    @Permissions('system:packages:read')
    findAll() {
        return this.packagesUseCase.findAll();
    }

    @Get(':id')
    @Permissions('system:packages:read')
    findOne(@Param('id') id: string) {
        return this.packagesUseCase.findOne(id);
    }

    @Patch(':id')
    @Permissions('system:packages:update')
    update(@Param('id') id: string, @Body() data: Prisma.PackageUpdateInput) {
        return this.packagesUseCase.update(id, data);
    }

    @Delete(':id')
    @Permissions('system:packages:delete')
    remove(@Param('id') id: string) {
        return this.packagesUseCase.remove(id);
    }
}
