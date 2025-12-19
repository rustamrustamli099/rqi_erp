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

        const user = await this.identityUseCase.findUserByEmail(payload.email);
        if (!user) {
            throw new UnauthorizedException();
        }
        return { userId: payload.sub, email: payload.email, tenantId: payload.tenantId, role: payload.role };
    }
}
