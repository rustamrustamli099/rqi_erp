/**
 * SAP-Grade Permission Preview Engine
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Bu engine istifadəçinin hansı menu və tab-ları görəcəyini hesablayır.
 * 
 * Əsas Funksionallıq:
 * 1. Menu visibility hesablama
 * 2. Tab visibility hesablama
 * 3. İlk icazəli route-un tapılması
 * 4. AccessDenied loop-un qarşısının alınması
 * 
 * DİQQƏT: RBAC_REGISTRY-dən oxuyur, heç vaxt hardcode etmir!
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { RBAC_REGISTRY, type MenuConfig, type RBACRegistry } from './rbac.registry';

// =============================================================================
// TYPES
// =============================================================================

export interface VisibilityResult {
    /** Görünən menu ID-ləri */
    menus: string[];
    /** Hər menu üçün görünən tab-lar */
    tabs: Record<string, string[]>;
    /** İlk icazəli route (tab daxil) */
    firstRoute: string | null;
    /** AccessDenied vəziyyətindədirsə */
    isZeroPermission: boolean;
}

export interface TabVisibility {
    tabId: string;
    hasAccess: boolean;
    permission: string;
}

// =============================================================================
// PERMISSION CHECK HELPERS
// =============================================================================

/**
 * SAP-style permission yoxlaması
 * 
 * Qaydalar:
 * 1. Exact match: user has 'system.billing.read' → required 'system.billing.read' ✓
 * 2. Prefix match: user has 'system.billing' → required 'system.billing.plans.read' ✓
 * 3. Parent match: user has 'system.billing.plans.read' → required 'system.billing.read' ✓ (normalization handles this)
 */
function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    if (!requiredPermission) return true; // No permission required = public
    if (!userPermissions || userPermissions.length === 0) return false;

    return userPermissions.some(userPerm => {
        // Exact match
        if (userPerm === requiredPermission) return true;

        // User has broader access (prefix match)
        // User: 'system.billing' → Required: 'system.billing.plans.read'
        if (requiredPermission.startsWith(userPerm + '.')) return true;

        // User has specific access, checking if it implies the required
        // User: 'system.billing.read' → Required: 'system.billing' (for navigation)
        // This is handled by normalization adding .access permissions

        return false;
    });
}

/**
 * Module prefix-dən oxumaq üçün minimum permission
 * e.g., 'system.billing.plans.read' → 'system.billing'
 */
function extractModulePrefix(permission: string): string {
    const parts = permission.split('.');
    if (parts.length < 2) return permission;
    return parts.slice(0, 2).join('.'); // scope.module
}

// =============================================================================
// MAIN ENGINE
// =============================================================================

export class PermissionPreviewEngine {

    /**
     * İstifadəçinin hansı menu və tab-ları görəcəyini hesablayır
     * 
     * @param userPermissions - İstifadəçinin normalize olunmuş permission-ları
     * @param context - 'admin' (SYSTEM) və ya 'tenant' konteksti
     */
    static computeVisibility(
        userPermissions: string[],
        context: 'admin' | 'tenant' = 'admin'
    ): VisibilityResult {
        const registry = context === 'admin' ? RBAC_REGISTRY.admin : RBAC_REGISTRY.tenant;

        const menus: string[] = [];
        const tabs: Record<string, string[]> = {};
        let firstRoute: string | null = null;

        // Zero-permission detection
        if (!userPermissions || userPermissions.length === 0) {
            return {
                menus: [],
                tabs: {},
                firstRoute: null,
                isZeroPermission: true
            };
        }

        for (const [menuId, config] of Object.entries(registry)) {
            // Menu visibility check
            const hasMenuAccess = hasPermission(userPermissions, config.permission);

            if (!hasMenuAccess) continue;

            menus.push(menuId);

            // Tab visibility check
            if (config.tabs) {
                const visibleTabs: string[] = [];

                for (const [tabId, tabConfig] of Object.entries(config.tabs)) {
                    if (hasPermission(userPermissions, tabConfig.permission)) {
                        visibleTabs.push(tabId);
                    }
                }

                tabs[menuId] = visibleTabs;

                // First route calculation
                if (!firstRoute && visibleTabs.length > 0) {
                    const defaultTab = config.defaultTab && visibleTabs.includes(config.defaultTab)
                        ? config.defaultTab
                        : visibleTabs[0];
                    firstRoute = `${config.path}?tab=${defaultTab}`;
                }
            } else {
                // Menu without tabs
                if (!firstRoute) {
                    firstRoute = config.path;
                }
            }
        }

        return {
            menus,
            tabs,
            firstRoute,
            isZeroPermission: menus.length === 0
        };
    }

    /**
     * Spesifik bir menu üçün görünən tab-ları hesablayır
     */
    static getVisibleTabs(
        menuId: string,
        userPermissions: string[],
        context: 'admin' | 'tenant' = 'admin'
    ): TabVisibility[] {
        const registry = context === 'admin' ? RBAC_REGISTRY.admin : RBAC_REGISTRY.tenant;
        const config = registry[menuId];

        if (!config?.tabs) return [];

        return Object.entries(config.tabs).map(([tabId, tabConfig]) => ({
            tabId,
            hasAccess: hasPermission(userPermissions, tabConfig.permission),
            permission: tabConfig.permission
        }));
    }

    /**
     * Verilmiş URL üçün icazəli ilk tab-ı tapır
     * AccessDenied loop-un qarşısını almaq üçün istifadə olunur
     */
    static getFirstAllowedTabForPath(
        path: string,
        userPermissions: string[],
        context: 'admin' | 'tenant' = 'admin'
    ): string | null {
        const registry = context === 'admin' ? RBAC_REGISTRY.admin : RBAC_REGISTRY.tenant;

        // Find matching menu
        for (const [menuId, config] of Object.entries(registry)) {
            if (path.startsWith(config.path)) {
                if (!config.tabs) return null; // No tabs

                const visibleTabs = this.getVisibleTabs(menuId, userPermissions, context)
                    .filter(t => t.hasAccess)
                    .map(t => t.tabId);

                if (visibleTabs.length === 0) return null;

                // Return default tab if visible, otherwise first visible
                if (config.defaultTab && visibleTabs.includes(config.defaultTab)) {
                    return config.defaultTab;
                }
                return visibleTabs[0];
            }
        }

        return null;
    }

    /**
     * Debug üçün: Permission coverage hesablayır
     */
    static computeCoverage(
        userPermissions: string[],
        context: 'admin' | 'tenant' = 'admin'
    ): { total: number; accessible: number; percentage: number } {
        const registry = context === 'admin' ? RBAC_REGISTRY.admin : RBAC_REGISTRY.tenant;

        let total = 0;
        let accessible = 0;

        for (const config of Object.values(registry)) {
            total++;
            if (hasPermission(userPermissions, config.permission)) {
                accessible++;
            }

            if (config.tabs) {
                for (const tabConfig of Object.values(config.tabs)) {
                    total++;
                    if (hasPermission(userPermissions, tabConfig.permission)) {
                        accessible++;
                    }
                }
            }
        }

        return {
            total,
            accessible,
            percentage: total > 0 ? Math.round((accessible / total) * 100) : 0
        };
    }
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export { hasPermission };
