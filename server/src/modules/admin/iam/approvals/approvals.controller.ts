import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Assuming global or standard guard
// import { PermissionsGuard } from '../../auth/guards/permissions.guard';

@Controller('admin/approvals')
export class ApprovalsController {
    constructor(private readonly approvalsService: ApprovalsService) { }

    @Get('pending')
    async getPending(@Request() req: any) {
        // req.user provided by AuthGuard
        // req.user.permissions provided by RBAC logic (usually injected into request)
        // If strict "permissions" are not in req, we might need to fetch them.
        // For this ERP, let's assume `req.user.permissions` is populated or we use a service to get them.

        // MOCK: If req.user.permissions missing, we should fetch (omitted for brevity, assuming Guard handles it)
        const userId = req.user.id;
        const permissions = req.user.permissions || [];

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
        return this.approvalsService.approve(id, type, req.user.id);
    }

    @Post(':id/reject')
    async reject(
        @Param('id') id: string,
        @Body('type') type: 'ROLE',
        @Body('reason') reason: string,
        @Request() req: any
    ) {
        return this.approvalsService.reject(id, type, reason, req.user.id);
    }
}
