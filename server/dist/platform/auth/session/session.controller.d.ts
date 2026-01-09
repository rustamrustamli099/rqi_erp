import { SessionService } from './session.service';
import { SwitchContextDto } from './dto/switch-context.dto';
import { DecisionOrchestrator } from '../../decision/decision.orchestrator';
export declare class SessionController {
    private readonly sessionService;
    private readonly decisionOrchestrator;
    constructor(sessionService: SessionService, decisionOrchestrator: DecisionOrchestrator);
    getScopes(req: any): Promise<any>;
    getContext(req: any): Promise<{
        userId: any;
        scopeType: any;
        scopeId: any;
    }>;
    getBootstrap(req: any): Promise<any>;
    switchContext(req: any, dto: SwitchContextDto): Promise<{
        access_token: string;
        user: {
            id: any;
            scopeType: string;
            scopeId: string | null;
        };
    }>;
}
