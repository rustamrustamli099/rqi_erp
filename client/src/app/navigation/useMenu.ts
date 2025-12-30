
import { useMemo } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { usePermissions } from '@/app/auth/hooks/usePermissions';
import { PLATFORM_MENU, TENANT_MENU, type AdminMenuItem } from '@/app/navigation/menu.definitions';
import { TAB_SUBTAB_REGISTRY } from '@/app/navigation/tabSubTab.registry';
import { getAllowedTabs, getFirstAllowedTarget } from '@/app/security/navigationResolver';
import { usePendingApprovals } from '@/domains/approvals/hooks/useApprovals';

/**
 * Enterprise Menu Hook - SAP Grade
 * Uses navigationResolver for visibility and links.
 * EXACT permission match only.
 */

export const useMenu = () => {
    const { activeTenantType, isLoading, authState } = useAuth();
    const { permissions } = usePermissions();

    const { data: approvalData } = usePendingApprovals();
    const pendingCount = approvalData?.count || 0;

    const isStable = authState === 'STABLE';
    const context = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';
    const rawMenu = activeTenantType === 'SYSTEM' ? PLATFORM_MENU : TENANT_MENU;
    const registry = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;

    const filteredMenu = useMemo(() => {
        if (!isStable) return [];

        // Filter menu items using resolver
        const filtered = rawMenu.filter(item => {
            if (!item.pageKey) return true;

            // Check if page has any allowed tabs
            const allowedTabs = getAllowedTabs(item.pageKey, permissions, context);
            return allowedTabs.length > 0;
        });

        // Set each item's path to first allowed target
        const withResolvedPaths = filtered.map(item => {
            if (!item.pageKey) return item;

            const page = registry.find(p => p.pageKey === item.pageKey);
            if (!page) return item;

            const target = getFirstAllowedTarget(item.pageKey, permissions, context);
            if (target) {
                return { ...item, path: target, route: target };
            }
            return item;
        });

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

            const dashboardIndex = withResolvedPaths.findIndex(i => i.id === 'dashboard');
            if (dashboardIndex !== -1) {
                withResolvedPaths.splice(dashboardIndex + 1, 0, approvalsItem);
            } else {
                withResolvedPaths.unshift(approvalsItem);
            }
        }

        return withResolvedPaths;
    }, [rawMenu, permissions, activeTenantType, pendingCount, isStable, context, registry]);

    const getFirstAllowedRoute = () => {
        if (filteredMenu.length === 0) {
            return '/access-denied';
        }
        const first = filteredMenu[0];
        return first.path || first.route || '/access-denied';
    };

    return {
        menu: filteredMenu,
        loading: isLoading,
        getFirstAllowedRoute
    };
};
