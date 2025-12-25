
import { type AdminMenuItem } from "@/app/navigation/menu.definitions";
import { SETTINGS_REGISTRY, type SettingsTabRegistry } from "@/app/navigation/settings.registry";
import { MenuVisibilityEngine } from "@/domains/auth/utils/menu-visibility";

/**
 * Preview Engine
 * Simulates what a user sees based on their permissions.
 * 
 * Used for:
 * 1. Admin "Simulate User" feature
 * 2. Debugging permissions
 * 3. Unit Testing
 */

export interface PreviewResult {
    visibleMenuItems: AdminMenuItem[];
    visibleSettingsTabs: Record<string, boolean>; // key: tab.id, value: visible
    landingRoute: string;
    accessDenied: boolean;
}

export const previewUser = (
    permissions: string[],
    menuDefinitions: AdminMenuItem[] // Pass PLATFORM_MENU or TENANT_MENU
): PreviewResult => {

    // 1. Compute Visible Menu
    const visibleMenu = MenuVisibilityEngine.computeVisibleTree(menuDefinitions, permissions);

    // 2. Compute Visible Settings Tabs
    // We check against the frozen registry
    const visibleTabs: Record<string, boolean> = {};
    Object.keys(SETTINGS_REGISTRY).forEach(tabId => {
        const tab = SETTINGS_REGISTRY[tabId as keyof typeof SETTINGS_REGISTRY];
        // Check if user has the required permission
        // Logic: permissions.includes(tab.permission)
        // Note: tab.permission is usually "system.settings.general.read" etc.
        // We need exact match or normalized match?
        // Assuming 'permissions' array is already Normalized (contains implicit access).
        // But tabs require OPERATION permissions (e.g. *.read), not just *.access.

        visibleTabs[tabId] = permissions.includes(tab.permission);
    });

    // 3. Determine Landing Route
    let landingRoute = '/access-denied';
    if (visibleMenu.length > 0) {
        const first = visibleMenu[0];
        landingRoute = first.route;
        // If first item is Settings, we need to append the first visible tab
        if (first.id === 'settings') {
            // Find first visible tab
            const firstVisibleTab = Object.keys(SETTINGS_REGISTRY).find(t => visibleTabs[t]);
            if (firstVisibleTab) {
                landingRoute += `?tab=${firstVisibleTab}`;
            }
        } else if (first.tab) {
            landingRoute += `?tab=${first.tab}`; // Use default tab if defined in menu definition
        }
    }

    return {
        visibleMenuItems: visibleMenu,
        visibleSettingsTabs: visibleTabs,
        landingRoute: landingRoute,
        accessDenied: visibleMenu.length === 0
    };
};
