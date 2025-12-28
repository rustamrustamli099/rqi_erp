/**
 * Menu Definitions
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Bu fayl RBAC_REGISTRY-dən menu items generasiya edir.
 * RBAC_REGISTRY = Single Source of Truth
 * 
 * Legacy interface-lər saxlanılıb geriyə uyğunluq üçün.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { RBAC_REGISTRY, type MenuConfig } from '@/app/security/rbac.registry';

// =============================================================================
// TYPES (Legacy Compatible)
// =============================================================================

export interface MenuItem {
    id: string;
    label: string;
    title?: string; // Legacy Compat
    icon?: string;
    path?: string;
    route?: string; // Legacy Compat
    tab?: string;
    children?: MenuItem[];
    requiredPermissions?: string[]; // New Logic
    permissionPrefixes?: string[]; // Legacy Compat
}

export type AdminMenuItem = MenuItem; // Alias for backward compatibility

// =============================================================================
// GENERATOR FUNCTION
// =============================================================================

/**
 * RBAC_REGISTRY-dən MenuItem[] generasiya edir
 * 
 * SAP-GRADE RULES:
 * 1. Parent menu permission-suz olmalıdır (container only)
 * 2. permissionPrefixes YAlNIZ parent deyil, BÜTÜN tab permission-larını içərir
 * 3. Əgər HƏR HANSI bir tab permission-u user-də varsa → parent görünür
 * 
 * @param registry - RBAC registry (admin və ya tenant)
 * @param permissionScope - 'system' və ya 'tenant'
 */
function generateMenuFromRegistry(
    registry: Record<string, MenuConfig>,
    permissionScope: 'system' | 'tenant'
): MenuItem[] {
    return Object.entries(registry).map(([id, config]) => {
        // Extract module name from permission for prefix
        const permissionBase = config.permission.replace(/\.(read|view|access)$/, '');

        // SAP-GRADE: Collect ALL tab permission prefixes
        // This ensures parent menu is visible if ANY tab is permitted
        const allPrefixes: string[] = [permissionBase];

        if (config.tabs) {
            Object.values(config.tabs).forEach(tabConfig => {
                // Extract base from tab permission (remove .read/.view suffix)
                const tabBase = tabConfig.permission.replace(/\.(read|view|access)$/, '');
                if (!allPrefixes.includes(tabBase)) {
                    allPrefixes.push(tabBase);
                }
            });
        }

        return {
            id,
            label: config.labelAz || config.label,
            title: config.label,
            icon: config.icon,
            path: config.path,
            route: config.path,
            tab: config.defaultTab,
            requiredPermissions: [`${permissionBase}.access`],
            // SAP-GRADE: Parent visible if ANY tab permission matches
            permissionPrefixes: allPrefixes
        };
    });
}

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * SYSTEM ADMIN MENU (FLAT SIDEBAR)
 * Generated from RBAC_REGISTRY.admin
 */
export const PLATFORM_MENU: MenuItem[] = generateMenuFromRegistry(
    RBAC_REGISTRY.admin,
    'system'
);

/**
 * TENANT MENU
 * Generated from RBAC_REGISTRY.tenant
 */
export const TENANT_MENU: MenuItem[] = generateMenuFromRegistry(
    RBAC_REGISTRY.tenant,
    'tenant'
);

// =============================================================================
// DEBUG HELPERS
// =============================================================================

/**
 * Konsola menu strukturunu yazdırır (development üçün)
 */
export function debugPrintMenus(): void {
    console.log('[MenuDefinitions] PLATFORM_MENU:', PLATFORM_MENU);
    console.log('[MenuDefinitions] TENANT_MENU:', TENANT_MENU);
}
