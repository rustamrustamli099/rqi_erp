import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { IdentityModule } from '../identity/identity.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { MfaService } from './mfa.service';
import { PermissionService } from './permission.service';
import { PermissionCacheService } from './permission-cache.service';

import { PrismaService } from '../../prisma.service';

@Global()
@Module({
  imports: [
    IdentityModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'super-secret-key-change-in-production',
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, MfaService, PrismaService, PermissionService, PermissionCacheService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PermissionService, PermissionCacheService],
})
export class AuthModule { }
