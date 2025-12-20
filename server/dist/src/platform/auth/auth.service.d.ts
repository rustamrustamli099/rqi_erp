import { IdentityUseCase } from '../identity/application/identity.usecase';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { PermissionCacheService } from './permission-cache.service';
export declare class AuthService {
    private identityUseCase;
    private jwtService;
    private permissionCache;
    private redisService;
    constructor(identityUseCase: IdentityUseCase, jwtService: JwtService, permissionCache: PermissionCacheService, redisService: RedisService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any, rememberMe?: boolean): Promise<{
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
    refreshTokens(userId: string, refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
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
