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
                let visibleChildren: MenuItem[] | undefined = undefined;
                if (item.children && item.children.length > 0) {
                    visibleChildren = filterRecursive(item.children);
                }

                // Step 2: Check Direct Permission
                // If requiredPermissions is empty/undefined -> it is PUBLIC (within scope)
                const hasDirectPermission = 
                    !item.requiredPermissions || 
                    item.requiredPermissions.length === 0 || 
                    hasAll(item.requiredPermissions);

                // Step 3: Determine Visibility (Inclusive Rule)
                // Visible if: (Has Direct Permission) OR (Has At Least One Visible Child)
                const hasVisibleChildren = visibleChildren && visibleChildren.length > 0;
                const isVisible = hasDirectPermission || hasVisibleChildren;

                if (isVisible) {
                    // Step 4: Construct the item
                    const finalItem: MenuItem = {
                        ...item,
                        children: visibleChildren || [],
                        // CRITICAL: If parent has NO direct permission but is visible due to children,
                        // we must ensure it doesn't navigate to a 403 route.
                        // We remove the 'path' property to turn it into a pure collapsible group.
                        path: hasDirectPermission ? item.path : undefined 
                    };

                    acc.push(finalItem);
                }

                return acc;
            }, []);
        };

        return (menu: MenuItem[]) => filterRecursive(sortItems(menu));
    }, [hasAll]); // Dependency on permission checker

    const filteredMenu = useMemo(() => filterMenuTree(rawMenu), [rawMenu, filterMenuTree]);

    return {
        menu: filteredMenu,
        loading: isLoading,
        // Helper exposed for other components if needed
        filterMenuTree 
    };
};
