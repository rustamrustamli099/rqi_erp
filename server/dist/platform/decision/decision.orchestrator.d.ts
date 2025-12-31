import { EffectivePermissionsService } from '../auth/effective-permissions.service';
import { DecisionCenterService } from './decision-center.service';
import { MenuItem } from '../menu/menu.definition';
export declare class DecisionOrchestrator {
    private readonly effectivePermissionsService;
    private readonly decisionCenter;
    private readonly logger;
    constructor(effectivePermissionsService: EffectivePermissionsService, decisionCenter: DecisionCenterService);
    getNavigationForUser(user: any): Promise<MenuItem[]>;
    getSessionState(user: any): Promise<{
        navigation: MenuItem[];
        actions: string[];
        canonicalPath: string | null;
    }>;
}
