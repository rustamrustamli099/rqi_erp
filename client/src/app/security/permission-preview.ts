/**
 * Permission Preview Engine
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SAP/Bank-grade Permission Preview Engine.
 * Answers: "Bu user sistemə girəndə nə GÖRƏCƏK və nə GÖRMƏYƏCƏK?"
 * 
 * DETERMINISTIC: Same input always produces same output.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { RBAC_REGISTRY } from './rbac.registry';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type Scope = 'ADMIN' | 'TENANT';

export interface PreviewInput {
    permissions: string[];
    scope: Scope;
}

export interface PreviewOutput {
    visibleMenus: PreviewMenuItem[];
    visibleRoutes: PreviewRoute[];
    visibleTabs: PreviewTab[];
    landingRoute: string;
    deniedItems: DeniedItem[];
    warnings: PreviewWarning[];
}

export interface PreviewMenuItem {
    id: string;
    label: string;
    path: string;
    icon?: string;
    grantedBy: string; // Which permission grants this
}

export interface PreviewRoute {
    path: string;
    label: string;
    grantedBy: string;
}

export interface PreviewTab {
    menuId: string;
    tabId: string;
    label: string;
    grantedBy: string;
}

export interface DeniedItem {
    type: 'MENU' | 'ROUTE' | 'TAB';
    id: string;
    label: string;
    reason: string;
    reasonAz: string;
    requiredPermission: string;
}

export interface PreviewWarning {
    code: string;
    message: string;
    messageAz: string;
    severity: 'INFO' | 'WARNING' | 'ERROR';
}

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSION PREVIEW ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class PermissionPreviewEngine {
    /**
     * Main preview function - deterministic
     */
    static preview(input: PreviewInput): PreviewOutput {
        const visibleMenus: PreviewMenuItem[] = [];
        const visibleRoutes: PreviewRoute[] = [];
        const visibleTabs: PreviewTab[] = [];
        const deniedItems: DeniedItem[] = [];
        const warnings: PreviewWarning[] = [];

        const permissionSet = new Set(input.permissions);
        const registry = input.scope === 'ADMIN' ? RBAC_REGISTRY.admin : RBAC_REGISTRY.tenant;

        // Process each menu item in registry
        for (const [menuKey, menuConfig] of Object.entries(registry)) {
            const config = menuConfig as any;
            if (!config.path) continue;

            // Check menu-level permission
            const hasMenuPermission = this.hasPermission(permissionSet, config.permission);

            // Check tab-level permissions (child visibility bubbles up)
            let hasAnyTabPermission = false;
            const grantingPermissions: string[] = [];

            if (config.tabs) {
                for (const [tabKey, tabConfig] of Object.entries(config.tabs)) {
                    const tab = tabConfig as any;
                    if (this.hasPermission(permissionSet, tab.permission)) {
                        hasAnyTabPermission = true;
                        grantingPermissions.push(tab.permission);

                        visibleTabs.push({
                            menuId: menuKey,
                            tabId: tabKey,
                            label: tab.label,
                            grantedBy: tab.permission
                        });
                    } else {
                        deniedItems.push({
                            type: 'TAB',
                            id: `${menuKey}.${tabKey}`,
                            label: tab.label,
                            reason: 'Missing required permission',
                            reasonAz: 'Tələb olunan icazə yoxdur',
                            requiredPermission: tab.permission
                        });
                    }
                }
            }

            // Menu is visible if:
            // 1. Has direct menu permission, OR
            // 2. Has any tab permission (child bubbles up)
            if (hasMenuPermission || hasAnyTabPermission) {
                const grantedBy = hasMenuPermission
                    ? config.permission
                    : grantingPermissions[0] || 'unknown';

                visibleMenus.push({
                    id: menuKey,
                    label: config.labelAz || config.label,
                    path: config.path,
                    icon: config.icon,
                    grantedBy
                });

                visibleRoutes.push({
                    path: config.path,
                    label: config.labelAz || config.label,
                    grantedBy
                });
            } else {
                deniedItems.push({
                    type: 'MENU',
                    id: menuKey,
                    label: config.labelAz || config.label,
                    reason: 'No permission for this menu or its tabs',
                    reasonAz: 'Bu menyu və ya tabları üçün icazə yoxdur',
                    requiredPermission: config.permission
                });
            }
        }

        // Generate warnings
        if (visibleMenus.length === 0) {
            warnings.push({
                code: 'NO_ACCESS',
                message: 'User has no visible menus - will see Access Denied page',
                messageAz: 'İstifadəçinin görünən menyusu yoxdur - Access Denied səhifəsi görəcək',
                severity: 'ERROR'
            });
        }

        // Check for orphan permissions (permission exists but no menu matches)
        for (const perm of input.permissions) {
            const hasMatchingMenu = visibleMenus.some(m =>
                m.grantedBy === perm ||
                visibleTabs.some(t => t.grantedBy === perm)
            );

            if (!hasMatchingMenu && !perm.endsWith('.read') && !perm.endsWith('.view')) {
                warnings.push({
                    code: 'ORPHAN_PERMISSION',
                    message: `Permission "${perm}" has no matching menu item`,
                    messageAz: `"${perm}" icazəsi heç bir menu ilə uyğun gəlmir`,
                    severity: 'WARNING'
                });
            }
        }

        // Determine landing route
        let landingRoute = '/admin/access-denied';
        if (visibleMenus.length > 0) {
            const firstMenu = visibleMenus[0];
            const firstTab = visibleTabs.find(t => t.menuId === firstMenu.id);
            landingRoute = firstTab
                ? `${firstMenu.path}?tab=${firstTab.tabId}`
                : firstMenu.path;
        }

        return {
            visibleMenus,
            visibleRoutes,
            visibleTabs,
            landingRoute,
            deniedItems,
            warnings
        };
    }

    /**
     * Check if permission set contains a permission (with prefix matching)
     */
    private static hasPermission(permissionSet: Set<string>, required: string): boolean {
        if (!required) return true;

        // Exact match
        if (permissionSet.has(required)) return true;

        // Check if user has parent permission (e.g., "system.settings" covers "system.settings.general.read")
        const parts = required.split('.');
        for (let i = 1; i < parts.length; i++) {
            const prefix = parts.slice(0, i).join('.');
            if (permissionSet.has(prefix)) return true;
        }

        // Check if action is covered by parent
        // e.g., "system.settings.general.update" should imply "system.settings.general.read"
        if (required.endsWith('.read') || required.endsWith('.view')) {
            // Check if user has any action on this resource
            const resourcePrefix = required.replace(/\.(read|view)$/, '');
            for (const perm of permissionSet) {
                if (perm.startsWith(resourcePrefix + '.')) return true;
            }
        }

        return false;
    }

    /**
     * Get summary for UI
     */
    static getSummary(output: PreviewOutput): {
        visibleMenusCount: number;
        visibleTabsCount: number;
        deniedCount: number;
        warningsCount: number;
        hasAccess: boolean;
    } {
        return {
            visibleMenusCount: output.visibleMenus.length,
            visibleTabsCount: output.visibleTabs.length,
            deniedCount: output.deniedItems.length,
            warningsCount: output.warnings.length,
            hasAccess: output.visibleMenus.length > 0
        };
    }

    /**
     * Check if a specific route is accessible
     */
    static canAccessRoute(input: PreviewInput, route: string): boolean {
        const output = this.preview(input);
        return output.visibleRoutes.some(r => route.startsWith(r.path));
    }
}

export default PermissionPreviewEngine;
