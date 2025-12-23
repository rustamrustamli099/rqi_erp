import { useMemo } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { usePermissions } from '@/app/auth/hooks/usePermissions';
import { PLATFORM_MENU, TENANT_MENU, type MenuItem } from '@/app/navigation/menu.definitions';

/**
 * Enterprise Menu Hook - SAP Grade
 * 
 * Rules:
 * 1. Recursive Filtering: Bottom-up evaluation.
 * 2. Inclusive Visibility: Parent is visible if it has permission OR if any child is visible.
 * 3. Parent Behavior: If parent has no permission but is visible due to children, 
 *    it acts as a Group Header (expandable) rather than a Link (navigatable), 
 *    unless strict clicking is handled elsewhere (e.g. redirects to first child).
 * 4. Context Awareness: Swaps between Platform and Tenant menus.
 * 5. Stability: Memoized to prevent render thrashing.
 */

export const useMenu = () => {
    const { activeTenantType, isLoading } = useAuth();
    const { hasAll, hasAny } = usePermissions();

    // 1. Select the correct tree based on context
    const rawMenu = activeTenantType === 'SYSTEM' ? PLATFORM_MENU : TENANT_MENU;

    // Helper: Sort items by order (if property exists, optional)
    // Assuming MenuItem definition might eventually support 'order' number
    const sortItems = (items: MenuItem[]) => {
        return items; // No-op for now as 'order' isn't in interface, but ready for extension
    };

    const filterMenuTree = useMemo(() => {
        const filterRecursive = (items: MenuItem[]): MenuItem[] => {
            return items.reduce((acc: MenuItem[], item) => {
                // Step 1: Filter children first (Bottom-Up)
                let visibleChildren: MenuItem[] = [];
                if (item.children && item.children.length > 0) {
                    visibleChildren = filterRecursive(item.children);
                }

                // Step 2: Check Direct Permission (for Leafs)
                const hasDirectPermission =
                    !item.requiredPermissions ||
                    item.requiredPermissions.length === 0 ||
                    hasAny(item.requiredPermissions); // Use hasAny for flexibility if array provided (Mode "any")

                // Step 3: Determine Visibility
                const isContainer = (item.children && item.children.length > 0);
                const hasVisibleChildren = visibleChildren.length > 0;

                // RULE:
                // - Container: Visible IF it has visible children.
                // - Leaf: Visible IF it has direct permission.
                const isVisible = isContainer ? hasVisibleChildren : hasDirectPermission;

                if (isVisible) {
                    // Step 4: Construct the item
                    // Smart Path Logic:
                    // If it is a container with visible children, auto-resolve path to the first visible child.
                    // This prevents "Access Denied" if the default parent path points to a forbidden tab.
                    // If direct permission exists, user might want the specific parent path, BUT if that path is a redirect (like /settings -> /settings?tab=general), checking child is safer.

                    let finalPath = item.path;
                    if (isContainer && hasVisibleChildren) {
                        // Find first child with a valid path
                        const firstChildWithPath = visibleChildren.find(c => c.path);
                        if (firstChildWithPath) {
                            finalPath = firstChildWithPath.path;
                        }
                    } else if (isContainer && !hasVisibleChildren) {
                        // Should technically be invisible, but just in case
                        finalPath = undefined;
                    }
                    // Leaf nodes keep their path

                    const finalItem: MenuItem = {
                        ...item,
                        path: finalPath,
                        children: visibleChildren
                    };

                    acc.push(finalItem);
                }

                return acc;
            }, []);
        };

        return (menu: MenuItem[]) => filterRecursive(sortItems(menu));
    }, [hasAny]); // Dependency on permission checker

    const filteredMenu = useMemo(() => filterMenuTree(rawMenu), [rawMenu, filterMenuTree]);

    return {
        menu: filteredMenu,
        loading: isLoading,
        // Helper exposed for other components if needed
        filterMenuTree
    };
};
