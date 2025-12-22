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
const permission_cache_service_1 = require("./permission-cache.service");
const refresh_token_service_1 = require("./refresh-token.service");
let AuthService = class AuthService {
    identityUseCase;
    jwtService;
    permissionCache;
    redisService;
    refreshTokenService;
    constructor(identityUseCase, jwtService, permissionCache, redisService, refreshTokenService) {
        this.identityUseCase = identityUseCase;
        this.jwtService = jwtService;
        this.permissionCache = permissionCache;
        this.redisService = redisService;
        this.refreshTokenService = refreshTokenService;
    }
    async getEffectivePermissions(userId, contextTenantId) {
        const userWithRole = await this.identityUseCase.findUserWithPermissions(userId);
        if (!userWithRole)
            return [];
        const permissions = new Set();
        if (userWithRole?.roles) {
            userWithRole.roles.forEach((ur) => {
                const assignmentsTenantId = ur.tenantId || null;
                const isMatch = assignmentsTenantId === contextTenantId;
                if (isMatch && ur.role && ur.role.permissions) {
                    ur.role.permissions.forEach((rp) => {
                        if (rp.permission)
                            permissions.add(rp.permission.slug);
                    });
                }
            });
        }
        return Array.from(permissions);
    }
    async validateUser(email, pass) {
        const user = await this.identityUseCase.findUserByEmail(email);
        if (user && user.passwordHash && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user, rememberMe = false, ip, agent) {
        const effectivePermissions = await this.getEffectivePermissions(user.id, user.tenantId || null);
        if (!effectivePermissions || effectivePermissions.length === 0) {
            console.warn(`[AuthService] Login blocked for user ${user.email} due to zero permissions.`);
            throw new common_1.ForbiddenException({
                error: 'NO_ACCESS',
                message: 'Sizin üçün hələ heç bir icazə təyin edilməyib'
            });
        }
        const userWithRole = await this.identityUseCase.findUserWithPermissions(user.id);
        let roleNames = [];
        const contextTenantId = user.tenantId || null;
        if (userWithRole?.roles) {
            roleNames = userWithRole.roles
                .filter((ur) => (ur.tenantId || null) === contextTenantId)
                .map((ur) => ur.role?.name)
                .filter(Boolean);
        }
        const rtResult = await this.refreshTokenService.generateToken(user.id, ip, agent);
        const refreshToken = rtResult.token;
        const payload = {
            email: user.email,
            sub: user.id,
            tenantId: user.tenantId,
            roles: roleNames,
            isOwner: user.isOwner,
        };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const expiresIn = rememberMe ? '30d' : '7d';
        await this.identityUseCase.updateRefreshToken(user.id, refreshToken);
        const scope = user.tenantId ? 'TENANT' : 'SYSTEM';
        await this.permissionCache.setPermissions(user.id, effectivePermissions, user.tenantId, scope);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            expiresIn,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                roles: roleNames,
                isOwner: user.isOwner,
                permissions: effectivePermissions
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
        const user = await this.identityUseCase.findUserWithPermissions(userId);
        if (!user)
            throw new common_1.ForbiddenException('User Not Found');
        const roleNames = user.roles?.map((ur) => ur.role?.name) || [];
        const payload = {
            email: user.email,
            sub: user.id,
            tenantId: user.tenantId,
            roles: roleNames,
            isOwner: user.isOwner,
        };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        return {
            access_token: accessToken,
            refresh_token: rtResult.token,
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
        permission_cache_service_1.PermissionCacheService,
        redis_service_1.RedisService,
        refresh_token_service_1.RefreshTokenService])
], AuthService);
//# sourceMappingURL=auth.service.js.map