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
exports.IdentityController = void 0;
const common_1 = require("@nestjs/common");
const identity_usecase_1 = require("../application/identity.usecase");
const jwt_auth_guard_1 = require("../../../platform/auth/jwt-auth.guard");
let IdentityController = class IdentityController {
    identityUseCase;
    constructor(identityUseCase) {
        this.identityUseCase = identityUseCase;
    }
    async getUserByEmail(email) {
        return this.identityUseCase.findUserByEmail(email);
    }
};
exports.IdentityController = IdentityController;
__decorate([
    (0, common_1.Get)('users/:email'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IdentityController.prototype, "getUserByEmail", null);
exports.IdentityController = IdentityController = __decorate([
    (0, common_1.Controller)('identity'),
    __metadata("design:paramtypes", [identity_usecase_1.IdentityUseCase])
], IdentityController);
//# sourceMappingURL=identity.controller.js.map