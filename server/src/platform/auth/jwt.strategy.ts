import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IdentityUseCase } from '../identity/application/identity.usecase';

import { RedisService } from '../redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private identityUseCase: IdentityUseCase,
        private redisService: RedisService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
        });
    }

    async validate(payload: any) {
        // [SECURITY] Check for Session Revocation (Immediate logout / Role change)
        const revocationTime = await this.redisService.get(`auth:revoked:${payload.sub}`);
        if (revocationTime) {
            const revokedAt = parseInt(revocationTime, 10);
            const issuedAt = payload.iat; // standard JWT claim

            // If token was issued BEFORE the revocation timestamp, reject it.
            if (issuedAt && issuedAt < revokedAt) {
                throw new UnauthorizedException('Session revoked');
            }
        }

        // [STRICT] PHASE 7: SCOPE VALIDATION
        // 1. Missing scopeType -> 401
        if (!payload.scopeType) {
            throw new UnauthorizedException('Invalid Token: Missing Scope Context');
        }

        // 2. SYSTEM scope invalidation
        if (payload.scopeType === 'SYSTEM' && payload.scopeId) {
            throw new UnauthorizedException('Invalid Token: SYSTEM scope cannot have scopeId');
        }

        // 3. TENANT scope validation
        if (payload.scopeType === 'TENANT' && !payload.scopeId) {
            throw new UnauthorizedException('Invalid Token: TENANT scope requires valid scopeId');
        }

        const user = await this.identityUseCase.findUserByEmail(payload.email);
        if (!user) {
            throw new UnauthorizedException();
        }

        return {
            userId: payload.sub,
            email: payload.email,
            tenantId: payload.scopeId, // Forward compatibility
            scopeId: payload.scopeId,
            scopeType: payload.scopeType,
            isOwner: payload.isOwner
        };
    }
}
