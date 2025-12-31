import { Strategy } from 'passport-jwt';
import { IdentityUseCase } from '../identity/application/identity.usecase';
import { RedisService } from '../redis/redis.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithoutRequest] | [opt: import("passport-jwt").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private identityUseCase;
    private redisService;
    constructor(identityUseCase: IdentityUseCase, redisService: RedisService);
    validate(payload: any): Promise<{
        userId: any;
        email: any;
        tenantId: any;
        scopeId: any;
        scopeType: any;
        isOwner: any;
    }>;
}
export {};
