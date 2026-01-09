/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🛑 DEPRECATED — PHASE 14H 🛑
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * THIS FILE IS DEPRECATED.
 * 
 * Frontend simulation of permissions is BANNED per SAP PFCG compliance.
 * Permission simulation MUST be done on backend via:
 * - DecisionCenterService
 * - /api/v1/me/menu API
 * 
 * This file is preserved for reference only.
 * UI components MUST NOT use this file for authorization decisions.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// DEPRECATED ENGINE
// import { type MenuItem, PLATFORM_MENU, TENANT_MENU } from "@/app/navigation/menu.definitions"

interface MenuItem {
    id: string;
    // ... basic stub
}

export interface SimulationResult {
    visibleMenuIds: string[]
    accessibleRoutes: string[]
    deniedRoutes: string[]
    menuTree: MenuItem[]
}

export interface DiffResult {
    added: string[]
    removed: string[]
    common: string[]
}

/**
 * @deprecated PHASE 14H: Frontend simulation is BANNED.
 * Use backend /api/v1/me/menu or DecisionCenterService instead.
 */
export const SimulatorEngine = {
    /**
     * @deprecated Do NOT use in production. For testing/debugging only.
     */
    run: (_permissions: string[], _context: 'admin' | 'tenant' = 'admin'): SimulationResult => {
        console.error('[DEPRECATED] SimulatorEngine.run() is BANNED. Use backend API.');
        return {
            visibleMenuIds: [],
            accessibleRoutes: [],
            deniedRoutes: [],
            menuTree: []
        }
    },

    /**
     * @deprecated Do NOT use in production. For testing/debugging only.
     */
    diff: (_originalPerms: string[], _newPerms: string[], _context: 'admin' | 'tenant' = 'admin'): DiffResult => {
        console.error('[DEPRECATED] SimulatorEngine.diff() is BANNED. Use backend API.');
        return {
            added: [],
            removed: [],
            common: []
        }
    }
}
