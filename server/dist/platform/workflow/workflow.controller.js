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
exports.WorkflowController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const workflow_service_1 = require("./workflow.service");
let WorkflowController = class WorkflowController {
    workflowService;
    constructor(workflowService) {
        this.workflowService = workflowService;
    }
    async createApprovalRequest(dto, req) {
        return this.workflowService.createApprovalRequest({
            ...dto,
            requestedById: req.user.id,
            requestedByName: req.user.fullName || req.user.email
        });
    }
    async getPendingApprovals(req) {
        const userRoleIds = req.user.roles?.map(r => r.id) || [];
        return this.workflowService.getPendingApprovalsForUser(req.user.id, userRoleIds);
    }
    async approveRequest(id, comment, req) {
        return this.workflowService.processApprovalAction({
            requestId: id,
            actorId: req.user.id,
            actorName: req.user.fullName || req.user.email,
            action: 'APPROVE',
            comment
        });
    }
    async rejectRequest(id, comment, req) {
        return this.workflowService.processApprovalAction({
            requestId: id,
            actorId: req.user.id,
            actorName: req.user.fullName || req.user.email,
            action: 'REJECT',
            comment
        });
    }
    async upsertWorkflowDefinition(config) {
        return this.workflowService.upsertWorkflowDefinition(config);
    }
};
exports.WorkflowController = WorkflowController;
__decorate([
    (0, common_1.Post)('approval-requests'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new approval request' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Approval request created' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "createApprovalRequest", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending approvals for current user' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getPendingApprovals", null);
__decorate([
    (0, common_1.Post)('approval-requests/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a request' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('comment')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "approveRequest", null);
__decorate([
    (0, common_1.Post)('approval-requests/:id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a request' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('comment')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "rejectRequest", null);
__decorate([
    (0, common_1.Post)('definitions'),
    (0, swagger_1.ApiOperation)({ summary: 'Create or update workflow definition' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "upsertWorkflowDefinition", null);
exports.WorkflowController = WorkflowController = __decorate([
    (0, swagger_1.ApiTags)('Workflow'),
    (0, common_1.Controller)('workflow'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [workflow_service_1.WorkflowService])
], WorkflowController);
//# sourceMappingURL=workflow.controller.js.map