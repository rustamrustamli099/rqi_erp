import { PLATFORM_MENU, TENANT_MENU, type MenuItem } from '@/app/navigation/menu.definitions';

/**
 * SAP-Grade First Route Calculator
 * 
 * Determines the first accessible route for a user based on their permissions.
 * Traverses the menu tree (Platform or Tenant) in order.
 * 
 * Rules:
 * 1. Skips containers (items without path).
 * 2. Skips items where user lacks required permissions.
 * 3. Returns the first valid 'path' found.
 * 4. Returns '/access-denied' if no route is found (Zero-Perm State).
 */
export const getFirstAllowedRoute = (
    permissions: string[],
    tenantType: 'SYSTEM' | 'TENANT'
): string => {
    const menu = tenantType === 'SYSTEM' ? PLATFORM_MENU : TENANT_MENU;
    console.log(`[RouteUtils] Calculating First Route. Type: ${tenantType}. MenuItems: ${menu.length}. UserPerms:`, permissions);

    // Normalize user permissions for easy lookup
    const userPerms = new Set(permissions);

    const findFirst = (items: MenuItem[]): string | null => {
        for (const item of items) {
            // Priority 1: Check Children (Strict Recursive Depth-First)
            if (item.children && item.children.length > 0) {
                const childPath = findFirst(item.children);
                if (childPath) {
                    return childPath;
                }
                continue;
            }

            // Priority 2: Leaf Node Check
            if (!item.path || item.path.trim() === "") {
                continue;
            }

            // 2b. Strict Permission Validation
            const hasAccess = !item.requiredPermissions ||
                item.requiredPermissions.length === 0 ||
                item.requiredPermissions.some(p => userPerms.has(p));

            if (hasAccess) {
                return item.path;
            }
        }
        return null;
    };

    const route = findFirst(menu);
    return route || '/access-denied'; // Fallback to terminal state if absolutely nothing found
};

/**
 * Finds the first valid leaf path from an ALREADY FILTERED menu tree.
 * Use this when you have the output of useMenu().
 */
export const findFirstPathFromMenu = (items: MenuItem[]): string | null => {
    for (const item of items) {
        // 1. Check Children (Containers)
        if (item.children && item.children.length > 0) {
            const childPath = findFirstPathFromMenu(item.children);
            if (childPath) return childPath;
            continue;
        }

        // 2. Leaf Node
        if (item.path && item.path.trim() !== "") {
            return item.path;
        }
    }
    return null;
};
