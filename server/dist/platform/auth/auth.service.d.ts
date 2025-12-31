import { IdentityUseCase } from '../identity/application/identity.usecase';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { RefreshTokenService } from './refresh-token.service';
export declare class AuthService {
    private identityUseCase;
    private jwtService;
    private redisService;
    private refreshTokenService;
    constructor(identityUseCase: IdentityUseCase, jwtService: JwtService, redisService: RedisService, refreshTokenService: RefreshTokenService);
    validateUser(email: string, pass: string): Promise<any>;
    issueTokenForScope(user: any, scopeType: string, scopeId: string | null): Promise<{
        access_token: string;
        user: {
            id: any;
            scopeType: string;
            scopeId: string | null;
        };
    }>;
    login(user: any, rememberMe?: boolean, ip?: string, agent?: string): Promise<{
        access_token: string;
        refresh_token: string;
        expiresIn: string;
        user: {
            id: any;
            email: any;
            fullName: any;
            isOwner: any;
            permissions: never[];
        };
    }>;
    refreshTokens(refreshToken: string, ip?: string, agent?: string): Promise<{
        access_token: string;
        refresh_token: any;
    }>;
    logout(refreshToken: string): Promise<void>;
    loginWithMfa(userId: string, token: string): Promise<{
        access_token: string;
        refresh_token: string;
        expiresIn: string;
        user: {
            id: any;
            email: any;
            fullName: any;
            isOwner: any;
            permissions: never[];
        };
    }>;
    impersonate(requesterId: string, targetUserId: string): Promise<{
        access_token: string;
        refresh_token: string;
        expiresIn: string;
        user: {
            id: any;
            email: any;
            fullName: any;
            isOwner: any;
            permissions: never[];
        };
    }>;
    revokeSessions(userId: string): Promise<void>;
}
