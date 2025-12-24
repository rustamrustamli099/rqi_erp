
import type { AdminMenuItem } from "@/app/navigation/menu.definitions";

/**
 * SAP-Grade Menu Visibility Engine (Flat & Prefix-Based)
 * 
 * Rules:
 * 1. Flat List: No recursion.
 * 2. Prefix Matching: Item is visible if ANY user permission starts with ANY of the item's permissionPrefixes.
 * 3. Zero Permission User: Handled by AuthGate, but here we simply return empty array if no matches.
 */

export class MenuVisibilityEngine {

    /**
     * Computes the visible menu items based on Prefix Matching.
     * @param menu The flat list of AdminMenuItems
     * @param userPermissions The user's full permission list (strings)
     */
    static computeVisibleTree(menu: AdminMenuItem[], userPermissions: string[]): AdminMenuItem[] {
        if (!menu || !userPermissions) return [];

        return menu.filter(item => {
            // Public items (no prefixes defined) are visible? 
            // SAP rule: "Zero permission users NEVER enter". Implies strictness.
            // But if prefixes is empty array, treated as Public? 
            // Creating a safe semantic: If prefixes is undefined/empty, assume VISIBLE (e.g. Dashboard if public).
            // However, our definition has ['system.dashboard'].

            if (!item.permissionPrefixes || item.permissionPrefixes.length === 0) {
                return true;
            }

            // Check if ANY user permission starts with ANY prefix
            // Optimization: userPermissions might be large.
            // O(M * P * U) where M=Menu, P=Prefixes, U=UserPerms. 
            // P is small (1-4). M is small (10). U is ~50-100.
            // 10 * 4 * 100 = 4000 ops. Negligible.

            const visible = item.permissionPrefixes.some(prefix =>
                userPermissions.some(uPerm => {
                    // Check 1: User has SPECIFIC permission (e.g. system.settings.read) -> Matches Menu (system.settings)
                    if (uPerm.startsWith(prefix)) return true;

                    // Check 2: User has BROAD permission (e.g. system.settings) -> Matches Menu (system.settings.general)
                    if (prefix.startsWith(uPerm)) return true;

                    return false;
                })
            );

            // Debug Logging (Enabled for troubleshooting)
            if (!visible) {
                // Only log if it's suspicious (e.g. user has many permissions but sees nothing)
                if (userPermissions.length > 0) {
                    console.log(`[MenuVisibility] Hidden: ${item.id}`, { itemPrefixes: item.permissionPrefixes, userSample: userPermissions.slice(0, 3) });
                } else {
                    console.log(`[MenuVisibility] Hidden: ${item.id} (No User Permissions)`);
                }
            }
            return visible;
        });
    }
}
