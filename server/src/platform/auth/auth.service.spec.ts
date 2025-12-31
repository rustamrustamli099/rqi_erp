import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { IdentityUseCase } from '../identity/application/identity.usecase';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { RefreshTokenService } from './refresh-token.service';

describe('AuthService (SAP Phase 7 Strictness)', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let refreshTokenService: any;
  let identityUseCase: any;

  const mockIdentityUseCase = {
    findUserByEmail: jest.fn(),
    updateRefreshToken: jest.fn(),
    findUserWithPermissions: jest.fn(),
    findUserById: jest.fn()
  };
  const mockJwtService = { sign: jest.fn() };
  const mockRedisService = { set: jest.fn(), get: jest.fn() };
  const mockRefreshTokenService = {
    generateToken: jest.fn(),
    rotateToken: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: IdentityUseCase, useValue: mockIdentityUseCase },
        { provide: JwtService, useValue: mockJwtService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: RefreshTokenService, useValue: mockRefreshTokenService }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
    identityUseCase = module.get<IdentityUseCase>(IdentityUseCase);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should issue token with SYSTEM scope by default (stateless, no inference)', async () => {
      const user = { id: 'u1', email: 'test@test.com' };

      // Mock RT generation to return SYSTEM scope
      mockRefreshTokenService.generateToken.mockResolvedValue({ token: 'rt_token' });
      // Mock JWT
      mockJwtService.sign.mockReturnValue('access_token');

      const result = await service.login(user);

      // Expect RefreshToken generated with SYSTEM scope
      expect(mockRefreshTokenService.generateToken).toHaveBeenCalledWith('u1', undefined, undefined, 'SYSTEM', null);

      // Expect Access Token signed with SYSTEM scope
      expect(mockJwtService.sign).toHaveBeenCalledWith(expect.objectContaining({
        sub: 'u1',
        scopeType: 'SYSTEM',
        scopeId: null
      }), expect.any(Object));

      // Result user should NOT have permissions
      expect(result.user.permissions).toHaveLength(0);
    });
  });

  describe('issueTokenForScope', () => {
    it('should create strictly scoped payload', async () => {
      const user = { id: 'u1', email: 'test@test.com' };
      await service.issueTokenForScope(user, 'TENANT', 't1');

      expect(mockJwtService.sign).toHaveBeenCalledWith(expect.objectContaining({
        sub: 'u1',
        scopeType: 'TENANT',
        scopeId: 't1'
        // NO permissions, roles, tenantId (unless purely mapped) checking for absence is hard in 'objectContaining', 
        // but we verify presence of Required fields. 
      }), expect.any(Object));
    });
  });

  describe('refreshTokens', () => {
    it('should preserve scope from rotated token', async () => {
      const user = { id: 'u1' };

      // Mock Rotate to return preserved scope
      mockRefreshTokenService.rotateToken.mockResolvedValue({
        userId: 'u1',
        token: 'new_rt',
        scopeType: 'TENANT',
        scopeId: 't1'
      });
      mockIdentityUseCase.findUserById.mockResolvedValue(user);

      await service.refreshTokens('old_rt');

      // Should issue new AT with same scope
      expect(mockJwtService.sign).toHaveBeenCalledWith(expect.objectContaining({
        scopeType: 'TENANT',
        scopeId: 't1'
      }), expect.any(Object));
    });
  });
});
