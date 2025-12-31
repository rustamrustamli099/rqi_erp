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
    /**
     * Generates a new refresh token family or rotates within one.
     * Returns: { token: string (id.secret.scopeType.scopeId), familyId: string, expiresAt: Date }
     */
    async generateToken(userId: string, ip?: string, agent?: string, scopeType: string = 'SYSTEM', scopeId: string | null = null, familyId?: string) {
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

        // Embed scope in token string: ID.Secret.ScopeType.ScopeId
        const safeScopeId = scopeId || 'null';
        const tokenString = `${id}.${secret}.${scopeType}.${safeScopeId}`;

        return {
            token: tokenString,
            familyId: newFamilyId,
            expiresAt,
            userId,
        };
    }

    /**
     * Rotates a token: Verifies old, checks reuse, issues new.
     * Returns: { token, familyId, expiresAt, userId, scopeType, scopeId }
     */
    async rotateToken(incomingToken: string, ip?: string, agent?: string) {
        // 1. Parse Token
        if (!incomingToken || !incomingToken.includes('.')) {
            throw new UnauthorizedException('Invalid Token Format');
        }

        // Parsing: ID.Secret.ScopeType.ScopeId
        const parts = incomingToken.split('.');
        if (parts.length < 2) throw new UnauthorizedException('Invalid Token Format');

        const id = parts[0];
        const secret = parts[1];

        // Scope Preservation (Backwards compatibility for old tokens: Default to SYSTEM)
        const scopeType = parts[2] || 'SYSTEM';
        const rawScopeId = parts[3] || 'null';
        const scopeId = rawScopeId === 'null' ? null : rawScopeId;

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

        const newTok = await this.generateToken(record.userId, ip, agent, scopeType, scopeId, record.familyId);

        return {
            ...newTok,
            scopeType,
            scopeId
        };
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
