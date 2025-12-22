import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class RefreshTokenService {
    private readonly logger = new Logger(RefreshTokenService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Generates a new refresh token family or rotates within one.
     * Returns: { token: string (id.secret), familyId: string, expiresAt: Date }
     */
    async generateToken(userId: string, ip?: string, agent?: string, familyId?: string) {
        const id = crypto.randomUUID();
        const secret = crypto.randomBytes(32).toString('hex');
        const tokenHash = await bcrypt.hash(secret, 10);

        // Expires in 7 days
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
            token: `${id}.${secret}`, // Format: ID.Secret
            familyId: newFamilyId,
            expiresAt,
            userId,
        };
    }

    /**
     * Rotates a token: Verifies old, checks reuse, issues new.
     */
    async rotateToken(incomingToken: string, ip?: string, agent?: string) {
        // 1. Parse Token
        if (!incomingToken || !incomingToken.includes('.')) {
            throw new UnauthorizedException('Invalid Token Format');
        }
        const [id, secret] = incomingToken.split('.');

        // 2. Find Record
        const record = await this.prisma.refreshToken.findUnique({
            where: { id }
        });

        if (!record) {
            // Token ID not found. Likely old/deleted or forged.
            throw new UnauthorizedException('Invalid Refresh Token');
        }

        // 3. Reuse Detection (Revoked?)
        if (record.revokedAt) {
            this.logger.warn(`Security: Refresh Token Reuse Detected! Family: ${record.familyId}, User: ${record.userId}, IP: ${ip}`);

            // REVOKE ENTIRE FAMILY
            await this.revokeFamily(record.familyId, 'Security: Reuse Detected');

            throw new UnauthorizedException('Security Alert: Token Reuse Detected. Please login again.');
        }

        // 4. Verify Secret
        const isValid = await bcrypt.compare(secret, record.tokenHash);
        if (!isValid) {
            throw new UnauthorizedException('Invalid Refresh Token Secret');
        }

        // 5. Check Expiry
        if (new Date() > record.expiresAt) {
            throw new UnauthorizedException('Token Expired');
        }

        // 6. Rotate: Revoke current & Issue new
        await this.prisma.refreshToken.update({
            where: { id },
            data: {
                revokedAt: new Date(),
                revokedReason: 'Rotated'
            }
        });

        return this.generateToken(record.userId, ip, agent, record.familyId);
    }

    async revokeByToken(incomingToken: string) {
        if (!incomingToken || !incomingToken.includes('.')) return;
        const [id] = incomingToken.split('.');
        const record = await this.prisma.refreshToken.findUnique({ where: { id } });
        if (record) {
            await this.revokeFamily(record.familyId, 'Logout');
        }
    }

    async revokeFamily(familyId: string, reason: string = 'Logout') {
        await this.prisma.refreshToken.updateMany({
            where: { familyId, revokedAt: null },
            data: { revokedAt: new Date(), revokedReason: reason }
        });
    }

    // Cleanup Job: Remove tokens expired > 30 days ago
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanupExpired() {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        const result = await this.prisma.refreshToken.deleteMany({
            where: { expiresAt: { lt: date } }
        });
        this.logger.log(`Cleaned up ${result.count} expired refresh tokens.`);
    }
}
