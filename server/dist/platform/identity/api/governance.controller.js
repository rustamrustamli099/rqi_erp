"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const governance_service_1 = require("../application/governance.service");
const sod_rules_1 = require("../domain/sod-rules");
class ValidatePermissionsDto {
    permissions;
}
class CreateApprovalRequestDto {
    entityType;
    entityId;
    entityName;
    action;
    changes;
    riskScore;
    riskLevel;
    sodConflicts;
}
class ApproveRequestDto {
    comment;
}
class RejectRequestDto {
    reason;
}
let GovernanceController = class GovernanceController {
    governanceService;
    constructor(governanceService) {
        this.governanceService = governanceService;
    }
    async validatePermissions(dto) {
        return this.governanceService.validatePermissions(dto.permissions);
    }
    async createApprovalRequest(dto, req) {
        return this.governanceService.createApprovalRequest({
            ...dto,
            requestedById: req.user.id,
            requestedByName: req.user.fullName || req.user.email
        });
    }
    async getPendingApprovals(req) {
        return this.governanceService.getPendingApprovals(req.user.id);
    }
    async approveRequest(id, dto, req) {
        return this.governanceService.approveRequest(id, req.user.id, dto.comment);
    }
    async rejectRequest(id, dto, req) {
        return this.governanceService.rejectRequest(id, req.user.id, dto.reason);
    }
    getSodRules() {
        return sod_rules_1.SOD_RULES;
    }
};
exports.GovernanceController = GovernanceController;
__decorate([
    (0, common_1.Post)('validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate permissions for SoD conflicts and risk score' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Validation result' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ValidatePermissionsDto]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "validatePermissions", null);
__decorate([
    (0, common_1.Post)('approval-requests'),
    (0, swagger_1.ApiOperation)({ summary: 'Create an approval request for high-risk changes' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Approval request created' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateApprovalRequestDto, Object]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "createApprovalRequest", null);
__decorate([
    (0, common_1.Get)('pending-approvals'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending approvals that current user can approve' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of pending approvals' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "getPendingApprovals", null);
__decorate([
    (0, common_1.Post)('approval-requests/:id/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a pending request (4-eyes principle enforced)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Request approved' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot approve own request' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ApproveRequestDto, Object]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "approveRequest", null);
__decorate([
    (0, common_1.Post)('approval-requests/:id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a pending request (reason required)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Request rejected' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Rejection reason required' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RejectRequestDto, Object]),
    __metadata("design:returntype", Promise)
], GovernanceController.prototype, "rejectRequest", null);
__decorate([
    (0, common_1.Get)('sod-rules'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all SoD rules' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of SoD rules' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "getSodRules", null);
exports.GovernanceController = GovernanceController = __decorate([
    (0, swagger_1.ApiTags)('Governance'),
    (0, common_1.Controller)('governance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [governance_service_1.GovernanceService])
], GovernanceController);
//# sourceMappingURL=governance.controller.js.map