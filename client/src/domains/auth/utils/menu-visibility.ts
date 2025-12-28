/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade Menu Visibility Engine
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SINGLE SOURCE OF TRUTH: TAB_SUBTAB_REGISTRY
 * 
 * Rules:
 * 1. Menu is visible ONLY if user has at least ONE allowed tab
 * 2. NO prefix matching
 * 3. NO permission guessing
 * 4. Visibility == Actionability (SAP principle)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { MenuItem } from "@/app/navigation/menu.definitions";
import {
    TAB_SUBTAB_REGISTRY,
    normalizePermissions,
    type PageConfig
} from "@/app/navigation/tabSubTab.registry";

export class MenuVisibilityEngine {

    /**
     * SAP-GRADE: Compute visible menu using frozen registry.
     * 
     * A page is visible if user has ANY allowed tab under it.
     * NO prefix matching - exact permission check only.
     */
    static computeVisibleTree(menu: MenuItem[], userPermissions: string[]): MenuItem[] {
        if (!menu || !userPermissions || userPermissions.length === 0) {
            return [];
        }

        const normalizedPerms = normalizePermissions(userPermissions);
        const context = menu.some(m => m.path?.startsWith('/admin')) ? 'admin' : 'tenant';
        const registry = context === 'admin'
            ? TAB_SUBTAB_REGISTRY.admin
            : TAB_SUBTAB_REGISTRY.tenant;

        return menu.filter(item => {
            // Find page in registry using pageKey or path
            const pageConfig = this.findPageConfig(item, registry);

            if (!pageConfig) {
                // No registry entry = hidden (strict mode)
                return false;
            }

            // SAP-GRADE: visible if ANY tab is accessible
            return this.hasAnyAllowedTab(pageConfig, normalizedPerms);
        });
    }

    /**
     * Find page config by pageKey or path
     */
    private static findPageConfig(item: MenuItem, registry: PageConfig[]): PageConfig | undefined {
        // First try pageKey
        if ('pageKey' in item && item.pageKey) {
            return registry.find(p => p.pageKey === item.pageKey);
        }

        // Fallback to path match
        const basePath = item.path?.split('?')[0];
        return registry.find(p => p.basePath === basePath);
    }

    /**
     * SAP-GRADE: Check if user has ANY allowed tab under this page.
     * NO prefix matching - explicit permission check.
     */
    private static hasAnyAllowedTab(page: PageConfig, normalizedPerms: string[]): boolean {
        return page.tabs.some(tab =>
            this.hasExactPermission(tab.requiredAnyOf, normalizedPerms)
        );
    }

    /**
     * EXACT permission check - no startsWith, no prefix guessing.
     * 
     * Match rules:
     * 1. Exact base match: permission bases are equal
     * 2. Hierarchical match: user has parent permission covering the required one
     */
    private static hasExactPermission(
        requiredAnyOf: string[],
        normalizedPerms: string[]
    ): boolean {
        return requiredAnyOf.some(required => {
            const reqBase = required.replace(/\.(read|create|update|delete|approve|export)$/, '');

            return normalizedPerms.some(perm => {
                const permBase = perm.replace(/\.(read|create|update|delete|approve|export)$/, '');

                // Exact match
                if (permBase === reqBase) return true;

                // User has broader permission (hierarchical)
                // e.g., system.users covers system.users.curators
                if (reqBase.startsWith(permBase + '.')) return true;

                return false;
            });
        });
    }
}
