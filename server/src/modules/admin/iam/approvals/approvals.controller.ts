import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../../../../platform/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../platform/auth/permissions.guard';

@Controller('admin/approvals')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ApprovalsController {
    constructor(private readonly approvalsService: ApprovalsService) { }

    @Get('pending')
    async getPending(@Request() req: any) {
        // Safe User ID extraction
        const user = req.user;
        const userId = user.sub || user.userId || user.id;

        // Extract permissions safely
        const permissions = user.permissions || [];

        // PHASE 14H: Compute eligibility at controller level
        const eligibility = this.approvalsService.computeEligibility(permissions);

        const items = await this.approvalsService.getPendingApprovals(userId, eligibility);
        return {
            items,
            count: items.length
        };
    }

    @Post(':id/approve')
    async approve(
        @Param('id') id: string,
        @Body('type') type: 'ROLE',
        @Request() req: any
    ) {
        const userId = req.user.sub || req.user.userId || req.user.id;
        const context = {
            scopeType: req.user.scopeType || 'SYSTEM',
            scopeId: req.user.scopeId || null
        };
        return this.approvalsService.approve(id, type, userId, context);
    }

    @Post(':id/reject')
    async reject(
        @Param('id') id: string,
        @Body('type') type: 'ROLE',
        @Body('reason') reason: string,
        @Request() req: any
    ) {
        const userId = req.user.sub || req.user.userId || req.user.id;
        const context = {
            scopeType: req.user.scopeType || 'SYSTEM',
            scopeId: req.user.scopeId || null
        };
        return this.approvalsService.reject(id, type, reason, userId, context);
    }
}
