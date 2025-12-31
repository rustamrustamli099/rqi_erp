import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { IdentityUseCase } from '../identity/application/identity.usecase';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class MfaService {
    constructor(private readonly prisma: PrismaService, private readonly identityUseCase: IdentityUseCase) { }

    async generateMfaSecret(user: any) {
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(user.email, 'Antigravity ERP', secret);

        return {
            secret,
            otpauthUrl,
        };
    }

    async generateQrCode(otpauthUrl: string) {
        return toDataURL(otpauthUrl);
    }

    verifyMfaToken(token: string, secret: string) {
        return authenticator.verify({
            token,
            secret,
        });
    }

    async enableMfaForUser(userId: string, secret: string) {
        const user = await this.identityUseCase.findUserById(userId);
        await this.identityUseCase.enableMfa(userId, secret);
    }
}
