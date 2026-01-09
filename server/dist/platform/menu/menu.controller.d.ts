import { DecisionOrchestrator } from '../decision/decision.orchestrator';
export declare class MenuController {
    private readonly decisionOrchestrator;
    constructor(decisionOrchestrator: DecisionOrchestrator);
    getMyMenu(req: any): Promise<{
        menu: any;
    }>;
}
