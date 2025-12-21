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
exports.RetentionController = void 0;
const common_1 = require("@nestjs/common");
const retention_service_1 = require("./retention.service");
const jwt_auth_guard_1 = require("../../platform/auth/jwt-auth.guard");
const roles_decorator_1 = require("../../platform/auth/roles.decorator");
let RetentionController = class RetentionController {
    retentionService;
    constructor(retentionService) {
        this.retentionService = retentionService;
    }
    async createPolicy(body) {
        return this.retentionService.createPolicy(body);
    }
    async getPolicies() {
        return this.retentionService.getPolicies();
    }
    async deletePolicy(id) {
        return this.retentionService.deletePolicy(id);
    }
    async runRetention(dryRun) {
        return this.retentionService.executePolicy(dryRun);
    }
};
exports.RetentionController = RetentionController;
__decorate([
    (0, common_1.Post)('policies'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RetentionController.prototype, "createPolicy", null);
__decorate([
    (0, common_1.Get)('policies'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RetentionController.prototype, "getPolicies", null);
__decorate([
    (0, common_1.Delete)('policies/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RetentionController.prototype, "deletePolicy", null);
__decorate([
    (0, common_1.Post)('run'),
    __param(0, (0, common_1.Body)('dryRun')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean]),
    __metadata("design:returntype", Promise)
], RetentionController.prototype, "runRetention", null);
exports.RetentionController = RetentionController = __decorate([
    (0, common_1.Controller)('system/retention'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'Owner'),
    __metadata("design:paramtypes", [retention_service_1.RetentionService])
], RetentionController);
//# sourceMappingURL=retention.controller.js.map