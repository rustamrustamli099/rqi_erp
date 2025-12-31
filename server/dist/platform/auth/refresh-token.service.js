"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RefreshTokenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const crypto = __importStar(require("crypto"));
const bcrypt = __importStar(require("bcrypt"));
const schedule_1 = require("@nestjs/schedule");
let RefreshTokenService = RefreshTokenService_1 = class RefreshTokenService {
    prisma;
    logger = new common_1.Logger(RefreshTokenService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateToken(userId, ip, agent, familyId) {
        const id = crypto.randomUUID();
        const secret = crypto.randomBytes(32).toString('hex');
        const tokenHash = await bcrypt.hash(secret, 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        const newFamilyId = familyId || crypto.randomUUID();
        await this.prisma.refreshToken.create({
            data: {
                id,
                userId,
                familyId: newFamilyId,
                tokenHash,
                expiresAt,
                createdByIp: ip,
                userAgent: agent,
            },
        });
        return {
            token: `${id}.${secret}`,
            familyId: newFamilyId,
            expiresAt,
            userId,
        };
    }
    async rotateToken(incomingToken, ip, agent) {
        if (!incomingToken || !incomingToken.includes('.')) {
            throw new common_1.UnauthorizedException('Invalid Token Format');
        }
        const [id, secret] = incomingToken.split('.');
        const record = await this.prisma.refreshToken.findUnique({
            where: { id }
        });
        if (!record) {
            throw new common_1.UnauthorizedException('Invalid Refresh Token');
        }
        if (record.revokedAt) {
            this.logger.warn(`Security: Refresh Token Reuse Detected! Family: ${record.familyId}, User: ${record.userId}, IP: ${ip}`);
            await this.revokeFamily(record.familyId, 'Security: Reuse Detected');
            throw new common_1.UnauthorizedException('Security Alert: Token Reuse Detected. Please login again.');
        }
        const isValid = await bcrypt.compare(secret, record.tokenHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid Refresh Token Secret');
        }
        if (new Date() > record.expiresAt) {
            throw new common_1.UnauthorizedException('Token Expired');
        }
        await this.prisma.refreshToken.update({
            where: { id },
            data: {
                revokedAt: new Date(),
                revokedReason: 'Rotated'
            }
        });
        return this.generateToken(record.userId, ip, agent, record.familyId);
    }
    async revokeByToken(incomingToken) {
        if (!incomingToken || !incomingToken.includes('.'))
            return;
        const [id] = incomingToken.split('.');
        const record = await this.prisma.refreshToken.findUnique({ where: { id } });
        if (record) {
            await this.revokeFamily(record.familyId, 'Logout');
        }
    }
    async revokeFamily(familyId, reason = 'Logout') {
        await this.prisma.refreshToken.updateMany({
            where: { familyId, revokedAt: null },
            data: { revokedAt: new Date(), revokedReason: reason }
        });
    }
    async cleanupExpired() {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        const result = await this.prisma.refreshToken.deleteMany({
            where: { expiresAt: { lt: date } }
        });
        this.logger.log(`Cleaned up ${result.count} expired refresh tokens.`);
    }
};
exports.RefreshTokenService = RefreshTokenService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RefreshTokenService.prototype, "cleanupExpired", null);
exports.RefreshTokenService = RefreshTokenService = RefreshTokenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RefreshTokenService);
//# sourceMappingURL=refresh-token.service.js.map