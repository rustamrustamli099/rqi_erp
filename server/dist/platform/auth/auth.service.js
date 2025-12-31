"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const identity_usecase_1 = require("../identity/application/identity.usecase");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const redis_service_1 = require("../redis/redis.service");
const refresh_token_service_1 = require("./refresh-token.service");
let AuthService = class AuthService {
    identityUseCase;
    jwtService;
    redisService;
    refreshTokenService;
    constructor(identityUseCase, jwtService, redisService, refreshTokenService) {
        this.identityUseCase = identityUseCase;
        this.jwtService = jwtService;
        this.redisService = redisService;
        this.refreshTokenService = refreshTokenService;
    }
    async validateUser(email, pass) {
        const user = await this.identityUseCase.findUserByEmail(email);
        if (user && user.passwordHash && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }
    async issueTokenForScope(user, scopeType, scopeId) {
        const payload = {
            sub: user.id,
            scopeType: scopeType,
            scopeId: scopeId,
        };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        return {
            access_token: accessToken,
            user: {
                id: user.id,
                scopeType,
                scopeId
            }
        };
    }
    async login(user, rememberMe = false, ip, agent) {
        const targetScopeType = 'SYSTEM';
        const targetScopeId = null;
        const rtResult = await this.refreshTokenService.generateToken(user.id, ip, agent, targetScopeType, targetScopeId);
        const refreshToken = rtResult.token;
        await this.identityUseCase.updateRefreshToken(user.id, refreshToken);
        const tokenResult = await this.issueTokenForScope(user, targetScopeType, targetScopeId);
        const expiresIn = rememberMe ? '30d' : '7d';
        return {
            access_token: tokenResult.access_token,
            refresh_token: refreshToken,
            expiresIn,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                isOwner: user.isOwner,
                permissions: []
            }
        };
    }
    async refreshTokens(refreshToken, ip, agent) {
        let rtResult;
        try {
            rtResult = await this.refreshTokenService.rotateToken(refreshToken, ip, agent);
        }
        catch (e) {
            throw new common_1.ForbiddenException('Invalid or Expired Refresh Token');
        }
        const userId = rtResult.userId;
        const user = await this.identityUseCase.findUserById(userId);
        if (!user)
            throw new common_1.ForbiddenException('User Not Found');
        const { scopeType, scopeId, token: newRefreshToken } = rtResult;
        const tokenResult = await this.issueTokenForScope(user, scopeType, scopeId);
        return {
            access_token: tokenResult.access_token,
            refresh_token: newRefreshToken,
        };
    }
    async logout(refreshToken) {
        if (refreshToken) {
            await this.refreshTokenService.revokeByToken(refreshToken);
        }
    }
    async loginWithMfa(userId, token) {
        const user = await this.identityUseCase.findUserById(userId);
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        return this.login(user);
    }
    async impersonate(requesterId, targetUserId) {
        const requester = await this.identityUseCase.findUserById(requesterId);
        const targetUser = await this.identityUseCase.findUserById(targetUserId);
        if (!targetUser)
            throw new common_1.ForbiddenException('Target user not found');
        return this.login(targetUser);
    }
    async revokeSessions(userId) {
        const now = Math.floor(Date.now() / 1000);
        await this.redisService.set(`auth:revoked:${userId}`, now.toString(), 86400 * 30);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [identity_usecase_1.IdentityUseCase,
        jwt_1.JwtService,
        redis_service_1.RedisService,
        refresh_token_service_1.RefreshTokenService])
], AuthService);
//# sourceMappingURL=auth.service.js.map