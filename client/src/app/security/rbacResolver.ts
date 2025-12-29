/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade RBAC Resolver
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SINGLE SOURCE OF TRUTH: TAB_SUBTAB_REGISTRY
 * 
 * Rules:
 * 1. EXACT permission match only
 * 2. NO startsWith/prefix matching
 * 3. NO synthetic .access permissions
 * 4. Flicker-free: redirect to allowed tab if exists
 * 5. Terminal 403 ONLY if zero allowed tabs
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    TAB_SUBTAB_REGISTRY,
    getPageByPath,
    type PageConfig,
    type TabConfig
} from '@/app/navigation/tabSubTab.registry';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface ResolvedLocation {
    pathname: string;
    search: string;
}

export interface Terminal403 {
    terminal403: true;
    reason: string;
}

export type SafeLocationResult = ResolvedLocation | Terminal403;

// ═══════════════════════════════════════════════════════════════════════════
// Permission Normalization
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Normalize raw permissions to a Set for fast lookup.
 * ONLY verb aliasing allowed (view → read).
 * NO synthetic permissions, NO parent inference.
 */
export function normalizePermissions(rawPerms: string[]): Set<string> {
    const normalized = new Set<string>();

    for (const perm of rawPerms) {
        normalized.add(perm);

        // Verb aliasing: .view → .read (for legacy compatibility)
        if (perm.endsWith('.view')) {
            normalized.add(perm.replace('.view', '.read'));
        }

        // Action normalization: write actions imply read
        const writeActions = ['.create', '.update', '.delete', '.approve', '.export'];
        for (const action of writeActions) {
            if (perm.endsWith(action)) {
                const basePerm = perm.slice(0, -action.length) + '.read';
                normalized.add(basePerm);
            }
        }
    }

    return normalized;
}

// ═══════════════════════════════════════════════════════════════════════════
// Page Key Resolution
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get pageKey from pathname.
 * Returns null if page not in registry.
 */
export function getPageKeyFromPath(pathname: string, context: 'admin' | 'tenant' = 'admin'): string | null {
    const page = getPageByPath(pathname, context);
    return page?.pageKey || null;
}

// ═══════════════════════════════════════════════════════════════════════════
// Allowed Tabs/SubTabs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if user has ANY of the required permissions (exact match).
 */
function hasAnyPermission(perms: Set<string>, requiredAnyOf: string[]): boolean {
    if (!requiredAnyOf || requiredAnyOf.length === 0) return true;
    return requiredAnyOf.some(p => perms.has(p));
}

/**
 * Get allowed tabs for a page (exact permission match).
 */
export function getAllowedTabs(params: {
    pageKey: string;
    perms: Set<string>;
    context?: 'admin' | 'tenant';
}): string[] {
    const { pageKey, perms, context = 'admin' } = params;
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page || !page.tabs) return [];

    return page.tabs
        .filter(tab => hasAnyPermission(perms, tab.requiredAnyOf))
        .map(tab => tab.key);
}

/**
 * Get allowed subTabs for a tab (exact permission match).
 */
export function getAllowedSubTabs(params: {
    pageKey: string;
    tabKey: string;
    perms: Set<string>;
    context?: 'admin' | 'tenant';
}): string[] {
    const { pageKey, tabKey, perms, context = 'admin' } = params;
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const page = pages.find(p => p.pageKey === pageKey);

    if (!page || !page.tabs) return [];

    const tab = page.tabs.find(t => t.key === tabKey);
    if (!tab || !tab.subTabs) return [];

    return tab.subTabs
        .filter(st => hasAnyPermission(perms, st.requiredAnyOf))
        .map(st => st.key);
}

// ═══════════════════════════════════════════════════════════════════════════
// Safe Location Resolution (Flicker-Free)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Resolve safe location for navigation.
 * - If user has allowed tab → redirect to it (no 403)
 * - If zero allowed tabs → terminal 403
 */
export function resolveSafeLocation(params: {
    pathname: string;
    search: string;
    perms: Set<string>;
    context?: 'admin' | 'tenant';
}): SafeLocationResult {
    const { pathname, search, perms, context = 'admin' } = params;

    const basePath = pathname.split('?')[0];
    const searchParams = new URLSearchParams(search);
    const currentTab = searchParams.get('tab');
    const currentSubTab = searchParams.get('subTab');

    const pageKey = getPageKeyFromPath(basePath, context);

    // Not in registry - allow (let ProtectedRoute handle with props)
    if (!pageKey) {
        return { pathname, search };
    }

    const allowedTabs = getAllowedTabs({ pageKey, perms, context });

    // TERMINAL 403: No allowed tabs at all
    if (allowedTabs.length === 0) {
        return {
            terminal403: true,
            reason: `No allowed tabs for page: ${pageKey}`
        };
    }

    const firstAllowedTab = allowedTabs[0];

    // No tab specified → redirect to first allowed
    if (!currentTab) {
        const allowedSubTabs = getAllowedSubTabs({ pageKey, tabKey: firstAllowedTab, perms, context });
        const subTabParam = allowedSubTabs.length > 0 ? `&subTab=${allowedSubTabs[0]}` : '';
        return {
            pathname: basePath,
            search: `?tab=${firstAllowedTab}${subTabParam}`
        };
    }

    // Tab not allowed → redirect to first allowed (NO FLICKER)
    if (!allowedTabs.includes(currentTab)) {
        const allowedSubTabs = getAllowedSubTabs({ pageKey, tabKey: firstAllowedTab, perms, context });
        const subTabParam = allowedSubTabs.length > 0 ? `&subTab=${allowedSubTabs[0]}` : '';
        return {
            pathname: basePath,
            search: `?tab=${firstAllowedTab}${subTabParam}`
        };
    }

    // Tab is allowed, check subTab if present
    if (currentSubTab) {
        const allowedSubTabs = getAllowedSubTabs({ pageKey, tabKey: currentTab, perms, context });

        if (allowedSubTabs.length > 0 && !allowedSubTabs.includes(currentSubTab)) {
            // SubTab not allowed → redirect to first allowed subTab
            return {
                pathname: basePath,
                search: `?tab=${currentTab}&subTab=${allowedSubTabs[0]}`
            };
        }
    }

    // All good - return as-is
    return { pathname, search };
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper: Is terminal 403 result?
// ═══════════════════════════════════════════════════════════════════════════

export function isTerminal403(result: SafeLocationResult): result is Terminal403 {
    return 'terminal403' in result && result.terminal403 === true;
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper: Build URL from safe location
// ═══════════════════════════════════════════════════════════════════════════

export function buildUrl(location: ResolvedLocation): string {
    return `${location.pathname}${location.search}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// evaluateNavigation - Main API for ProtectedRoute
// ═══════════════════════════════════════════════════════════════════════════

export type NavigationDecision =
    | { decision: 'allow' }
    | { decision: 'redirect'; redirectTo: string }
    | { decision: 'deny'; reason: string };

/**
 * Evaluate navigation and return decision.
 * This is the SINGLE entry point for route guards.
 */
export function evaluateNavigation(params: {
    pathname: string;
    search: string;
    perms: Set<string>;
    context?: 'admin' | 'tenant';
}): NavigationDecision {
    const result = resolveSafeLocation(params);

    if (isTerminal403(result)) {
        return { decision: 'deny', reason: result.reason };
    }

    const currentUrl = `${params.pathname}${params.search}`;
    const safeUrl = buildUrl(result);

    if (currentUrl !== safeUrl) {
        return { decision: 'redirect', redirectTo: safeUrl };
    }

    return { decision: 'allow' };
}

// ═══════════════════════════════════════════════════════════════════════════
// firstAllowedTarget - For sidebar links
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get the first allowed target URL for a page.
 * Used for sidebar item links.
 */
export function firstAllowedTarget(params: {
    pageKey: string;
    basePath: string;
    perms: Set<string>;
    context?: 'admin' | 'tenant';
}): string | null {
    const { pageKey, basePath, perms, context = 'admin' } = params;
    const allowedTabs = getAllowedTabs({ pageKey, perms, context });

    if (allowedTabs.length === 0) return null;

    const firstTab = allowedTabs[0];
    const allowedSubTabs = getAllowedSubTabs({ pageKey, tabKey: firstTab, perms, context });

    if (allowedSubTabs.length > 0) {
        return `${basePath}?tab=${firstTab}&subTab=${allowedSubTabs[0]}`;
    }

    return `${basePath}?tab=${firstTab}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// resolvePageByPath - Get page config from path
// ═══════════════════════════════════════════════════════════════════════════

export function resolvePageByPath(pathname: string, context: 'admin' | 'tenant' = 'admin'): PageConfig | null {
    return getPageByPath(pathname, context) ?? null;
}

