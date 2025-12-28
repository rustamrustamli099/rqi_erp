/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MENU DEFINITIONS — GENERATED FROM FROZEN REGISTRY
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SAP-GRADE RULES:
 * 1. Sidebar contains ONLY PAGE ENTRIES (no tabs, no subTabs)
 * 2. MenuItem is visible if user has AT LEAST ONE allowed tab
 * 3. NO prefix matching
 * 4. NO embedded permissions - all from TAB_SUBTAB_REGISTRY
 * 
 * This file is GENERATED from TAB_SUBTAB_REGISTRY - do not edit manually!
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { TAB_SUBTAB_REGISTRY, type PageConfig } from '@/app/navigation/tabSubTab.registry';

// =============================================================================
// TYPES
// =============================================================================

export interface MenuItem {
    id: string;
    label: string;
    title?: string;
    icon?: string;
    path: string;
    route?: string;
    pageKey: string;  // Used to lookup in registry
    tab?: string;     // Legacy compat for default tab
    permissionPrefixes?: string[];  // Legacy compat
}

export type AdminMenuItem = MenuItem;

// =============================================================================
// GENERATOR FUNCTION
// =============================================================================

/**
 * SAP-GRADE: Generate sidebar items from TAB_SUBTAB_REGISTRY.
 * 
 * Rules:
 * 1. One sidebar item per page
 * 2. NO permissions embedded - visibility computed at runtime
 * 3. NO prefix matching
 */
function generateMenuFromRegistry(pages: PageConfig[]): MenuItem[] {
    return pages.map(page => ({
        id: page.pageKey.split('.').pop() || page.pageKey,
        label: page.labelAz,
        title: page.label,
        icon: page.icon,
        path: page.basePath,
        route: page.basePath,
        pageKey: page.pageKey
    }));
}

// =============================================================================
// EXPORTS - GENERATED FROM FROZEN REGISTRY
// =============================================================================

/**
 * ADMIN PANEL MENU (SYSTEM scope)
 * Generated from TAB_SUBTAB_REGISTRY.admin
 */
export const PLATFORM_MENU: MenuItem[] = generateMenuFromRegistry(
    TAB_SUBTAB_REGISTRY.admin
);

/**
 * TENANT PANEL MENU (TENANT scope)
 * Generated from TAB_SUBTAB_REGISTRY.tenant
 */
export const TENANT_MENU: MenuItem[] = generateMenuFromRegistry(
    TAB_SUBTAB_REGISTRY.tenant
);

// =============================================================================
// DEBUG HELPER
// =============================================================================

export function debugPrintMenus(): void {
    if (import.meta.env?.DEV) {
        console.log('[MenuDefinitions] PLATFORM_MENU:', PLATFORM_MENU);
        console.log('[MenuDefinitions] TENANT_MENU:', TENANT_MENU);
    }
}
