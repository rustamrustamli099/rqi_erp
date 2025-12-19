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
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    identityUseCase;
    jwtService;
    permissionCache;
    redisService;
    constructor(identityUseCase, jwtService, permissionCache, redisService) {
        this.identityUseCase = identityUseCase;
        this.jwtService = jwtService;
        this.permissionCache = permissionCache;
        this.redisService = redisService;
    }
    async validateUser(email, pass) {
        const user = await this.identityUseCase.findUserByEmail(email);
        if (user && user.passwordHash && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user, rememberMe = false) {
        const userWithRole = await this.identityUseCase.findUserWithPermissions(user.id);
        if (!userWithRole) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const permissions = new Set();
        const roleNames = [];
        if (userWithRole?.roles) {
            userWithRole.roles.forEach((ur) => {
                if (ur.role) {
                    roleNames.push(ur.role.name);
                    if (ur.role.permissions) {
                        ur.role.permissions.forEach((rp) => {
                            if (rp.permission)
                                permissions.add(rp.permission.slug);
                        });
                    }
                }
            });
        }
        const effectivePermissions = Array.from(permissions);
        const familyId = crypto.randomUUID();
        const payload = {
            email: user.email,
            sub: user.id,
            tenantId: user.tenantId,
            roles: roleNames,
            familyId
        };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const expiresIn = rememberMe ? '30d' : '7d';
        const refreshToken = this.jwtService.sign(payload, { expiresIn });
        await this.redisService.set(`rt_family:${user.id}:${familyId}`, JSON.stringify({ current: refreshToken, valid: true }), rememberMe ? 86400 * 30 : 86400 * 7);
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
                permissions: effectivePermissions
            }
        };
    }
    async refreshTokens(userId, refreshToken) {
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken);
        }
        catch (e) {
            throw new common_1.ForbiddenException('Invalid Token');
        }
        const familyId = payload.familyId;
        if (!familyId) {
            throw new common_1.ForbiddenException('Legacy Token - Please Login Again');
        }
        const familyKey = `rt_family:${userId}:${familyId}`;
        const familyStateStr = await this.redisService.get(familyKey);
        if (!familyStateStr) {
            throw new common_1.ForbiddenException('Session Expired');
        }
        const familyState = JSON.parse(familyStateStr);
        if (!familyState.valid) {
            await this.revokeSessions(userId);
            throw new common_1.ForbiddenException('Refresh Token Reuse Detected - Account Locked');
        }
        if (familyState.current !== refreshToken) {
            await this.redisService.set(familyKey, JSON.stringify({ ...familyState, valid: false }), 86400);
            await this.revokeSessions(userId);
            throw new common_1.ForbiddenException('Security Alert: Token Reuse Detected');
        }
        const user = await this.identityUseCase.findUserWithPermissions(userId);
        if (!user)
            throw new common_1.ForbiddenException('User Not Found');
        const newPayload = {
            email: user.email,
            sub: user.id,
            tenantId: user.tenantId,
            roles: user.roles?.map((ur) => ur.role?.name) || [],
            familyId
        };
        const accessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
        const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });
        await this.redisService.set(familyKey, JSON.stringify({ current: newRefreshToken, valid: true }), 86400 * 7);
        await this.identityUseCase.updateRefreshToken(user.id, newRefreshToken);
        return {
            access_token: accessToken,
            refresh_token: newRefreshToken,
        };
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
        redis_service_1.RedisService])
], AuthService);
//# sourceMappingURL=auth.service.js.map