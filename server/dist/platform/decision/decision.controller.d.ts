import { DecisionOrchestrator } from './decision.orchestrator';
export declare class DecisionController {
    private readonly decisionOrchestrator;
    constructor(decisionOrchestrator: DecisionOrchestrator);
    getPageState(pageKey: string, req: any): Promise<{
        authorized: boolean;
        pageKey: string;
        sections: Record<string, boolean>;
        actions: Record<string, boolean>;
    } | {
        authorized: boolean;
        pageKey: string;
        sections: {};
        actions: {};
        error: string;
    }>;
}
