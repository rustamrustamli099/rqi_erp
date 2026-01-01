import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { DecisionOrchestrator } from './decision.orchestrator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ACTION_PERMISSIONS_REGISTRY } from './action.registry';

/**
 * PHASE 14G: Page State Controller
 * 
 * Exposes Decision Center output per page.
 * Single source of truth for UI action rendering.
 * 
 * Endpoint: GET /api/v1/decision/page-state/:pageKey
 */
@Controller('decision')
@UseGuards(JwtAuthGuard)
export class DecisionController {
    constructor(
        private readonly decisionOrchestrator: DecisionOrchestrator
    ) { }

    /**
     * GET /decision/page-state/:pageKey
     * 
     * Returns resolved page state for a specific page.
     * UI MUST use this as the ONLY source for action visibility.
     * 
     * Response:
     * {
     *   authorized: boolean,
     *   sections: Record<string, boolean>,
     *   actions: Record<string, boolean>
     * }
     */
    @Get('page-state/:pageKey')
    async getPageState(
        @Param('pageKey') pageKey: string,
        @Req() req: any
    ) {
        // 1. Get session state (cached)
        const sessionState = await this.decisionOrchestrator.getSessionState(req.user);
        const userActions = sessionState.actions; // string[] of permission slugs
        const actionSet = new Set(userActions);

        // 2. Map page key to entity key (e.g., Z_USERS -> users)
        const entityKey = this.mapPageKeyToEntity(pageKey);

        // 3. Get actions for this entity from registry
        const entityConfig = ACTION_PERMISSIONS_REGISTRY.find(e => e.entityKey === entityKey);

        // 4. Build actions map: { GS_USERS_CREATE: true/false }
        const actions: Record<string, boolean> = {};

        if (entityConfig) {
            for (const action of entityConfig.actions) {
                // Generate semantic key: GS_{ENTITY}_{ACTION}
                const semanticKey = `GS_${entityKey.toUpperCase()}_${action.actionKey.toUpperCase()}`;
                actions[semanticKey] = actionSet.has(action.permissionSlug);
            }
        }

        return {
            authorized: true, // If user reached here, page is authorized
            pageKey,
            sections: {}, // Future: section-level visibility
            actions
        };
    }

    /**
     * Map page authorization object key to entity key
     */
    private mapPageKeyToEntity(pageKey: string): string {
        const mapping: Record<string, string> = {
            'Z_USERS': 'users',
            'Z_ROLES': 'roles',
            'Z_CURATORS': 'curators',
            // Add more mappings as needed
        };
        return mapping[pageKey] || pageKey.toLowerCase().replace('z_', '');
    }
}
