
import { useMemo } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { usePermissions } from '@/app/auth/hooks/usePermissions';
import { PLATFORM_MENU, TENANT_MENU, type AdminMenuItem } from '@/app/navigation/menu.definitions';
import { MenuVisibilityEngine } from '@/domains/auth/utils/menu-visibility';

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

    // 2. Compute Visibility (Flat Prefix Match)
    const filteredMenu = useMemo(() => {
        // Debugging Hook
        // console.log(`[useMenu] ActiveType: ${activeTenantType}, Permissions: ${permissions?.length}, RawMenu: ${rawMenu?.length}`);

        // SAP-Grade Safety Force Empty if not Stable
        if (!isStable) return [];

        // Base Menu
        const base = MenuVisibilityEngine.computeVisibleTree(rawMenu, permissions);

        // --- APPROVALS INJECTION (Strict Visibility) ---
        if (pendingCount > 0) {
            // Inject at top positions (e.g. after Dashboard)
            // or as first item if critical? SAP usually puts Worklist/Inbox at top.
            // Let's put it as index 1 (after Dashboard).

            const approvalsItem: AdminMenuItem = {
                id: 'approvals',
                label: `Təsdiqləmələr`, // Label for tooltip
                title: `Təsdiqləmələr (${pendingCount})`, // Title with Count for Sidebar
                icon: 'CheckCircle2', // Lucide icon name
                path: '/admin/approvals',
                route: '/admin/approvals',
                // No explicit permissions required here because 'pendingCount > 0' IMPLIES eligibility via backend
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

    const getFirstAllowedRoute = () => {
        // For flat menu, first visible item is the landing page
        if (filteredMenu.length > 0) {
            const first = filteredMenu[0];
            let route = first.route;
            // Append default tab if exists
            if (first.tab) {
                route += `?tab=${first.tab}`;
            }
            return route;
        }
        return '/access-denied';
    };

    return {
        menu: filteredMenu, // Returns AdminMenuItem[]
        loading: isLoading,
        getFirstAllowedRoute
    };
};
