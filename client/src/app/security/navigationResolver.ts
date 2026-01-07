/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade Navigation Resolver (SINGLE DECISION POINT)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ⚠️ PHASE 14H ARCHITECTURAL NOTE ⚠️
 * This file provides ROUTING decisions only (redirect, allow, deny).
 * UI AUTHORIZATION decisions must come from usePageState() via backend.
 * 
 * ALLOWED: Route evaluation, sidebar rendering, default path selection.
 * BANNED: Action visibility decisions in UI components.
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
import {
    getEntityActionConfig,
    type ActionContext,
} from '@/app/navigation/action.registry';

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
 * 
 * @internal DO NOT USE IN UI COMPONENTS - Use resolveNavigationTree() instead
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
 * 
 * @internal DO NOT USE IN UI COMPONENTS - Use resolveNavigationTree() instead
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

// ═══════════════════════════════════════════════════════════════════════════
// RESOLVED NAV TREE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Action visibility state as determined by decision center
 */
export type ActionState = 'enabled' | 'disabled' | 'hidden';

/**
 * Resolved action with visibility state
 */
export interface ResolvedAction {
    actionKey: string;
    permissionSlug: string;
    label: string;
    contexts: ActionContext[];
    state: ActionState;
}

/**
 * Result of action visibility resolution
 * Grouped by context for efficient UI consumption
 */
export interface ResolvedActions {
    /** Entity this resolution is for */
    entityKey: string;
    scope: 'system' | 'tenant';

    /** All actions with resolved states */
    actions: ResolvedAction[];

    /** Actions grouped by context (precomputed for UI) */
    byContext: {
        toolbar: ResolvedAction[];
        row: ResolvedAction[];
        form: ResolvedAction[];
        bulk: ResolvedAction[];
        nav: ResolvedAction[];
    };
}

export interface ResolvedNavNode {
    id: string;
    label: string;
    icon?: string;
    pageKey?: string;
    tabKey?: string;
    subTabKey?: string;
    path: string;
    children?: ResolvedNavNode[];
    /**
     * SAP-GRADE ACTION VISIBILITY
     * Resolved actions for this context (leaf or container)
     * Embedded directly in navigation tree - SINGLE SOURCE OF TRUTH
     */
    actions?: ResolvedActions;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESOLVE NAVIGATION TREE (SINGLE CANONICAL DECISION OUTPUT)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * SAP-GRADE: Build complete navigation tree using resolver
 * 
 * This is the ONLY canonical decision output for navigation.
 * Sidebar and all navigation consumers MUST use this function.
 * 
 * @param context - 'admin' or 'tenant'
 * @param permissions - User's flat permission array
 * @returns ResolvedNavNode[] - Complete navigation tree
 */
// ═══════════════════════════════════════════════════════════════════════════
// INTERNAL ACTION RESOLVER (NOT EXPORTED)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Internal helper to resolve actions for a specific context key.
 * Used ONLY by resolveNavigationTree.
 */
function resolveActionsInternal(
    entityKey: string,
    scope: 'system' | 'tenant',
    permissionSet: Set<string>
): ResolvedActions | undefined {
    // Get entity action config from registry
    const entityConfig = getEntityActionConfig(entityKey, scope);

    // If no config found, return undefined (no actions for this node)
    if (!entityConfig) {
        return undefined;
    }

    // Initialize result structure
    const result: ResolvedActions = {
        entityKey,
        scope,
        actions: [],
        byContext: {
            toolbar: [],
            row: [],
            form: [],
            bulk: [],
            nav: [],
        }
    };

    // Evaluate each action - ORDER INDEPENDENT
    for (const actionDef of entityConfig.actions) {
        // EXACT string match - SAP PFCG rule
        const hasPermission = permissionSet.has(actionDef.permissionSlug);

        // Policy: unauthorized => hidden
        const state: ActionState = hasPermission ? 'enabled' : 'hidden';

        const resolvedAction: ResolvedAction = {
            actionKey: actionDef.actionKey,
            permissionSlug: actionDef.permissionSlug,
            label: actionDef.label,
            contexts: actionDef.contexts,
            state,
        };

        // Add to main list
        result.actions.push(resolvedAction);

        // Add to context-specific lists
        for (const context of actionDef.contexts) {
            result.byContext[context].push(resolvedAction);
        }
    }

    return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESOLVE NAVIGATION TREE (SINGLE CANONICAL DECISION OUTPUT)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * SAP-GRADE: Build complete navigation tree using resolver
 * 
 * This is the ONLY canonical decision output for navigation.
 * Sidebar and all navigation consumers MUST use this function.
 * 
 * @param context - 'admin' or 'tenant'
 * @param permissions - User's flat permission array
 * @returns ResolvedNavNode[] - Complete navigation tree
 */
export function resolveNavigationTree(
    context: 'admin' | 'tenant',
    permissions: string[],
    actionScope: 'system' | 'tenant'
): ResolvedNavNode[] {
    const pages = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;
    const result: ResolvedNavNode[] = [];

    // Optimize permission lookup once
    const permissionSet = new Set(permissions);

    for (const page of pages) {
        // Check if page has any visible content
        if (!hasAnyVisibleTab(page.pageKey, permissions, context)) {
            continue;
        }

        // Get resolved path for page (default routing)
        const pagePath = getFirstAllowedTarget(page.pageKey, permissions, context) || page.basePath;

        // Build tab children
        const tabChildren: ResolvedNavNode[] = [];
        for (const tab of page.tabs) {
            // Check if tab is visible (SAP: self OR any subTab)
            if (!isTabVisible(tab, permissions)) continue;

            // Get allowed subTabs for this tab
            const allowedSubTabs = getAllowedSubTabs(page.pageKey, tab.key, permissions, context);

            // Build subTab children
            const subTabChildren: ResolvedNavNode[] = allowedSubTabs.map(subTab => ({
                id: `${page.pageKey}.${tab.key}.${subTab.key}`,
                label: subTab.label,
                tabKey: tab.key,
                subTabKey: subTab.key,
                path: `${page.basePath}?tab=${tab.key}&subTab=${subTab.key}`,
                // Resolve Actions for SubTab Context
                actions: resolveActionsInternal(subTab.key, actionScope, permissionSet)
            }));

            // Determine tab path
            let tabPath = `${page.basePath}?tab=${tab.key}`;
            if (subTabChildren.length > 0) {
                tabPath = subTabChildren[0].path; // First allowed subTab for default routing
            }

            tabChildren.push({
                id: `${page.pageKey}.${tab.key}`,
                label: tab.label,
                tabKey: tab.key,
                path: tabPath,
                children: subTabChildren.length > 0 ? subTabChildren : undefined,
                // Resolve Actions for Tab Context
                actions: resolveActionsInternal(tab.key, actionScope, permissionSet)
            });
        }

        // Build page node
        const pageNode: ResolvedNavNode = {
            id: page.pageKey,
            label: page.labelAz,
            icon: page.icon,
            pageKey: page.pageKey,
            path: pagePath,
            children: tabChildren.length > 0 ? tabChildren : undefined,
            // Resolve Actions for Page Context
            actions: resolveActionsInternal(page.pageKey, actionScope, permissionSet)
        };

        result.push(pageNode);
    }

    return result;
}

