
import { useMemo } from 'react';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { usePermissions } from '@/app/auth/hooks/usePermissions';
import { PLATFORM_MENU, TENANT_MENU, type AdminMenuItem } from '@/app/navigation/menu.definitions';
import { MenuVisibilityEngine } from '@/domains/auth/utils/menu-visibility';

/**
 * Enterprise Menu Hook - SAP Grade
 * Flat Sidebar Model.
 */

export const useMenu = () => {
    const { activeTenantType, isLoading } = useAuth();
    const { permissions } = usePermissions(); // Get raw string array

    // 1. Select the correct tree based on context
    const rawMenu = activeTenantType === 'SYSTEM' ? PLATFORM_MENU : TENANT_MENU;

    // 2. Compute Visibility (Flat Prefix Match)
    const filteredMenu = useMemo(() => {
        // Debugging Hook
        console.log(`[useMenu] ActiveType: ${activeTenantType}, Permissions: ${permissions?.length}, RawMenu: ${rawMenu?.length}`);

        // Pass permissions array directly
        return MenuVisibilityEngine.computeVisibleTree(rawMenu, permissions);
    }, [rawMenu, permissions, activeTenantType]);

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
