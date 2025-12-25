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

import { PrismaService } from '../../prisma.service';
import { MenuService } from '../menu/menu.service';
import { MenuModule } from '../menu/menu.module';

@Global()
@Module({
  imports: [
    forwardRef(() => IdentityModule),
    PassportModule,
    MenuModule, // Needed for PermissionsService (circular dependency risk? MenuService needs what? MenuDefinition is static)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'super-secret-key-change-in-production',
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, MfaService, PrismaService, PermissionsService, PermissionCacheService, RefreshTokenService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PermissionsService, PermissionCacheService, RefreshTokenService],
})
export class AuthModule { }
