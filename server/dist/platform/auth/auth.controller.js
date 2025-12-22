"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const mfa_service_1 = require("./mfa.service");
const passport_1 = require("@nestjs/passport");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
let AuthController = class AuthController {
    authService;
    mfaService;
    constructor(authService, mfaService) {
        this.authService = authService;
        this.mfaService = mfaService;
    }
    async login(req, response) {
        if (req.user.isMfaEnabled) {
            return { mfaRequired: true, userId: req.user.id };
        }
        const rememberMe = req.body.rememberMe === true;
        const ip = req.ip;
        const agent = req.headers['user-agent'];
        const loginResult = await this.authService.login(req.user, rememberMe, ip, agent);
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
        return { access_token, user: loginResult.user };
    }
    async logout(req, response) {
        const refreshToken = req.cookies['Refresh'];
        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }
        response.clearCookie('Refresh', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });
        response.cookie('Refresh', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 0
        });
        return { message: 'Logged out successfully' };
    }
    async verifyMfaLogin(body, response) {
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
    async refresh(req, response) {
        const refreshToken = req.cookies['Refresh'];
        if (!refreshToken)
            throw new common_1.UnauthorizedException('No Refresh Token found');
        const ip = req.ip;
        const agent = req.headers['user-agent'];
        const result = await this.authService.refreshTokens(refreshToken, ip, agent);
        const { access_token, refresh_token: newRefreshToken } = result;
        response.cookie('Refresh', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return { access_token };
    }
    async generateMfa(req) {
        return this.mfaService.generateMfaSecret(req.user);
    }
    async enableMfa(req, body) {
        const isValid = this.mfaService.verifyMfaToken(body.token, body.secret);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid Token');
        }
        await this.mfaService.enableMfaForUser(req.user.userId, body.secret);
        return { message: 'MFA Enabled' };
    }
    async register(createUserDto) {
        return { message: 'Use UsersService to register' };
    }
    getProfile(req) {
        return req.user;
    }
    async getMe(req) {
        const effectivePermissions = await this.authService.getEffectivePermissions(req.user.userId || req.user.sub, req.user.tenantId || null);
        return {
            ...req.user,
            permissions: effectivePermissions
        };
    }
    async impersonate(req, body, response) {
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
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('local')),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('mfa/verify'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyMfaLogin", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('mfa/generate'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "generateMfa", null);
__decorate([
    (0, common_1.Post)('mfa/enable'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "enableMfa", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.Post)('impersonate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "impersonate", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        mfa_service_1.MfaService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map