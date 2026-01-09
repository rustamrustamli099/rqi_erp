/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PHASE 14H: Menu Service (Thin Adapter)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RULE: MenuService is a THIN ADAPTER only.
 * It MUST NOT filter by permissions itself.
 * All visibility decisions MUST be delegated to DecisionCenterService.
 * 
 * ALLOWED:
 * - Fetch raw menu definition
 * - Delegate to DecisionCenterService for filtering
 * 
 * FORBIDDEN:
 * - permissions.includes()
 * - Any visibility decision logic
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Injectable } from '@nestjs/common';
import { MenuItem } from './menu.definition';
import { DecisionCenterService } from '../decision/decision-center.service';

@Injectable()
export class MenuService {

    constructor(
        private readonly decisionCenter: DecisionCenterService
    ) { }

    /**
     * PHASE 14H: Filters menu using DecisionCenterService ONLY.
     * This method is a thin adapter - NO permission logic allowed here.
     * 
     * @param menuItems The full menu tree
     * @param permissions User's effective permissions
     * @returns Filtered menu tree (from DecisionCenterService)
     */
    filterMenu(menuItems: MenuItem[], permissions: string[]): MenuItem[] {
        // DELEGATE to DecisionCenterService - SINGLE DECISION CENTER
        return this.decisionCenter.resolveNavigationTree(menuItems, permissions);
    }
}
