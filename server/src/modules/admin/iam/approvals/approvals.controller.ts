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
        // In many setups, PermissionsGuard attaches permissions to user, or we fetch them.
        // Assuming user.permissions exists or we pass an empty array to be safe.
        // If the service relies on permissions to filter, and they are missing, it might return empty result.
        const permissions = user.permissions || [];

        const items = await this.approvalsService.getPendingApprovals(userId, permissions);
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
