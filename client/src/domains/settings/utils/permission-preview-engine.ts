/**
 * SAP-Grade Permission Preview Engine
 * 
 * Uses TAB_SUBTAB_REGISTRY as Single Source of Truth
 * EXACT permission matching only - NO startsWith/prefix
 */

import { TAB_SUBTAB_REGISTRY, getFirstAllowedTab, buildLandingPath } from "@/app/navigation/tabSubTab.registry";

export interface PreviewResult {
    visibleMenuIds: string[];
    visibleTabs: Record<string, string[]>;
    visibleRoutes: string[];
    firstAllowedRoute: string | null;
    riskFlags: string[];
    stats: {
        totalMenus: number;
        visibleMenus: number;
        accessibleTabs: number;
    }
}

const RISKY_ACTIONS = ['delete', 'export', 'impersonate', 'manage', 'execute', 'approve'];

/**
 * Normalize permission to base form (remove action suffix)
 */
function normalizeToBase(perm: string): string {
    const parts = perm.split('.');
    const lastPart = parts[parts.length - 1];
    const actions = ['read', 'create', 'update', 'delete', 'export', 'approve', 'manage'];
    if (actions.includes(lastPart)) {
        return parts.slice(0, -1).join('.');
    }
    return perm;
}

/**
 * Check if user has EXACT permission (base match)
 */
function hasExactPermission(required: string, userPerms: string[]): boolean {
    const reqBase = normalizeToBase(required);
    return userPerms.some(p => normalizeToBase(p) === reqBase);
}

/**
 * SAP-Grade Deterministic Permission Engine
 * Uses TAB_SUBTAB_REGISTRY - EXACT matching only
 */
export function calculateUserAccess(userPermissions: string[]): PreviewResult {
    const visibleMenuIds: Set<string> = new Set();
    const visibleRoutes: Set<string> = new Set();
    const visibleTabs: Record<string, string[]> = {};
    const riskFlags: Set<string> = new Set();

    let totalMenus = 0;
    let accessibleTabs = 0;

    // Check for risky permissions
    for (const perm of userPermissions) {
        const parts = perm.split('.');
        const action = parts[parts.length - 1];
        if (RISKY_ACTIONS.includes(action)) {
            riskFlags.add(perm);
        }
    }

    // Process admin pages
    const adminPages = TAB_SUBTAB_REGISTRY.admin;

    for (const page of adminPages) {
        totalMenus++;

        // Check if ANY tab is accessible
        const allowedTabs: string[] = [];

        for (const tab of page.tabs) {
            const hasTabAccess = tab.requiredAnyOf.some(p => hasExactPermission(p, userPermissions));

            if (hasTabAccess) {
                allowedTabs.push(`tab=${tab.key}`);
                accessibleTabs++;

                // Check subTabs
                if (tab.subTabs) {
                    for (const subTab of tab.subTabs) {
                        const hasSubTabAccess = subTab.requiredAnyOf.some(p => hasExactPermission(p, userPermissions));
                        if (hasSubTabAccess) {
                            allowedTabs.push(`tab=${tab.key}&subTab=${subTab.key}`);
                        }
                    }
                }
            }
        }

        if (allowedTabs.length > 0) {
            visibleMenuIds.add(page.pageKey);
            visibleRoutes.add(page.basePath);
            visibleTabs[page.basePath] = allowedTabs;
        }
    }

    // Determine first allowed route
    let firstAllowedRoute: string | null = null;

    for (const page of adminPages) {
        if (visibleMenuIds.has(page.pageKey)) {
            const firstTab = getFirstAllowedTab(page.pageKey, userPermissions, 'admin');
            if (firstTab) {
                firstAllowedRoute = buildLandingPath(page.basePath, firstTab);
            } else {
                firstAllowedRoute = page.basePath;
            }
            break;
        }
    }

    return {
        visibleMenuIds: Array.from(visibleMenuIds),
        visibleTabs,
        visibleRoutes: Array.from(visibleRoutes),
        firstAllowedRoute,
        riskFlags: Array.from(riskFlags),
        stats: {
            totalMenus,
            visibleMenus: visibleMenuIds.size,
            accessibleTabs
        }
    };
}
