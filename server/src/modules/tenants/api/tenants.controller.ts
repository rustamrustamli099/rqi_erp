
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TenantsUseCase } from '../application/tenants.usecase';
import { JwtAuthGuard } from '../../../platform/auth/jwt-auth.guard'; // Boundary crossing: Core is generic

@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantsUseCase: TenantsUseCase) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() body: { name: string; email: string }) {
        return this.tenantsUseCase.createTenant(body.name, body.email);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll() {
        return this.tenantsUseCase.getAllTenants();
    }
}
