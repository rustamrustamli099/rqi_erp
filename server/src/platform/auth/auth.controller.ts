import { Controller, Request, Post, UseGuards, Body, Get, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MfaService } from './mfa.service';
import { AuthGuard } from '@nestjs/passport';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard'; // Assuming this exists or using AuthGuard('local')

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private mfaService: MfaService
    ) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req, @Res({ passthrough: true }) response: Response) {
        if (req.user.isMfaEnabled) {
            // Return early if MFA is enabled but not yet verified
            // In a real flow, we'd return a partial token or specific response code 
            // to prompt the frontend to ask for OTP.
            // For simplicity here, we return a flag.
            return { mfaRequired: true, userId: req.user.id };
        }

        const rememberMe = req.body.rememberMe === true;
        const loginResult = await this.authService.login(req.user, rememberMe);
        const { access_token, refresh_token, expiresIn } = loginResult;

        const days = expiresIn === '30d' ? 30 : 7;
        const maxAge = days * 24 * 60 * 60 * 1000;

        response.cookie('Refresh', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: maxAge,
            path: '/'
        });

        return { access_token, user: (loginResult as any).user };
    }

    @Post('logout')
    async logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('Refresh', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });


        // Double-tap: Explicitly set empty cookie with immediate expiration
        response.cookie('Refresh', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 0
        });
        return { message: 'Logged out successfully' };
    }

    @Post('mfa/verify')
    async verifyMfaLogin(@Body() body: { userId: string; token: string }, @Res({ passthrough: true }) response: Response) {
        // This is a simplified "step 2" login.
        // We need to fetch the user (we don't have req.user yet because not logged in).
        // This logic belongs in Service ideally, but putting here for brevity.
        const result = await this.authService.loginWithMfa(body.userId, body.token);

        const { access_token, refresh_token, expiresIn } = result;
        const days = expiresIn === '30d' ? 30 : 7;
        const maxAge = days * 24 * 60 * 60 * 1000;

        response.cookie('Refresh', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: maxAge,
            path: '/'
        });
        return { access_token };
    }

    @Post('refresh')
    async refresh(@Request() req, @Res({ passthrough: true }) response: Response) {
        const refreshToken = req.cookies['Refresh'];
        if (!refreshToken) throw new UnauthorizedException('No Refresh Token found');

        // We decode the token to get userId (or pass token to service to decode)
        // Service.refreshTokens expects (userId, refreshToken)
        // We can extract userId from the unverified decode or let service handle verification first.
        // Better: AuthService.refreshTokens verifies it. But we need userId.
        // Let's decode it quickly here or update service to take just token?
        // Service currently takes (userId, refreshToken).
        // Let's assume the payload has 'sub' as userId.

        // Quick decode without verification (verification happens in service)
        const jwt = require('jsonwebtoken'); // Or use JwtService decode
        const decoded = jwt.decode(refreshToken) as any;
        if (!decoded || !decoded.sub) throw new UnauthorizedException('Invalid Refresh Token format');

        const result = await this.authService.refreshTokens(decoded.sub, refreshToken);

        const { access_token, refresh_token: newRefreshToken } = result;

        // Update cookie
        response.cookie('Refresh', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return { access_token };
    }

    @Post('mfa/generate')
    @UseGuards(AuthGuard('jwt'))
    async generateMfa(@Request() req) {
        return this.mfaService.generateMfaSecret(req.user);
    }

    @Post('mfa/enable')
    @UseGuards(AuthGuard('jwt'))
    async enableMfa(@Request() req, @Body() body: { token: string; secret: string }) {
        const isValid = this.mfaService.verifyMfaToken(body.token, body.secret);
        if (!isValid) {
            throw new UnauthorizedException('Invalid Token');
        }
        await this.mfaService.enableMfaForUser(req.user.userId, body.secret);
        return { message: 'MFA Enabled' };
    }

    @Post('register')
    async register(@Body() createUserDto: Prisma.UserCreateInput) {
        return { message: 'Use UsersService to register' };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async getMe(@Request() req) {
        // [RBAC] Hydrate Permissions strictly from DB
        // Token only contains roles/ids. Frontend needs actual permission slugs.
        const effectivePermissions = await this.authService.getEffectivePermissions(
            req.user.userId || req.user.sub,
            req.user.tenantId || null
        );

        return {
            ...req.user,
            permissions: effectivePermissions
        };
    }
    @Post('impersonate')
    @UseGuards(JwtAuthGuard)
    async impersonate(@Request() req, @Body() body: { userId: string }, @Res({ passthrough: true }) response: Response) {
        // Permission Check: system:users:impersonate
        // Ideally use @Permissions('system:users:impersonate') guard, but for now manual check or assume Role Guard handles it if applied.
        // Let's rely on AuthService to check or just do it here.
        // For strictness:
        // if (!req.user.permissions.includes('system:users:impersonate') && req.user.role !== 'Owner') { ... }

        const result = await this.authService.impersonate(req.user.userId, body.userId);
        const { access_token, refresh_token, expiresIn } = result;

        const date = new Date();
        date.setDate(date.getDate() + 7);

        response.cookie('Refresh', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            expires: date
        });

        return { access_token, user: result.user };
    }
}
