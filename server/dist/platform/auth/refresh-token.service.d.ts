import { PrismaService } from '../../prisma.service';
export declare class RefreshTokenService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateToken(userId: string, ip?: string, agent?: string, scopeType?: string, scopeId?: string | null, familyId?: string): Promise<{
        token: string;
        familyId: string;
        expiresAt: Date;
        userId: string;
    }>;
    rotateToken(incomingToken: string, ip?: string, agent?: string): Promise<{
        scopeType: string;
        scopeId: string | null;
        token: string;
        familyId: string;
        expiresAt: Date;
        userId: string;
    }>;
    revokeByToken(incomingToken: string): Promise<void>;
    revokeFamily(familyId: string, reason?: string): Promise<void>;
    cleanupExpired(): Promise<void>;
}
