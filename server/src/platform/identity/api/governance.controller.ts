/**
 * Governance Controller
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * API endpoints for governance: SoD validation, risk scoring, approvals.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GovernanceService } from '../application/governance.service';
import { SOD_RULES } from '../domain/sod-rules';

class ValidatePermissionsDto {
    @ApiProperty({
        example: ['system.roles.create', 'system.roles.approve'],
        description: 'List of permission slugs to validate'
    })
    permissions: string[];
}

class CreateApprovalRequestDto {
    @ApiProperty({ enum: ['ROLE', 'USER', 'EXPORT', 'BILLING'] })
    entityType: 'ROLE' | 'USER' | 'EXPORT' | 'BILLING';

    @ApiProperty({ example: 'role-123' })
    entityId: string;

    @ApiProperty({ example: 'Finance Admin' })
    entityName: string;

    @ApiProperty({ enum: ['CREATE', 'UPDATE', 'DELETE', 'EXPORT'] })
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT';

    @ApiProperty({ required: false })
    changes?: {
        before: Record<string, any>;
        after: Record<string, any>;
    };

    @ApiProperty({ required: false, example: 75 })
    riskScore?: number;

    @ApiProperty({ required: false, example: 'HIGH' })
    riskLevel?: string;

    @ApiProperty({ required: false, example: 2 })
    sodConflicts?: number;
}

class ApproveRequestDto {
    @ApiProperty({ required: false, example: 'Approved after review' })
    comment?: string;
}

class RejectRequestDto {
    @ApiProperty({ example: 'Too risky, please remove export permission' })
    reason: string;
}

@ApiTags('Governance')
@Controller('governance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GovernanceController {
    constructor(private readonly governanceService: GovernanceService) { }

    /**
     * Validate permissions for SoD and risk
     */
    @Post('validate')
    @ApiOperation({ summary: 'Validate permissions for SoD conflicts and risk score' })
    @ApiResponse({ status: 200, description: 'Validation result' })
    async validatePermissions(@Body() dto: ValidatePermissionsDto) {
        return this.governanceService.validatePermissions(dto.permissions);
    }

    /**
     * Create approval request
     */
    @Post('approval-requests')
    @ApiOperation({ summary: 'Create an approval request for high-risk changes' })
    @ApiResponse({ status: 201, description: 'Approval request created' })
    async createApprovalRequest(
        @Body() dto: CreateApprovalRequestDto,
        @Request() req
    ) {
        return this.governanceService.createApprovalRequest({
            ...dto,
            requestedById: req.user.id,
            requestedByName: req.user.fullName || req.user.email
        });
    }

    /**
     * Get pending approvals for current user
     */
    @Get('pending-approvals')
    @ApiOperation({ summary: 'Get pending approvals that current user can approve' })
    @ApiResponse({ status: 200, description: 'List of pending approvals' })
    async getPendingApprovals(@Request() req) {
        return this.governanceService.getPendingApprovals(req.user.id);
    }

    /**
     * Approve a request
     */
    @Post('approval-requests/:id/approve')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Approve a pending request (4-eyes principle enforced)' })
    @ApiResponse({ status: 200, description: 'Request approved' })
    @ApiResponse({ status: 400, description: 'Cannot approve own request' })
    async approveRequest(
        @Param('id') id: string,
        @Body() dto: ApproveRequestDto,
        @Request() req
    ) {
        return this.governanceService.approveRequest(id, req.user.id, dto.comment);
    }

    /**
     * Reject a request
     */
    @Post('approval-requests/:id/reject')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reject a pending request (reason required)' })
    @ApiResponse({ status: 200, description: 'Request rejected' })
    @ApiResponse({ status: 400, description: 'Rejection reason required' })
    async rejectRequest(
        @Param('id') id: string,
        @Body() dto: RejectRequestDto,
        @Request() req
    ) {
        return this.governanceService.rejectRequest(id, req.user.id, dto.reason);
    }

    /**
     * Get SoD rules
     */
    @Get('sod-rules')
    @ApiOperation({ summary: 'Get all SoD rules' })
    @ApiResponse({ status: 200, description: 'List of SoD rules' })
    getSodRules() {
        return SOD_RULES;
    }
}
