
import { type MenuItem, PLATFORM_MENU, TENANT_MENU } from "@/app/navigation/menu.definitions"

export interface SimulationResult {
    visibleMenuIds: string[]
    accessibleRoutes: string[]
    deniedRoutes: string[]
    menuTree: MenuItem[] // Filtered tree
}

export interface DiffResult {
    added: string[]
    removed: string[]
    common: string[]
}

// Helper: Check if item is visible based on permissions
const isVisible = (item: MenuItem, permissions: string[]): boolean => {
    if (!item.requiredPermissions || item.requiredPermissions.length === 0) return true
    return item.requiredPermissions.some(p => permissions.includes(p))
}

// Recursive function to filter menu
const filterMenu = (items: MenuItem[], permissions: string[]): MenuItem[] => {
    return items
        .map(item => {
            // Check direct permission
            const hasDirectPermission = isVisible(item, permissions)

            // Check children
            const visibleChildren = item.children ? filterMenu(item.children, permissions) : []

            // Visibility Logic:
            // 1. If it has children, it's visible if AT LEAST ONE child is visible (Group Header logic)
            // 2. OR if it has direct permission

            // However, often Parent requires permission AND Child requires permission.
            // If Parent lacks permission, Children are usually inaccessible.
            // BUT for "Grouping", sometimes Parent is just a label.
            // Looking at menu.definitions.ts, e.g. "settings" has PERMISSION.SETTINGS.READ.
            // If user has "settings.general.read" but NOT "settings.read", usually they shouldn't see Settings.
            // So Strict Parent Logic: Parent must be visible for Child to be visible.

            if (!hasDirectPermission) return null

            // If we have children defined, but none valid, and we depend on children?
            // Usually dashboard items without children are fine.
            // Items WITH children usually act as folders.
            if (item.children && item.children.length > 0 && visibleChildren.length === 0) {
                // Folder with no visible children. Should we show it?
                // Usually NO, to avoid empty folders.
                return null
            }

            return {
                ...item,
                children: visibleChildren.length > 0 ? visibleChildren : undefined
            }
        })
        .filter((item): item is MenuItem => item !== null)
}

// Flatten menu for ID extraction
const flattenIds = (items: MenuItem[]): string[] => {
    let ids: string[] = []
    items.forEach(item => {
        ids.push(item.id)
        if (item.children) {
            ids = [...ids, ...flattenIds(item.children)]
        }
    })
    return ids
}

export const SimulatorEngine = {
    run: (permissions: string[], context: 'admin' | 'tenant' = 'admin'): SimulationResult => {
        const baseMenu = context === 'admin' ? PLATFORM_MENU : TENANT_MENU
        const filteredTree = filterMenu(baseMenu, permissions)
        const visibleIds = flattenIds(filteredTree)

        // Routes logic: If menu item is visible, its path is accessible.
        // Also implicit routes? For now, we map menu paths.
        const accessibleRoutes = filteredTree.flatMap(function getPaths(item): string[] {
            const paths = item.path ? [item.path] : []
            if (item.children) {
                return [...paths, ...item.children.flatMap(getPaths)]
            }
            return paths
        })

        // Calculate all possible routes to determine what is denied
        const allRoutes = flattenIds(baseMenu).flatMap(id => {
            // Find item by ID to get path
            const findItem = (items: MenuItem[]): string | undefined => {
                for (const item of items) {
                    if (item.id === id) return item.path;
                    if (item.children) {
                        const found = findItem(item.children);
                        if (found) return found;
                    }
                }
                return undefined;
            }
            const path = findItem(baseMenu);
            return path ? [path] : [];
        });

        const deniedRoutes = allRoutes.filter(route => !accessibleRoutes.includes(route));

        return {
            visibleMenuIds: visibleIds,
            accessibleRoutes,
            deniedRoutes,
            menuTree: filteredTree
        }
    },

    diff: (originalPerms: string[], newPerms: string[], context: 'admin' | 'tenant' = 'admin'): DiffResult => {
        const before = SimulatorEngine.run(originalPerms, context).visibleMenuIds
        const after = SimulatorEngine.run(newPerms, context).visibleMenuIds

        return {
            added: after.filter(id => !before.includes(id)),
            removed: before.filter(id => !after.includes(id)),
            common: before.filter(id => after.includes(id))
        }
    }
}
