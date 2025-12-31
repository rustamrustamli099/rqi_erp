
import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { BranchesUseCase } from '../application/branches.usecase';
import { JwtAuthGuard } from '../../../platform/auth/jwt-auth.guard';
import { TenantContextGuard } from '../../../platform/tenant-context/tenant-context.guard';
import { Request } from 'express';

@Controller('branches')
@UseGuards(JwtAuthGuard, TenantContextGuard) // [SECURITY] Enforce Auth & Tenant Context
export class BranchesController {
    constructor(private readonly branchesUseCase: BranchesUseCase) { }

    @Post()
    create(@Req() req: any, @Body() body: any) {
        // [SECURITY] Use Tenant ID from Token, not Body
        return this.branchesUseCase.create(req.user.tenantId, body.name, body.address, body.phone);
    }

    @Get()
    findAll(@Req() req: any) {
        // [SECURITY] Scope to Tenant
        return this.branchesUseCase.findAll(req.user.tenantId);
    }

    @Get(':id')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.branchesUseCase.findOne(id);
    }

    @Patch(':id')
    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.branchesUseCase.update(id, body);
    }

    @Delete(':id')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.branchesUseCase.remove(id);
    }
}
