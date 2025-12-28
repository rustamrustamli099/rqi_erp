
import { useMemo } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { usePermissions } from '@/app/auth/hooks/usePermissions';
import { PLATFORM_MENU, TENANT_MENU, type AdminMenuItem } from '@/app/navigation/menu.definitions';
import { MenuVisibilityEngine } from '@/domains/auth/utils/menu-visibility';
import { TAB_SUBTAB_REGISTRY, getFirstAllowedTab, buildLandingPath, getPageByKey } from '@/app/navigation/tabSubTab.registry';

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
    const registry = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;

    // 2. Compute Visibility (Flat Prefix Match)
    const filteredMenu = useMemo(() => {
        // Debugging Hook
        // console.log(`[useMenu] ActiveType: ${activeTenantType}, Permissions: ${permissions?.length}, RawMenu: ${rawMenu?.length}`);

        // SAP-Grade Safety Force Empty if not Stable
        if (!isStable) return [];

        // Base Menu
        const base = MenuVisibilityEngine.computeVisibleTree(rawMenu, permissions);

        // --- APPROVALS INJECTION (Permission + Count Check) ---
        // SAP-GRADE: pendingCount alone is NOT enough
        // User MUST have EXACT system.approvals.read permission
        const hasApprovalsPermission = permissions.some(p => {
            const base = p.replace(/\.(read|create|update|delete|approve|export)$/, '');
            return base === 'system.approvals';
        });

        if (pendingCount > 0 && hasApprovalsPermission) {
            const approvalsItem: AdminMenuItem = {
                id: 'approvals',
                label: `Təsdiqləmələr`,
                title: `Təsdiqləmələr (${pendingCount})`,
                icon: 'CheckCircle2',
                path: '/admin/approvals',
                route: '/admin/approvals',
                pageKey: 'admin.approvals',
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
     * Uses TAB_SUBTAB_REGISTRY + buildLandingPath
     */
    const getFirstAllowedRoute = () => {
        if (filteredMenu.length === 0) {
            return '/access-denied';
        }

        const first = filteredMenu[0];
        const basePath = first.route || first.path || '/access-denied';

        // SAP-GRADE: Use pageKey to find first allowed tab
        if (first.pageKey) {
            const allowedTab = getFirstAllowedTab(first.pageKey, permissions, context);
            if (allowedTab) {
                return buildLandingPath(basePath, allowedTab);
            }
        }

        return basePath;
    };

    return {
        menu: filteredMenu, // Returns AdminMenuItem[]
        loading: isLoading,
        getFirstAllowedRoute
    };
};
