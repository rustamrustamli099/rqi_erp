import { Module, Global, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { IdentityModule } from '../identity/identity.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { MfaService } from './mfa.service';
import { PermissionsService } from './permission.service';
import { PermissionCacheService } from './permission-cache.service';
import { RefreshTokenService } from './refresh-token.service';
import { EffectivePermissionsService } from './effective-permissions.service';
import { CachedEffectivePermissionsService } from './cached-effective-permissions.service';

import { PrismaService } from '../../prisma.service';
import { MenuService } from '../menu/menu.service';
import { MenuModule } from '../menu/menu.module';
import { CacheModule } from '../cache/cache.module';

@Global()
@Module({
  imports: [
    forwardRef(() => IdentityModule),
    PassportModule,
    forwardRef(() => MenuModule), // Needed for PermissionsService (circular dependency risk? MenuService needs what? MenuDefinition is static)
    CacheModule, // PHASE 10.2: For CachedEffectivePermissionsService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'super-secret-key-change-in-production',
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, MfaService, PrismaService, PermissionsService, RefreshTokenService, EffectivePermissionsService, CachedEffectivePermissionsService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PermissionsService, RefreshTokenService, EffectivePermissionsService, CachedEffectivePermissionsService],
})
export class AuthModule { }
