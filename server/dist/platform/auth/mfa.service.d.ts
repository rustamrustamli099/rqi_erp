import { IdentityUseCase } from '../identity/application/identity.usecase';
import { PrismaService } from '../../prisma.service';
export declare class MfaService {
    private readonly prisma;
    private readonly identityUseCase;
    constructor(prisma: PrismaService, identityUseCase: IdentityUseCase);
    generateMfaSecret(user: any): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    generateQrCode(otpauthUrl: string): Promise<any>;
    verifyMfaToken(token: string, secret: string): boolean;
    enableMfaForUser(userId: string, secret: string): Promise<void>;
}
