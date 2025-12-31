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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const identity_usecase_1 = require("../identity/application/identity.usecase");
const redis_service_1 = require("../redis/redis.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    identityUseCase;
    redisService;
    constructor(identityUseCase, redisService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
        });
        this.identityUseCase = identityUseCase;
        this.redisService = redisService;
    }
    async validate(payload) {
        const revocationTime = await this.redisService.get(`auth:revoked:${payload.sub}`);
        if (revocationTime) {
            const revokedAt = parseInt(revocationTime, 10);
            const issuedAt = payload.iat;
            if (issuedAt && issuedAt < revokedAt) {
                throw new common_1.UnauthorizedException('Session revoked');
            }
        }
        if (!payload.scopeType) {
            throw new common_1.UnauthorizedException('Invalid Token: Missing Scope Context');
        }
        if (payload.scopeType === 'SYSTEM' && payload.scopeId) {
            throw new common_1.UnauthorizedException('Invalid Token: SYSTEM scope cannot have scopeId');
        }
        if (payload.scopeType === 'TENANT' && !payload.scopeId) {
            throw new common_1.UnauthorizedException('Invalid Token: TENANT scope requires valid scopeId');
        }
        const user = await this.identityUseCase.findUserByEmail(payload.email);
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        return {
            userId: payload.sub,
            email: payload.email,
            tenantId: payload.scopeId,
            scopeId: payload.scopeId,
            scopeType: payload.scopeType,
            isOwner: payload.isOwner
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [identity_usecase_1.IdentityUseCase,
        redis_service_1.RedisService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map