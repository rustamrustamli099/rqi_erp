import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MfaService } from './mfa.service';
import { EffectivePermissionsService } from './effective-permissions.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {};
  const mockMfaService = {};
  const mockEffectivePermissionsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: MfaService, useValue: mockMfaService },
        { provide: EffectivePermissionsService, useValue: mockEffectivePermissionsService }
      ]
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
