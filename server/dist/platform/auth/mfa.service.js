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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MfaService = void 0;
const common_1 = require("@nestjs/common");
const otplib_1 = require("otplib");
const qrcode_1 = require("qrcode");
const identity_usecase_1 = require("../identity/application/identity.usecase");
const prisma_service_1 = require("../../prisma.service");
let MfaService = class MfaService {
    prisma;
    identityUseCase;
    constructor(prisma, identityUseCase) {
        this.prisma = prisma;
        this.identityUseCase = identityUseCase;
    }
    async generateMfaSecret(user) {
        const secret = otplib_1.authenticator.generateSecret();
        const otpauthUrl = otplib_1.authenticator.keyuri(user.email, 'Antigravity ERP', secret);
        return {
            secret,
            otpauthUrl,
        };
    }
    async generateQrCode(otpauthUrl) {
        return (0, qrcode_1.toDataURL)(otpauthUrl);
    }
    verifyMfaToken(token, secret) {
        return otplib_1.authenticator.verify({
            token,
            secret,
        });
    }
    async enableMfaForUser(userId, secret) {
        const user = await this.identityUseCase.findUserById(userId);
        await this.identityUseCase.enableMfa(userId, secret);
    }
};
exports.MfaService = MfaService;
exports.MfaService = MfaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, identity_usecase_1.IdentityUseCase])
], MfaService);
//# sourceMappingURL=mfa.service.js.map