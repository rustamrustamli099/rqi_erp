import { DecisionOrchestrator } from './decision.orchestrator';
export declare class DecisionController {
    private readonly decisionOrchestrator;
    constructor(decisionOrchestrator: DecisionOrchestrator);
    getPageState(pageKey: string, req: any): Promise<{
        authorized: boolean;
        pageKey: string;
        sections: {};
        actions: Record<string, boolean>;
    }>;
    private mapPageKeyToEntity;
}
