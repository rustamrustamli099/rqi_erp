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
exports.SessionController = void 0;
const common_1 = require("@nestjs/common");
const session_service_1 = require("./session.service");
const switch_context_dto_1 = require("./dto/switch-context.dto");
const jwt_auth_guard_1 = require("../jwt-auth.guard");
let SessionController = class SessionController {
    sessionService;
    constructor(sessionService) {
        this.sessionService = sessionService;
    }
    async getScopes(req) {
        return this.sessionService.getAvailableScopes(req.user.userId);
    }
    async getContext(req) {
        return {
            userId: req.user.userId,
            scopeType: req.user.scopeType || 'UNKNOWN',
            scopeId: req.user.tenantId || null
        };
    }
    async switchContext(req, dto) {
        return this.sessionService.switchContext(req.user.userId, dto);
    }
};
exports.SessionController = SessionController;
__decorate([
    (0, common_1.Get)('scopes'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "getScopes", null);
__decorate([
    (0, common_1.Get)('context'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "getContext", null);
__decorate([
    (0, common_1.Post)('context'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, switch_context_dto_1.SwitchContextDto]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "switchContext", null);
exports.SessionController = SessionController = __decorate([
    (0, common_1.Controller)('session'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [session_service_1.SessionService])
], SessionController);
//# sourceMappingURL=session.controller.js.map