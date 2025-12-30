/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade Navigation Resolver (SINGLE DECISION POINT)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RULES:
 * 1. EXACT permission match ONLY
 * 2. NO startsWith, NO includes, NO prefix matching
 * 3. NO action-verb stripping (no .read inference from .create/.update)
 * 4. NO synthetic permissions
 * 
 * This is the SINGLE SOURCE for navigation authorization decisions.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { TAB_SUBTAB_REGISTRY, type PageConfig, type TabConfig, type SubTabConfig } from '@/app/navigation/tabSubTab.registry';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type RouteDecision =
    | { decision: 'ALLOW'; normalizedUrl: string }
    | { decision: 'REDIRECT'; normalizedUrl: string }
    | { decision: 'DENY'; reason: string };

export interface AllowedTab {
    key: string;
    label: string;
}

export interface AllowedSubTab {
    key: string;
    label: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Core Functions - EXACT MATCH ONLY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if user has ANY of the required permissions (EXACT match)
 * NO inference, NO normalization
 */
function hasAnyPermission(userPerms: string[], requiredAnyOf: string[]): boolean {
    if (!requiredAnyOf || requiredAnyOf.length === 0) return true;
    return requiredAnyOf.some(perm => userPerms.includes(perm));
}

/**
 * Resolve pageKey from pathname using registry (EXACT path match)
 */
export function resolvePageByPath(
    pathname: string,
    context: 'admin' | 'tenant' = 'admin'
): string | null {
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const basePath = pathname.split('?')[0];

    const page = pages.find(p => p.basePath === basePath);
    return page?.pageKey ?? null;
}

/**
 * Get allowed tabs for a page (EXACT permission match)
 */
export function getAllowedTabs(
    pageKey: string,
    userPerms: string[],
    context: 'admin' | 'tenant' = 'admin'
): AllowedTab[] {
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page?.tabs) return [];

    return page.tabs
        .filter(tab => hasAnyPermission(userPerms, tab.requiredAnyOf))
        .map(tab => ({ key: tab.key, label: tab.label }));
}

/**
 * Get allowed subTabs for a tab (EXACT permission match)
 */
export function getAllowedSubTabs(
    pageKey: string,
    tabKey: string,
    userPerms: string[],
    context: 'admin' | 'tenant' = 'admin'
): AllowedSubTab[] {
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page?.tabs) return [];

    const tab = page.tabs.find(t => t.key === tabKey);
    if (!tab?.subTabs) return [];

    return tab.subTabs
        .filter(st => hasAnyPermission(userPerms, st.requiredAnyOf))
        .map(st => ({ key: st.key, label: st.label }));
}

/**
 * Get first allowed target URL for a page
 */
export function getFirstAllowedTarget(
    pageKey: string,
    userPerms: string[],
    context: 'admin' | 'tenant' = 'admin'
): string | null {
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page) return null;

    const allowedTabs = getAllowedTabs(pageKey, userPerms, context);
    if (allowedTabs.length === 0) return null;

    const firstTab = allowedTabs[0];
    const allowedSubTabs = getAllowedSubTabs(pageKey, firstTab.key, userPerms, context);

    if (allowedSubTabs.length > 0) {
        return `${page.basePath}?tab=${firstTab.key}&subTab=${allowedSubTabs[0].key}`;
    }

    return `${page.basePath}?tab=${firstTab.key}`;
}

/**
 * Evaluate route and return decision (SINGLE DECISION POINT)
 * 
 * Rules:
 * - Tab missing/unauthorized + other tabs allowed → REDIRECT
 * - SubTab missing/unauthorized + other subTabs allowed → REDIRECT
 * - Zero allowed tabs → DENY
 */
export function evaluateRoute(
    pathname: string,
    searchParams: URLSearchParams,
    userPerms: string[],
    context: 'admin' | 'tenant' = 'admin'
): RouteDecision {
    const basePath = pathname.split('?')[0];
    const pageKey = resolvePageByPath(pathname, context);

    // Unknown page - DENY for admin areas
    if (!pageKey) {
        if (basePath.startsWith('/admin') || basePath.startsWith('/tenant')) {
            return { decision: 'DENY', reason: 'Page not in registry' };
        }
        // Public route - allow as-is
        return { decision: 'ALLOW', normalizedUrl: pathname };
    }

    const allowedTabs = getAllowedTabs(pageKey, userPerms, context);

    // DENY: Zero allowed tabs
    if (allowedTabs.length === 0) {
        return { decision: 'DENY', reason: `No allowed tabs for page: ${pageKey}` };
    }

    const currentTab = searchParams.get('tab');
    const currentSubTab = searchParams.get('subTab');

    // Tab handling
    const validTab = currentTab && allowedTabs.some(t => t.key === currentTab);
    const targetTab = validTab ? currentTab : allowedTabs[0].key;

    // SubTab handling
    const allowedSubTabs = getAllowedSubTabs(pageKey, targetTab, userPerms, context);
    let targetSubTab: string | null = null;

    if (allowedSubTabs.length > 0) {
        const validSubTab = currentSubTab && allowedSubTabs.some(st => st.key === currentSubTab);
        targetSubTab = validSubTab ? currentSubTab : allowedSubTabs[0].key;
    }

    // Build normalized URL - preserve other query params (pagination, etc)
    const otherParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
        if (key !== 'tab' && key !== 'subTab') {
            otherParams.append(key, value);
        }
    });

    let normalizedUrl = `${basePath}?tab=${targetTab}`;
    if (targetSubTab) {
        normalizedUrl += `&subTab=${targetSubTab}`;
    }
    // Append other params
    const otherParamsStr = otherParams.toString();
    if (otherParamsStr) {
        normalizedUrl += `&${otherParamsStr}`;
    }

    // Check if redirect needed - only compare tab/subTab, not other params
    const currentTabValue = searchParams.get('tab');
    const currentSubTabValue = searchParams.get('subTab');

    const needsRedirect =
        currentTabValue !== targetTab ||
        (targetSubTab && currentSubTabValue !== targetSubTab);

    if (needsRedirect) {
        return { decision: 'REDIRECT', normalizedUrl };
    }

    return { decision: 'ALLOW', normalizedUrl };
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper: Get page config by path
// ═══════════════════════════════════════════════════════════════════════════

export function getPageConfig(
    pathname: string,
    context: 'admin' | 'tenant' = 'admin'
): PageConfig | null {
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const basePath = pathname.split('?')[0];
    return pages.find(p => p.basePath === basePath) ?? null;
}

