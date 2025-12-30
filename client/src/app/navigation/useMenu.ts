
import { useMemo } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { usePermissions } from '@/app/auth/hooks/usePermissions';
import { PLATFORM_MENU, TENANT_MENU, type AdminMenuItem } from '@/app/navigation/menu.definitions';
import { MenuVisibilityEngine } from '@/domains/auth/utils/menu-visibility';
import { TAB_SUBTAB_REGISTRY } from '@/app/navigation/tabSubTab.registry';
import { firstAllowedTarget, normalizePermissions } from '@/app/security/rbacResolver';

import { usePendingApprovals } from '@/domains/approvals/hooks/useApprovals';

/**
 * Enterprise Menu Hook - SAP Grade
 * Flat Sidebar Model.
 * Uses rbacResolver for firstAllowedTarget
 */

export const useMenu = () => {
    const { activeTenantType, isLoading, authState } = useAuth();
    const { permissions } = usePermissions();

    // Approvals Hook (Polling)
    const { data: approvalData } = usePendingApprovals();
    const pendingCount = approvalData?.count || 0;

    // SAP-Grade Rule: Menu is invalid during BOOTSTRAPPING
    const isStable = authState === 'STABLE';
    const context = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';

    // 1. Select the correct tree based on context
    const rawMenu = activeTenantType === 'SYSTEM' ? PLATFORM_MENU : TENANT_MENU;
    const registry = context === 'admin' ? TAB_SUBTAB_REGISTRY.admin : TAB_SUBTAB_REGISTRY.tenant;

    // 2. Compute Visibility using resolver
    const filteredMenu = useMemo(() => {
        if (!isStable) return [];

        // Get normalized permissions once
        const permSet = normalizePermissions(permissions);

        // Base Menu from visibility engine
        const base = MenuVisibilityEngine.computeVisibleTree(rawMenu, permissions);

        // SAP-GRADE: Filter menu items to only those with allowed tabs
        const filtered = base.filter(item => {
            if (!item.pageKey) return true; // No pageKey means always visible
            
            // Find page in registry
            const page = registry.find(p => p.pageKey === item.pageKey);
            if (!page) return true; // Not in registry, allow
            
            // Use resolver to check if any tab is allowed
            const target = firstAllowedTarget({
                pageKey: item.pageKey,
                basePath: page.basePath,
                perms: permSet,
                context
            });
            
            return target !== null;
        });

        // Update each menu item's path to firstAllowedTarget
        const withResolvedPaths = filtered.map(item => {
            if (!item.pageKey) return item;
            
            const page = registry.find(p => p.pageKey === item.pageKey);
            if (!page) return item;
            
            const target = firstAllowedTarget({
                pageKey: item.pageKey,
                basePath: page.basePath,
                perms: permSet,
                context
            });
            
            if (target) {
                return { ...item, path: target, route: target };
            }
            return item;
        });

        // --- APPROVALS INJECTION ---
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

    /**
     * SAP-GRADE: Get first allowed route using resolver
     */
    const getFirstAllowedRoute = () => {
        if (filteredMenu.length === 0) {
            return '/access-denied';
        }

        // Use the already resolved path
        const first = filteredMenu[0];
        return first.path || first.route || '/access-denied';
    };

    return {
        menu: filteredMenu,
        loading: isLoading,
        getFirstAllowedRoute
    };
};
