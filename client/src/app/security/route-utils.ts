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

    // Normalize user permissions for easy lookup
    // Assuming permissions are already canonical slugs. 
    // If mixed, we might need normalization here, but AuthContext should have done it.
    const userPerms = new Set(permissions);

    const findFirst = (items: MenuItem[]): string | null => {
        for (const item of items) {
            // 1. Check Permission
            const hasPermission = !item.requiredPermissions ||
                item.requiredPermissions.length === 0 ||
                item.requiredPermissions.every(p => userPerms.has(p));

            if (!hasPermission) continue;

            // 2. If it's a Leaf Node with a Path, return it
            if (item.path && (!item.children || item.children.length === 0)) {
                console.log("[RouteUtils] Select Leaf:", item.label, item.path);
                return item.path;
            }

            // 3. If it's a Container, dive deeper
            if (item.children && item.children.length > 0) {
                // console.log("[RouteUtils] Skipping Container:", item.label);
                const childPath = findFirst(item.children);
                if (childPath) return childPath;
            }
        }
        return null;
    };

    const route = findFirst(menu);
    return route || '/access-denied'; // Fallback to terminal state if absolutely nothing found
};
