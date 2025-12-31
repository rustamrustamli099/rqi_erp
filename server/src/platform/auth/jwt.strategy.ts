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
        // Strictly require scopeId for TENANT.
        if (payload.scopeType === 'TENANT' && !payload.scopeId) {
            throw new UnauthorizedException('Invalid Token: TENANT scope requires valid scopeId');
        }

        // 4. Validate Identity Only (IdentityUseCase might fetch other things, but we just verify existence)
        // Note: we can optimize this to just check if user exists via ID if needed, but existing method is fine.
        const user = await this.identityUseCase.findUserById(payload.sub);
        if (!user) {
            throw new UnauthorizedException();
        }

        // RETURN: Strict SAP-Grade Context Object
        return {
            userId: payload.sub,
            scopeType: payload.scopeType,
            scopeId: payload.scopeId || null
        };
    }
}
