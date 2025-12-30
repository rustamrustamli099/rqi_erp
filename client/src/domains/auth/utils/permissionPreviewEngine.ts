/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PERMISSION PREVIEW ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SAP-Grade preview engine that answers:
 * - Which sidebar items are visible
 * - Which tabs/subTabs are accessible
 * - What is the landing route
 * - Why visible / why denied (explanation)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    TAB_SUBTAB_REGISTRY,
    normalizePermissions,
    type PageConfig,
    type TabConfig,
    type SubTabConfig
} from '@/app/navigation/tabSubTab.registry';

// =============================================================================
// TYPES
// =============================================================================

export interface TabPreviewResult {
    tabKey: string;
    label: string;
    allowed: boolean;
    reason: string;
    landingPath?: string;
    subTabs?: SubTabPreviewResult[];
}

export interface SubTabPreviewResult {
    subTabKey: string;
    label: string;
    allowed: boolean;
    reason: string;
}

export interface PagePreviewResult {
    pageKey: string;
    basePath: string;
    label: string;
    allowed: boolean;
    reason: string;
    landingPath: string;
    tabs: TabPreviewResult[];
}

export interface MenuPreviewResult {
    menuId: string;
    label: string;
    landingPath: string;
}

export interface PermissionPreviewResult {
    normalizedPermissions: string[];
    visibleMenus: MenuPreviewResult[];
    pages: PagePreviewResult[];
    deniedSummary: { pageKey: string; missingPerms: string[] }[];
    firstLandingPath: string;
}

// =============================================================================
// ENGINE
// =============================================================================

export class PermissionPreviewEngine {

    /**
     * Run full preview computation
     */
    static run(
        userPermissions: string[],
        context: 'admin' | 'tenant' = 'admin'
    ): PermissionPreviewResult {
        const normalized = normalizePermissions(userPermissions);
        const pages = context === 'admin'
            ? TAB_SUBTAB_REGISTRY.admin
            : TAB_SUBTAB_REGISTRY.tenant;

        const pageResults: PagePreviewResult[] = [];
        const visibleMenus: MenuPreviewResult[] = [];
        const deniedSummary: { pageKey: string; missingPerms: string[] }[] = [];

        for (const page of pages) {
            const pageResult = this.previewPage(page, normalized);
            pageResults.push(pageResult);

            if (pageResult.allowed) {
                visibleMenus.push({
                    menuId: page.pageKey,
                    label: page.labelAz,
                    landingPath: pageResult.landingPath
                });
            } else {
                const missingPerms = this.collectMissingPerms(page, normalized);
                if (missingPerms.length > 0) {
                    deniedSummary.push({ pageKey: page.pageKey, missingPerms });
                }
            }
        }

        const firstLandingPath = visibleMenus.length > 0
            ? visibleMenus[0].landingPath
            : '/access-denied';

        return {
            normalizedPermissions: normalized,
            visibleMenus,
            pages: pageResults,
            deniedSummary,
            firstLandingPath
        };
    }

    /**
     * Preview a single page
     */
    private static previewPage(
        page: PageConfig,
        normalizedPerms: string[]
    ): PagePreviewResult {
        const tabResults: TabPreviewResult[] = [];
        let firstAllowedTab: { tab: string; subTab?: string } | null = null;

        for (const tab of page.tabs) {
            const tabResult = this.previewTab(tab, normalizedPerms, page.basePath);
            tabResults.push(tabResult);

            if (tabResult.allowed && !firstAllowedTab) {
                if (tabResult.subTabs && tabResult.subTabs.length > 0) {
                    const firstAllowedSubTab = tabResult.subTabs.find(st => st.allowed);
                    firstAllowedTab = firstAllowedSubTab
                        ? { tab: tab.key, subTab: firstAllowedSubTab.subTabKey }
                        : { tab: tab.key };
                } else {
                    firstAllowedTab = { tab: tab.key };
                }
            }
        }

        const allowed = firstAllowedTab !== null;
        let landingPath = page.basePath;

        if (firstAllowedTab) {
            landingPath += `?tab=${firstAllowedTab.tab}`;
            if (firstAllowedTab.subTab) {
                landingPath += `&subTab=${firstAllowedTab.subTab}`;
            }
        }

        return {
            pageKey: page.pageKey,
            basePath: page.basePath,
            label: page.labelAz,
            allowed,
            reason: allowed
                ? `allowed_by:${firstAllowedTab?.tab}`
                : 'no_accessible_tabs',
            landingPath,
            tabs: tabResults
        };
    }

    /**
     * Preview a single tab
     * SAP-GRADE: Tab allowed if self.allowed OR ANY(subTab.allowed)
     */
    private static previewTab(
        tab: TabConfig,
        normalizedPerms: string[],
        basePath: string
    ): TabPreviewResult {
        const selfAllowed = this.checkAccess(tab.requiredAnyOf, normalizedPerms);
        const matchedPerm = this.findMatchingPerm(tab.requiredAnyOf, normalizedPerms);

        let subTabResults: SubTabPreviewResult[] | undefined;
        let anySubTabAllowed = false;
        let firstAllowedSubTab: string | undefined;

        if (tab.subTabs && tab.subTabs.length > 0) {
            subTabResults = tab.subTabs.map(subTab =>
                this.previewSubTab(subTab, normalizedPerms)
            );

            // SAP LAW: Check if ANY subTab is allowed (order-independent)
            for (const st of subTabResults) {
                if (st.allowed) {
                    anySubTabAllowed = true;
                    if (!firstAllowedSubTab) {
                        firstAllowedSubTab = st.subTabKey;
                    }
                }
            }
        }

        // SAP LAW: Tab allowed = selfAllowed OR ANY(subTab.allowed)
        const hasAccess = selfAllowed || anySubTabAllowed;

        return {
            tabKey: tab.key,
            label: tab.label,
            allowed: hasAccess,
            reason: hasAccess
                ? (selfAllowed ? `allowed_by:${matchedPerm}` : `child_allowed:${firstAllowedSubTab}`)
                : `missing:${tab.requiredAnyOf.join(',')}`,
            landingPath: hasAccess ? `${basePath}?tab=${tab.key}` : undefined,
            subTabs: subTabResults
        };
    }

    /**
     * Preview a single subTab
     */
    private static previewSubTab(
        subTab: SubTabConfig,
        normalizedPerms: string[]
    ): SubTabPreviewResult {
        const hasAccess = this.checkAccess(subTab.requiredAnyOf, normalizedPerms);
        const matchedPerm = this.findMatchingPerm(subTab.requiredAnyOf, normalizedPerms);

        return {
            subTabKey: subTab.key,
            label: subTab.label,
            allowed: hasAccess,
            reason: hasAccess
                ? `allowed_by:${matchedPerm}`
                : `missing:${subTab.requiredAnyOf.join(',')}`
        };
    }

    /**
     * Check if user has ANY of the required permissions
     */
    /**
     * SAP-GRADE: EXACT permission match only
     * NO startsWith, NO prefix inference
     */
    private static checkAccess(
        requiredAnyOf: string[],
        normalizedPerms: string[]
    ): boolean {
        return requiredAnyOf.some(req =>
            normalizedPerms.some(perm => {
                // Exact base match (strip action verb)
                const reqBase = req.replace(/\.(read|view|create|update|delete|export|approve)$/, '');
                const permBase = perm.replace(/\.(read|view|create|update|delete|export|approve)$/, '');
                return reqBase === permBase;
            })
        );
    }

    /**
     * Find which permission grants access
     */
    /**
     * SAP-GRADE: Find matching permission with EXACT base match
     */
    private static findMatchingPerm(
        requiredAnyOf: string[],
        normalizedPerms: string[]
    ): string | null {
        for (const req of requiredAnyOf) {
            const reqBase = req.replace(/\.(read|view|create|update|delete|export|approve)$/, '');
            const match = normalizedPerms.find(perm => {
                const permBase = perm.replace(/\.(read|view|create|update|delete|export|approve)$/, '');
                return reqBase === permBase;
            });
            if (match) return match;
        }
        return null;
    }

    /**
     * Collect missing permissions for denied page
     */
    private static collectMissingPerms(
        page: PageConfig,
        normalizedPerms: string[]
    ): string[] {
        const missing: string[] = [];

        for (const tab of page.tabs) {
            if (!this.checkAccess(tab.requiredAnyOf, normalizedPerms)) {
                missing.push(...tab.requiredAnyOf);
            }
        }

        return [...new Set(missing)];
    }
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

/**
 * Quick check if user can access any page
 */
export function hasAnyAccess(
    userPermissions: string[],
    context: 'admin' | 'tenant' = 'admin'
): boolean {
    const result = PermissionPreviewEngine.run(userPermissions, context);
    return result.visibleMenus.length > 0;
}

/**
 * Get first landing path for user
 */
export function getFirstLandingPath(
    userPermissions: string[],
    context: 'admin' | 'tenant' = 'admin'
): string {
    const result = PermissionPreviewEngine.run(userPermissions, context);
    return result.firstLandingPath;
}
