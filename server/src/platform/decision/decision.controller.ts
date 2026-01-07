import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { DecisionOrchestrator } from './decision.orchestrator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ACTION_PERMISSIONS_REGISTRY } from './action.registry';
import { PAGE_OBJECTS_REGISTRY, getPageObject } from './page-objects.registry';

/**
 * PHASE 14H: Page State Controller (SAP PFCG Compliant)
 * 
 * Exposes Decision Center output per page.
 * Single source of truth for UI action rendering.
 * 
 * CRITICAL RULES:
 * 1. authorized is COMPUTED from Z_* Page Object READ permission
 * 2. Missing Z_* object = HARD DENY (authorized: false)
 * 3. Actions map to GS_* semantic keys
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
     *   authorized: boolean,  // COMPUTED from Z_* READ permission
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

        // 2. Get Z_* Page Object from registry
        const pageObject = getPageObject(pageKey);

        // 3. HARD DENY if page not registered (SAP T-Code semantics)
        if (!pageObject) {
            console.warn(`[PAGE-STATE] HARD DENY: Page ${pageKey} not registered in PAGE_OBJECTS_REGISTRY`);
            return {
                authorized: false,
                pageKey,
                sections: {},
                actions: {},
                error: 'PAGE_NOT_REGISTERED'
            };
        }

        // 4. Compute authorized from READ permission (ACTVT=03)
        const authorized = actionSet.has(pageObject.readPermission);

        // 5. Build sections map (AND logic for required permissions)
        const sections: Record<string, boolean> = {};
        if (pageObject.sections) {
            for (const section of pageObject.sections) {
                // AND logic: all required permissions must be present
                sections[section.key] = section.requiredPermissions.every(
                    perm => actionSet.has(perm)
                );
            }
        }

        // 6. Get actions for this entity from action registry
        const entityConfig = ACTION_PERMISSIONS_REGISTRY.find(e => e.entityKey === pageObject.entityKey);

        // 7. Build actions map: { GS_USERS_CREATE: true/false }
        const actions: Record<string, boolean> = {};
        if (entityConfig) {
            for (const action of entityConfig.actions) {
                // Generate semantic key: GS_{ENTITY}_{ACTION}
                const semanticKey = `GS_${pageObject.entityKey.toUpperCase()}_${action.actionKey.toUpperCase()}`;
                actions[semanticKey] = actionSet.has(action.permissionSlug);
            }
        }

        const result = {
            authorized, // COMPUTED, not hardcoded
            pageKey,
            sections,
            actions
        };

        // DEBUG: Log response
        console.log('[PAGE-STATE] Response for', pageKey, ':', JSON.stringify(result, null, 2));

        return result;
    }
}
