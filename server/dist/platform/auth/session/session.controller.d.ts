import { SessionService } from './session.service';
import { SwitchContextDto } from './dto/switch-context.dto';
export declare class SessionController {
    private readonly sessionService;
    constructor(sessionService: SessionService);
    getScopes(req: any): Promise<any>;
    getContext(req: any): Promise<{
        userId: any;
        scopeType: any;
        scopeId: any;
    }>;
    switchContext(req: any, dto: SwitchContextDto): Promise<{
        access_token: string;
        user: {
            id: any;
            scopeType: string;
            scopeId: string | null;
        };
    }>;
}
