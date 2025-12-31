import { PrismaService } from '../../../prisma.service';
import { AuthService } from '../auth.service';
import { SwitchContextDto } from './dto/switch-context.dto';
export declare class SessionService {
    private readonly prisma;
    private readonly authService;
    constructor(prisma: PrismaService, authService: AuthService);
    getAvailableScopes(userId: string): Promise<any>;
    switchContext(userId: string, target: SwitchContextDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            scopeType: string;
            scopeId: string | null;
        };
    }>;
}
