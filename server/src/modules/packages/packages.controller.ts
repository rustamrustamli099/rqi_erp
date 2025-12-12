import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { Prisma } from '@prisma/client';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('packages')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PackagesController {
    constructor(private readonly packagesService: PackagesService) { }

    @Post()
    @Permissions('system:packages:create')
    create(@Body() data: Prisma.PackageCreateInput) {
        return this.packagesService.create(data);
    }

    @Get()
    @Permissions('system:packages:read')
    findAll() {
        return this.packagesService.findAll();
    }

    @Get(':id')
    @Permissions('system:packages:read')
    findOne(@Param('id') id: string) {
        return this.packagesService.findOne(id);
    }

    @Patch(':id')
    @Permissions('system:packages:update')
    update(@Param('id') id: string, @Body() data: Prisma.PackageUpdateInput) {
        return this.packagesService.update(id, data);
    }

    @Delete(':id')
    @Permissions('system:packages:delete')
    remove(@Param('id') id: string) {
        return this.packagesService.remove(id);
    }
}
