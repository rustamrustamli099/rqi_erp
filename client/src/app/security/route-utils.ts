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
    // Assuming permissions are already canonical slugs. 
    // If mixed, we might need normalization here, but AuthContext should have done it.
    const userPerms = new Set(permissions);

    const findFirst = (items: MenuItem[]): string | null => {
        for (const item of items) {
            // Priority 1: Check Children (Strict Recursive Depth-First)
            // If a node has children, it is a Container. Containers should NEVER be the target of an initial redirect.
            // We must find a valid LEAF within.
            if (item.children && item.children.length > 0) {
                const childPath = findFirst(item.children);
                if (childPath) {
                    return childPath;
                }
                // If no child is valid, we continue to the next sibling. 
                // We do NOT check the container's own path for redirect purposes.
                continue;
            }

            // Priority 2: Leaf Node Check
            // At this point, item has no children (isLeaf).

            // 2a. Strict Path Validation
            if (!item.path || item.path.trim() === "") {
                continue;
            }

            // 2b. Strict Permission Validation
            // SAP-Grade: Even leaf nodes must have explicit permission access
            const hasPermission = !item.requiredPermissions ||
                item.requiredPermissions.length === 0 ||
                item.requiredPermissions.some(p => userPerms.has(p)); // Using 'some' (OR logic) for flexibility, or 'every' based on requirement. 
            // Wait, User Prompt 1 says: "IF permissionSet CONTAINS node.permission". 
            // Usually arrays imply ALL or ANY. 
            // `ProtectedRoute` defaulted to ALL initially, then I changed to ANY for the users route.
            // Let's stick to the logic: if one required permission is missing? 
            // "requiredPermissions" (plural) usually implies ALL in strict systems, but my previous edit used "mode=any" for route.
            // However, for menu visibility/redirect, standard practice is: ANY of the required permissions allows access?
            // Actually, let's look at `Sidebar.tsx` or `ProtectedRoute`. 
            // `ProtectedRoute` default is `all`.
            // But `admin.routes.tsx` uses `mode="any"`.

            // Let's check the user's pseudo code:
            // IF permissionSet CONTAINS node.permission THEN RETURN node.path
            // The pseudo code implies singular permission check or generic "contains".

            // Let's use logic that aligns with `ProtectedRoute` default if possible, or broad "has access".
            // I will use `every` to be safe/strict (default for `ProtectedRoute`), but if `requiredPermissions` is empty, it passes.
            // Modification: The `users` route has [VIEW, CONNECT]. If I use `every`, a user with *only* CONNECT will fail this check!
            // This would break the "Phantom" item fix. 
            // The "Phantom" item logic relies on an item having specific permissions.

            // Better approach: `Menu.definitions` items usually have `requiredPermissions`.
            // If I change it to `some` (ANY), it makes it looser.
            // If I keep `every`, I break the "OR" logic for the Users page if the menu item itself requires both.
            // Checking `menu.definitions.ts`: The users menu item has `requiredPermissions: [PermissionSlugs.PLATFORM.USERS.VIEW]`. 
            // It does NOT list `CONNECT`.
            // So strict `every` works for the main `Users` menu.
            // But for the `phantom` item `users.connect`, it has `[...CONNECT]`.
            // So `every` works fine because each menu item usually targets one specific set of permissions.

            const hasAccess = !item.requiredPermissions ||
                item.requiredPermissions.length === 0 ||
                item.requiredPermissions.every(p => userPerms.has(p));

            if (hasAccess) {
                return item.path;
            }
        }
        return null;
    };

    const route = findFirst(menu);
    return route || '/access-denied'; // Fallback to terminal state if absolutely nothing found
};
