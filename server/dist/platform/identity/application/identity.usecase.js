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
exports.IdentityUseCase = void 0;
const common_1 = require("@nestjs/common");
const user_repository_interface_1 = require("../domain/user.repository.interface");
let IdentityUseCase = class IdentityUseCase {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async findUserByEmail(email) {
        return this.userRepository.findByEmail(email);
    }
    async findAllUsers(tenantId) {
        return this.userRepository.findAll(tenantId);
    }
    async findUserById(id) {
        return this.userRepository.findById(id);
    }
    async findUserWithPermissions(id) {
        return this.userRepository.findByIdWithPermissions(id);
    }
    async updateRefreshToken(id, refreshToken) {
        return this.userRepository.updateRefreshToken(id, refreshToken);
    }
    async enableMfa(id, secret) {
        return this.userRepository.enableMfa(id, secret);
    }
    async createUser(data) {
        return {};
    }
    async assignRole(userId, roleId, tenantId) {
        await this.userRepository.assignRole(userId, roleId, tenantId);
    }
    async revokeRole(userId, roleId, tenantId) {
        await this.userRepository.revokeRole(userId, roleId, tenantId);
    }
};
exports.IdentityUseCase = IdentityUseCase;
exports.IdentityUseCase = IdentityUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_interface_1.IUserRepository)),
    __metadata("design:paramtypes", [Object])
], IdentityUseCase);
//# sourceMappingURL=identity.usecase.js.map