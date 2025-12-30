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
 * SAP LAW (VISIBILITY vs DEFAULT ROUTING):
 * - VISIBILITY: Order-independent. Parent visible if ANY child allowed.
 * - DEFAULT ROUTING: May use first-allowed ONLY when URL missing/invalid.
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
// Core Permission Check - EXACT MATCH ONLY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if user has ANY of the required permissions (EXACT match)
 * NO inference, NO normalization
 */
export function hasAnyPermission(userPerms: string[], requiredAnyOf: string[]): boolean {
    if (!requiredAnyOf || requiredAnyOf.length === 0) return false;
    return requiredAnyOf.some(perm => userPerms.includes(perm));
}

// ═══════════════════════════════════════════════════════════════════════════
// VISIBILITY HELPERS (ORDER-INDEPENDENT)
// SAP Law: parent.visible = self.allowed OR ANY(child.visible)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if a tab is VISIBLE to user (ORDER-INDEPENDENT)
 * SAP Law: Tab visible if self.allowed OR ANY(subTab.allowed)
 */
export function isTabVisible(tab: TabConfig, userPerms: string[]): boolean {
    // Self allowed?
    if (hasAnyPermission(userPerms, tab.requiredAnyOf)) {
        return true;
    }

    // Any child allowed? (recursive)
    if (tab.subTabs && tab.subTabs.length > 0) {
        return tab.subTabs.some(subTab => isSubTabVisible(subTab, userPerms));
    }

    return false;
}

/**
 * Check if a subTab is VISIBLE to user (ORDER-INDEPENDENT)
 */
export function isSubTabVisible(subTab: SubTabConfig, userPerms: string[]): boolean {
    return hasAnyPermission(userPerms, subTab.requiredAnyOf);
}

/**
 * Check if ANY tab is visible for a page (ORDER-INDEPENDENT)
 */
export function hasAnyVisibleTab(pageKey: string, userPerms: string[], context: 'admin' | 'tenant' = 'admin'): boolean {
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page?.tabs) return false;

    // SAP: ANY tab visible = page visible (order-independent)
    return page.tabs.some(tab => isTabVisible(tab, userPerms));
}

// ═══════════════════════════════════════════════════════════════════════════
// ALLOWED ITEMS GETTERS (for UI rendering)
// Uses visibility helpers internally
// ═══════════════════════════════════════════════════════════════════════════

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
 * Get all VISIBLE tabs for a page (ORDER-INDEPENDENT)
 * Uses isTabVisible internally - no order dependence
 */
export function getAllowedTabs(
    pageKey: string,
    userPerms: string[],
    context: 'admin' | 'tenant' = 'admin'
): AllowedTab[] {
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page?.tabs) return [];

    // SAP: Filter using visibility helper (order-independent)
    return page.tabs
        .filter(tab => isTabVisible(tab, userPerms))
        .map(tab => ({ key: tab.key, label: tab.label }));
}

/**
 * Get all VISIBLE subTabs for a tab (ORDER-INDEPENDENT)
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

    // SAP: Filter using visibility helper (order-independent)
    return tab.subTabs
        .filter(st => isSubTabVisible(st, userPerms))
        .map(st => ({ key: st.key, label: st.label }));
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT ROUTING (may use first-allowed)
// ONLY for selecting fallback when URL is missing/invalid
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get DEFAULT target URL for a page (uses first-allowed)
 * 
 * NOTE: This is for DEFAULT ROUTING only, NOT visibility.
 * Visibility is computed by isTabVisible/getAllowedTabs (order-independent).
 */
export function getFirstAllowedTarget(
    pageKey: string,
    userPerms: string[],
    context: 'admin' | 'tenant' = 'admin'
): string | null {
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page) return null;

    // Get all visible tabs (order-independent visibility check)
    const visibleTabs = getAllowedTabs(pageKey, userPerms, context);
    if (visibleTabs.length === 0) return null;

    // DEFAULT: Select first from visible list (for routing, not visibility)
    const defaultTab = visibleTabs[0];
    const visibleSubTabs = getAllowedSubTabs(pageKey, defaultTab.key, userPerms, context);

    if (visibleSubTabs.length > 0) {
        return `${page.basePath}?tab=${defaultTab.key}&subTab=${visibleSubTabs[0].key}`;
    }

    return `${page.basePath}?tab=${defaultTab.key}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE EVALUATION (SINGLE DECISION POINT)
// Separates: 1) Visibility 2) Validation 3) Default routing
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Evaluate route and return decision (SINGLE DECISION POINT)
 * 
 * SAP Law Separation:
 * 1. VISIBILITY: Computed via isTabVisible (order-independent)
 * 2. VALIDATION: Check if requested tab/subTab is in visible list
 * 3. DEFAULT: Select first-allowed ONLY if tab/subTab missing or invalid
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

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: VISIBILITY CHECK (order-independent)
    // ═══════════════════════════════════════════════════════════════════════
    const visibleTabs = getAllowedTabs(pageKey, userPerms, context);

    // DENY: Zero visible tabs
    if (visibleTabs.length === 0) {
        return { decision: 'DENY', reason: `No visible tabs for page: ${pageKey}` };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: VALIDATE requested tab
    // ═══════════════════════════════════════════════════════════════════════
    const requestedTab = searchParams.get('tab');
    const isTabValid = requestedTab && visibleTabs.some(t => t.key === requestedTab);

    // If tab missing or invalid → use default (first visible)
    const targetTab = isTabValid ? requestedTab : visibleTabs[0].key;

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 3: VALIDATE requested subTab
    // ═══════════════════════════════════════════════════════════════════════
    const visibleSubTabs = getAllowedSubTabs(pageKey, targetTab, userPerms, context);
    const requestedSubTab = searchParams.get('subTab');

    let targetSubTab: string | null = null;
    if (visibleSubTabs.length > 0) {
        const isSubTabValid = requestedSubTab && visibleSubTabs.some(st => st.key === requestedSubTab);
        // If subTab missing or invalid → use default (first visible)
        targetSubTab = isSubTabValid ? requestedSubTab : visibleSubTabs[0].key;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 4: BUILD normalized URL (preserve other params)
    // ═══════════════════════════════════════════════════════════════════════
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
    const otherParamsStr = otherParams.toString();
    if (otherParamsStr) {
        normalizedUrl += `&${otherParamsStr}`;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 5: DECIDE - redirect only if tab/subTab changed
    // ═══════════════════════════════════════════════════════════════════════
    const needsRedirect =
        requestedTab !== targetTab ||
        (targetSubTab && requestedSubTab !== targetSubTab);

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


