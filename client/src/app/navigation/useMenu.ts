/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade Menu Hook (SINGLE DECISION CENTER)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RULES:
 * 1. navigationResolver is the ONLY authority for visibility
 * 2. Backend menu used for STRUCTURE only
 * 3. Leaf nodes: visible via hasAnyVisibleTab, route via getFirstAllowedTarget
 * 4. Container nodes: visible if ANY child visible (order-independent)
 * 5. NO custom filtering logic
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useMemo } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { usePermissions } from '@/app/auth/hooks/usePermissions';
import { PLATFORM_MENU, TENANT_MENU, type AdminMenuItem } from '@/app/navigation/menu.definitions';
import { hasAnyVisibleTab, getFirstAllowedTarget } from '@/app/security/navigationResolver';
import { usePendingApprovals } from '@/domains/approvals/hooks/useApprovals';

/**
 * SAP-Grade: Recursively compute visibility using navigationResolver
 * 
 * - Leaf pages: visible = hasAnyVisibleTab(pageKey, perms)
 * - Containers: visible = ANY(child.visible), order-independent
 */
function computeVisibleTree(
    items: AdminMenuItem[],
    permissions: string[],
    context: 'admin' | 'tenant'
): AdminMenuItem[] {
    return items
        .map(item => computeItemVisibility(item, permissions, context))
        .filter((item): item is AdminMenuItem => item !== null);
}

function computeItemVisibility(
    item: AdminMenuItem,
    permissions: string[],
    context: 'admin' | 'tenant'
): AdminMenuItem | null {
    // Process children first (ORDER-INDEPENDENT visibility check)
    let visibleChildren: AdminMenuItem[] = [];
    if ('children' in item && Array.isArray((item as any).children)) {
        visibleChildren = computeVisibleTree(
            (item as any).children,
            permissions,
            context
        );
    }

    // Leaf node (has pageKey, no children): use resolver for visibility
    const isLeaf = item.pageKey && visibleChildren.length === 0;
    if (isLeaf) {
        // SAP: Delegate to resolver for visibility
        const hasVisibleTabs = hasAnyVisibleTab(item.pageKey, permissions, context);
        if (!hasVisibleTabs) {
            return null; // Not visible
        }
        // Get resolved route
        const resolvedRoute = getFirstAllowedTarget(item.pageKey, permissions, context);
        return {
            ...item,
            route: resolvedRoute || item.route || item.path,
            path: resolvedRoute || item.path
        };
    }

    // Container node: visible if ANY child visible (SAP Law)
    const anyChildVisible = visibleChildren.length > 0;
    if (!anyChildVisible && !item.pageKey) {
        return null; // Container with no visible children
    }

    // Container with visible children OR pageKey
    if (item.pageKey) {
        const hasVisibleTabs = hasAnyVisibleTab(item.pageKey, permissions, context);
        if (!hasVisibleTabs && !anyChildVisible) {
            return null;
        }
    }

    // Build result with filtered children
    const result: AdminMenuItem = {
        ...item,
        route: item.route || item.path
    };

    // Add visible children if any
    if (anyChildVisible) {
        (result as any).children = visibleChildren;
        // Default route: use first visible child's route
        const firstVisibleChild = visibleChildren.find(c => c.route);
        if (firstVisibleChild?.route && !item.pageKey) {
            result.route = firstVisibleChild.route;
        }
    }

    return result;
}

/**
 * Enterprise Menu Hook - SAP Grade
 * 
 * Uses navigationResolver as SINGLE DECISION CENTER
 */
export const useMenu = () => {
    const { activeTenantType, isLoading, authState } = useAuth();
    const { permissions } = usePermissions();

    const { data: approvalData } = usePendingApprovals();
    const pendingCount = approvalData?.count || 0;

    const isStable = authState === 'STABLE';
    const context: 'admin' | 'tenant' = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';
    const rawMenu = activeTenantType === 'SYSTEM' ? PLATFORM_MENU : TENANT_MENU;

    const filteredMenu = useMemo(() => {
        if (!isStable || permissions.length === 0) return [];

        // SAP-GRADE: Compute visibility using navigationResolver
        const visibleMenu = computeVisibleTree(rawMenu, permissions, context);

        // Approvals injection (only if has permission)
        const hasApprovalsPermission = permissions.includes('system.approvals.read');

        if (pendingCount > 0 && hasApprovalsPermission) {
            const approvalsItem: AdminMenuItem = {
                id: 'approvals',
                label: `Təsdiqləmələr`,
                title: `Təsdiqləmələr (${pendingCount})`,
                icon: 'CheckCircle2',
                path: '/admin/approvals?tab=pending',
                route: '/admin/approvals?tab=pending',
                pageKey: 'admin.approvals',
            };

            const dashboardIndex = visibleMenu.findIndex(i => i.id === 'dashboard');
            if (dashboardIndex !== -1) {
                visibleMenu.splice(dashboardIndex + 1, 0, approvalsItem);
            } else {
                visibleMenu.unshift(approvalsItem);
            }
        }

        return visibleMenu;
    }, [rawMenu, permissions, pendingCount, isStable, context]);

    const getFirstAllowedRoute = () => {
        if (filteredMenu.length === 0) {
            return '/access-denied';
        }
        const first = filteredMenu[0];
        return first.route || first.path || '/access-denied';
    };

    return {
        menu: filteredMenu,
        loading: isLoading,
        getFirstAllowedRoute
    };
};
