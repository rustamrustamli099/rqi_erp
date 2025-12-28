
import { type AdminMenuItem } from "@/app/navigation/menu.definitions";
import { getSettingsTabsForUI } from "@/app/navigation/tabSubTab.registry";
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
    // We check against the frozen registry which is Grouped
    const visibleTabs: Record<string, boolean> = {};
    const allTabs = getSettingsTabsForUI().flatMap(g => g.items);

    allTabs.forEach(tab => {
        // logic: user has permission
        visibleTabs[tab.id] = permissions.includes(tab.permission);
    });

    // 3. Determine Landing Route
    let landingRoute = '/access-denied';
    if (visibleMenu.length > 0) {
        const first = visibleMenu[0];
        landingRoute = first.route;
        // If first item is Settings, we need to append the first visible tab
        if (first.id === 'settings') {
            // Find first visible tab
            const firstVisibleTab = allTabs.find(t => visibleTabs[t.id]);
            if (firstVisibleTab) {
                landingRoute += `?tab=${firstVisibleTab.id}`;
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
