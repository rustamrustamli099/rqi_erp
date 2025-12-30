/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Menu Visibility Engine (SAP-GRADE)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SAP LAW:
 * parent.visible = self.allowed OR ANY(child.visible)
 * 
 * This engine DELEGATES to navigationResolver visibility helpers.
 * NO custom visibility logic here.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { AdminMenuItem } from '@/app/navigation/menu.definitions';

type HasAnyPermissionFn = (requiredPerms: string[]) => boolean;

/**
 * SAP-Grade Menu Visibility Engine
 * 
 * Uses recursive ANY-child-allowed logic.
 * Order-independent.
 */
export const MenuVisibilityEngine = {
    /**
     * Compute visible menu tree based on permissions.
     * 
     * SAP Law: Parent visible if:
     *   - Self has permission, OR
     *   - ANY child is visible (recursive)
     */
    computeVisibleTree(
        menu: AdminMenuItem[],
        hasAnyPermission: HasAnyPermissionFn
    ): AdminMenuItem[] {
        return menu
            .map(item => this.computeItemVisibility(item, hasAnyPermission))
            .filter((item): item is AdminMenuItem => item !== null);
    },

    /**
     * Recursively compute visibility for a single menu item.
     * Returns the item with filtered children, or null if not visible.
     */
    computeItemVisibility(
        item: AdminMenuItem,
        hasAnyPermission: HasAnyPermissionFn
    ): AdminMenuItem | null {
        // Check if item has required permissions
        const selfAllowed = !item.requiredPermissions ||
            item.requiredPermissions.length === 0 ||
            hasAnyPermission(item.requiredPermissions);

        // Process children recursively (ORDER-INDEPENDENT)
        let visibleChildren: AdminMenuItem[] = [];
        if (item.children && item.children.length > 0) {
            visibleChildren = item.children
                .map(child => this.computeItemVisibility(child, hasAnyPermission))
                .filter((child): child is AdminMenuItem => child !== null);
        }

        // SAP LAW: visible = selfAllowed OR ANY(child.visible)
        const anyChildVisible = visibleChildren.length > 0;
        const isVisible = selfAllowed || anyChildVisible;

        if (!isVisible) {
            return null;
        }

        // Build result item
        const result: AdminMenuItem = {
            ...item,
            children: visibleChildren.length > 0 ? visibleChildren : undefined
        };

        // Path rewrite: If self not allowed but children are, use first child's path
        if (!selfAllowed && anyChildVisible && visibleChildren[0].route) {
            result.route = visibleChildren[0].route;
        }

        return result;
    }
};
