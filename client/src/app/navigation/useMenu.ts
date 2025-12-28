
import { useMemo } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { usePermissions } from '@/app/auth/hooks/usePermissions';
import { PLATFORM_MENU, TENANT_MENU, type AdminMenuItem } from '@/app/navigation/menu.definitions';
import { MenuVisibilityEngine } from '@/domains/auth/utils/menu-visibility';
import { RBAC_REGISTRY, getFirstAllowedTab } from '@/app/security/rbac.registry';

import { usePendingApprovals } from '@/domains/approvals/hooks/useApprovals';
import { CheckCircle2 } from 'lucide-react';

/**
 * Enterprise Menu Hook - SAP Grade
 * Flat Sidebar Model.
 */

export const useMenu = () => {
    const { activeTenantType, isLoading, authState } = useAuth();
    const { permissions } = usePermissions(); // Get raw string array

    // Approvals Hook (Polling)
    const { data: approvalData } = usePendingApprovals();
    const pendingCount = approvalData?.count || 0;

    // SAP-Grade Rule: Menu is invalid during BOOTSTRAPPING
    const isStable = authState === 'STABLE';

    // 1. Select the correct tree based on context
    const rawMenu = activeTenantType === 'SYSTEM' ? PLATFORM_MENU : TENANT_MENU;
    const context = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';
    const registry = context === 'admin' ? RBAC_REGISTRY.admin : RBAC_REGISTRY.tenant;

    // 2. Compute Visibility (Flat Prefix Match)
    const filteredMenu = useMemo(() => {
        // Debugging Hook
        // console.log(`[useMenu] ActiveType: ${activeTenantType}, Permissions: ${permissions?.length}, RawMenu: ${rawMenu?.length}`);

        // SAP-Grade Safety Force Empty if not Stable
        if (!isStable) return [];

        // Base Menu
        const base = MenuVisibilityEngine.computeVisibleTree(rawMenu, permissions);

        // --- APPROVALS INJECTION (Permission + Count Check) ---
        // SAP-GRADE FIX: pendingCount alone is NOT enough
        // User MUST have system.approvals.read permission
        const hasApprovalsPermission = permissions.some(p =>
            p.startsWith('system.approvals') || p === 'system.approvals.read'
        );

        if (pendingCount > 0 && hasApprovalsPermission) {
            const approvalsItem: AdminMenuItem = {
                id: 'approvals',
                label: `Təsdiqləmələr`,
                title: `Təsdiqləmələr (${pendingCount})`,
                icon: 'CheckCircle2',
                path: '/admin/approvals',
                route: '/admin/approvals',
                permissionPrefixes: ['system.approvals'],
            };

            // Insert after Dashboard (index 0 usually)
            const dashboardIndex = base.findIndex(i => i.id === 'dashboard');
            if (dashboardIndex !== -1) {
                base.splice(dashboardIndex + 1, 0, approvalsItem);
            } else {
                base.unshift(approvalsItem);
            }
        }

        return base;
    }, [rawMenu, permissions, activeTenantType, pendingCount]);

    /**
     * SAP-GRADE: Get first allowed route with proper tab handling
     * 
     * Rules:
     * 1. Find first visible menu item
     * 2. If menu has tabs, find FIRST ALLOWED TAB (not default)
     * 3. Append ?tab=X to route
     * 4. Never return dashboard if user only has sub-tab permissions
     */
    const getFirstAllowedRoute = () => {
        if (filteredMenu.length === 0) {
            return '/access-denied';
        }

        const first = filteredMenu[0];
        let route = first.route || first.path || '/access-denied';

        // SAP-GRADE: Check if this menu has tabs and find first allowed tab
        if (first.id && registry[first.id]?.tabs) {
            const allowedTab = getFirstAllowedTab(first.id, permissions, context);
            if (allowedTab) {
                route += `?tab=${allowedTab}`;
            } else if (first.tab) {
                // Fallback to default tab if defined
                route += `?tab=${first.tab}`;
            }
        } else if (first.tab) {
            // Legacy support: append default tab if exists
            route += `?tab=${first.tab}`;
        }

        return route;
    };

    return {
        menu: filteredMenu, // Returns AdminMenuItem[]
        loading: isLoading,
        getFirstAllowedRoute
    };
};
