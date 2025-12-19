
import { Controller, Get, Post, Delete, Body, Query, UseGuards, Param } from '@nestjs/common';
import { RetentionService } from './retention.service';
import { JwtAuthGuard } from '../../platform/auth/jwt-auth.guard';
import { Roles } from '../../platform/auth/roles.decorator';

@Controller('system/retention')
@UseGuards(JwtAuthGuard)
@Roles('SuperAdmin', 'Owner')
export class RetentionController {
    constructor(private readonly retentionService: RetentionService) { }

    @Post('policies')
    async createPolicy(@Body() body: { entity: string; days: number; action: string }) {
        return this.retentionService.createPolicy(body);
    }

    @Get('policies')
    async getPolicies() {
        return this.retentionService.getPolicies();
    }

    @Delete('policies/:id')
    async deletePolicy(@Param('id') id: string) {
        return this.retentionService.deletePolicy(id);
    }

    @Post('run')
    async runRetention(@Body('dryRun') dryRun: boolean) {
        return this.retentionService.executePolicy(dryRun);
    }
}
