import { IdentityUseCase } from '../identity/application/identity.usecase';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { PermissionCacheService } from './permission-cache.service';
import { RefreshTokenService } from './refresh-token.service';
export declare class AuthService {
    private identityUseCase;
    private jwtService;
    private permissionCache;
    private redisService;
    private refreshTokenService;
    constructor(identityUseCase: IdentityUseCase, jwtService: JwtService, permissionCache: PermissionCacheService, redisService: RedisService, refreshTokenService: RefreshTokenService);
    getEffectivePermissions(userId: string, contextTenantId: string | null): Promise<string[]>;
    private canonicalizePermission;
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any, rememberMe?: boolean, ip?: string, agent?: string): Promise<{
        access_token: string;
        refresh_token: string;
        expiresIn: string;
        user: {
            id: any;
            email: any;
            fullName: any;
            roles: string[];
            isOwner: any;
            permissions: string[];
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
            roles: string[];
            isOwner: any;
            permissions: string[];
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
            roles: string[];
            isOwner: any;
            permissions: string[];
        };
    }>;
    revokeSessions(userId: string): Promise<void>;
}
