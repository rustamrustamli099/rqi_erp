import { Injectable, Logger } from '@nestjs/common';
import { EffectivePermissionsService } from '../auth/effective-permissions.service';
import { DecisionCenterService } from './decision-center.service';
import { ADMIN_MENU_TREE, MenuItem } from '../menu/menu.definition';

/**
 * DECISION ORCHESTRATOR
 * 
 * RESPONSIBILITY:
 * - Application Service Layer
 * - Binds Context + specialized Domain Services
 * - "The Glue"
 */
@Injectable()
export class DecisionOrchestrator {
    private readonly logger = new Logger(DecisionOrchestrator.name);

    constructor(
        private readonly effectivePermissionsService: EffectivePermissionsService,
        private readonly decisionCenter: DecisionCenterService
    ) { }

    /**
     * FULL ORCHESTRATION: Get Navigation for a User Context
     */
    async getNavigationForUser(user: any): Promise<MenuItem[]> {
        const { userId, scopeType, scopeId } = user;

        // 1. Get Contextual Permissions (DB Access)
        const permissions = await this.effectivePermissionsService.computeEffectivePermissions({
            userId,
            scopeType: scopeType || 'SYSTEM',
            scopeId: scopeId || null
        });

        // 2. Pass to Pure Decision Engine (Logic Only)
        // We inject the Tree Data here (Dependency Injection of Data)
        const navigationTree = this.decisionCenter.resolveNavigationTree(ADMIN_MENU_TREE, permissions);

        this.logger.debug(`Resolved Navigation for ${userId} in ${scopeType}:${scopeId} -> ${navigationTree.length} root items`);

        return navigationTree;
    }

    /**
     * FULL ORCHESTRATION: Get Complete Session State (Bootstrap)
     */
    async getSessionState(user: any) {
        const { userId, scopeType, scopeId } = user;

        // 1. Permissions
        const permissions = await this.effectivePermissionsService.computeEffectivePermissions({
            userId,
            scopeType: scopeType || 'SYSTEM',
            scopeId: scopeId || null
        });

        // 2. Navigation
        const navigation = this.decisionCenter.resolveNavigationTree(ADMIN_MENU_TREE, permissions);

        // 3. Actions
        const actions = this.decisionCenter.resolveActions(permissions);

        // 4. Canonical Path
        const canonicalPath = this.decisionCenter.getCanonicalPath(navigation);

        this.logger.debug(`Resolved State for ${userId}: ${navigation.length} menu items, ${actions.length} actions`);

        return {
            navigation,
            actions,
            canonicalPath
        };
    }
}
