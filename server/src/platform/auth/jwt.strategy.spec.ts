import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { IdentityUseCase } from '../identity/application/identity.usecase';
import { RedisService } from '../redis/redis.service';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy (SAP Phase 7 Strictness)', () => {
    let strategy: JwtStrategy;
    let identityUseCase: any;
    let redisService: any;

    const mockIdentityUseCase = { findUserById: jest.fn() };
    const mockRedisService = { get: jest.fn() };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                { provide: IdentityUseCase, useValue: mockIdentityUseCase },
                { provide: RedisService, useValue: mockRedisService },
                { provide: 'SECRET_KEY', useValue: 'test_secret' } // Mock config inject? JwtStrategy uses ConfigService usually or process.env
            ],
        })
            .useMocker((token) => {
                if (token === 'ConfigService') return { get: () => 'secret' };
            })
            .compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
        identityUseCase = module.get<IdentityUseCase>(IdentityUseCase);
    });

    it('should REJECT missing scopeType', async () => {
        await expect(strategy.validate({ sub: 'u1' }))
            .rejects.toThrow(UnauthorizedException);
    });

    it('should REJECT SYSTEM with scopeId', async () => {
        await expect(strategy.validate({ sub: 'u1', scopeType: 'SYSTEM', scopeId: 'xyz' }))
            .rejects.toThrow(UnauthorizedException);
    });

    it('should REJECT TENANT without scopeId', async () => {
        await expect(strategy.validate({ sub: 'u1', scopeType: 'TENANT', scopeId: null }))
            .rejects.toThrow(UnauthorizedException);
    });

    it('should ALLOW valid SYSTEM token', async () => {
        mockIdentityUseCase.findUserById.mockResolvedValue({ id: 'u1' });
        const result = await strategy.validate({ sub: 'u1', scopeType: 'SYSTEM' });
        expect(result).toEqual({ userId: 'u1', scopeType: 'SYSTEM', scopeId: null });
    });

    it('should ALLOW valid TENANT token', async () => {
        mockIdentityUseCase.findUserById.mockResolvedValue({ id: 'u1' });
        const result = await strategy.validate({ sub: 'u1', scopeType: 'TENANT', scopeId: 't1' });
        expect(result).toEqual({ userId: 'u1', scopeType: 'TENANT', scopeId: 't1' });
    });
});
