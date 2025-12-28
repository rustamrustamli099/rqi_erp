/**
 * Workflow Controller - API endpoints for approval workflow
 */
import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkflowService, CreateApprovalRequestDto, ApprovalActionDto } from './workflow.service';

@ApiTags('Workflow')
@Controller('workflow')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkflowController {
    constructor(private readonly workflowService: WorkflowService) { }

    @Post('approval-requests')
    @ApiOperation({ summary: 'Create a new approval request' })
    @ApiResponse({ status: 201, description: 'Approval request created' })
    async createApprovalRequest(
        @Body() dto: Partial<CreateApprovalRequestDto>,
        @Request() req
    ) {
        return this.workflowService.createApprovalRequest({
            ...dto as CreateApprovalRequestDto,
            requestedById: req.user.id,
            requestedByName: req.user.fullName || req.user.email
        });
    }

    @Get('pending')
    @ApiOperation({ summary: 'Get pending approvals for current user' })
    async getPendingApprovals(@Request() req) {
        // Get user's role IDs from JWT or database
        const userRoleIds = req.user.roles?.map(r => r.id) || [];
        return this.workflowService.getPendingApprovalsForUser(req.user.id, userRoleIds);
    }

    @Post('approval-requests/:id/approve')
    @ApiOperation({ summary: 'Approve a request' })
    async approveRequest(
        @Param('id') id: string,
        @Body('comment') comment: string,
        @Request() req
    ) {
        return this.workflowService.processApprovalAction({
            requestId: id,
            actorId: req.user.id,
            actorName: req.user.fullName || req.user.email,
            action: 'APPROVE',
            comment
        });
    }

    @Post('approval-requests/:id/reject')
    @ApiOperation({ summary: 'Reject a request' })
    async rejectRequest(
        @Param('id') id: string,
        @Body('comment') comment: string,
        @Request() req
    ) {
        return this.workflowService.processApprovalAction({
            requestId: id,
            actorId: req.user.id,
            actorName: req.user.fullName || req.user.email,
            action: 'REJECT',
            comment
        });
    }

    @Post('definitions')
    @ApiOperation({ summary: 'Create or update workflow definition' })
    async upsertWorkflowDefinition(@Body() config: any) {
        return this.workflowService.upsertWorkflowDefinition(config);
    }
}
