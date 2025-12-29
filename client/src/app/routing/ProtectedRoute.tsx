/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade Protected Route
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SINGLE SOURCE OF TRUTH: TAB_SUBTAB_REGISTRY
 * 
 * Rules:
 * 1. EXACT permission match only
 * 2. Unknown tab → terminal /access-denied
 * 3. Unauthorized tab → redirect to first allowed
 * 4. NO prefix matching
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { usePermissions } from '@/app/auth/hooks/usePermissions';
import {
    TAB_SUBTAB_REGISTRY,
    getFirstAllowedTab,
    getPageByPath,
    buildLandingPath,
    type PageConfig
} from '@/app/navigation/tabSubTab.registry';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface ProtectedRouteProps {
    requiredPermissions?: string[];
    requiredPermission?: string;
    mode?: 'any' | 'all';
    children?: React.ReactNode;
}

export const ProtectedRoute = ({
    requiredPermissions = [],
    requiredPermission,
    mode = 'all',
    children
}: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, authState, activeTenantType } = useAuth();
    const { canAny, canAll, canForTab, permissions } = usePermissions();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Normalize permissions
    const perms = [...requiredPermissions];
    if (requiredPermission) perms.push(requiredPermission);

    const context = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';
    const currentTab = searchParams.get('tab');
    const currentSubTab = searchParams.get('subTab');

    // ═══════════════════════════════════════════════════════════════════════
    // WAITING STATES
    // ═══════════════════════════════════════════════════════════════════════

    if (isLoading || authState === 'BOOTSTRAPPING' || authState === 'UNINITIALIZED') {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SAP-GRADE: Page + Tab validation using TAB_SUBTAB_REGISTRY
    // ═══════════════════════════════════════════════════════════════════════

    const basePath = location.pathname.split('?')[0];
    const pageConfig = getPageByPath(basePath, context);

    // If page not in registry, use legacy permission check
    if (!pageConfig) {
        const hasAccess = perms.length === 0
            ? true
            : mode === 'all' ? canAll(perms) : canAny(perms);

        if (!hasAccess) {
            return <Navigate to="/access-denied" state={{
                error: 'page_not_found',
                attempted: location.pathname
            }} replace />;
        }
        return children ? <>{children}</> : <Outlet />;
    }

    // Page has tabs - check tab access
    const hasTabs = pageConfig.tabs && pageConfig.tabs.length > 0;

    if (hasTabs) {
        const firstAllowed = getFirstAllowedTab(pageConfig.pageKey, permissions, context);

        if (!firstAllowed) {
            // NO tab access at all → terminal access-denied
            return <Navigate to="/access-denied" state={{
                error: 'no_tab_access',
                page: pageConfig.pageKey
            }} replace />;
        }

        if (currentTab) {
            // Check if tab exists in registry
            const tabConfig = pageConfig.tabs.find(t => t.key === currentTab);

            if (!tabConfig) {
                // UNKNOWN tab → terminal 403
                console.warn('[ProtectedRoute] UNKNOWN tab:', currentTab);
                return <Navigate to="/access-denied" state={{
                    error: 'unknown_tab',
                    attempted: `${location.pathname}?tab=${currentTab}`
                }} replace />;
            }

            // Check tab permission
            const hasTabAccess = canForTab(pageConfig.pageKey, currentTab, currentSubTab || undefined);

            if (!hasTabAccess) {
                // SAP-GRADE: UNAUTHORIZED tab → terminal 403 (NO silent rewrite)
                console.warn('[ProtectedRoute] Tab DENIED (terminal 403):', currentTab);
                return <Navigate to="/access-denied" state={{
                    error: 'unauthorized_tab',
                    attempted: `${location.pathname}?tab=${currentTab}`
                }} replace />;
            }

            // Check subTab if present
            if (currentSubTab && tabConfig.subTabs) {
                const subTabConfig = tabConfig.subTabs.find(st => st.key === currentSubTab);

                if (!subTabConfig) {
                    // UNKNOWN subTab → terminal 403
                    return <Navigate to="/access-denied" state={{
                        error: 'unknown_subtab',
                        attempted: `${location.pathname}?tab=${currentTab}&subTab=${currentSubTab}`
                    }} replace />;
                }

                if (!canForTab(pageConfig.pageKey, currentTab, currentSubTab)) {
                    // SAP-GRADE: UNAUTHORIZED subTab → terminal 403 (NO silent rewrite)
                    return <Navigate to="/access-denied" state={{
                        error: 'unauthorized_subtab',
                        attempted: `${location.pathname}?tab=${currentTab}&subTab=${currentSubTab}`
                    }} replace />;
                }
            }
        } else {
            // No tab specified → redirect to first allowed (this is the ONLY redirect allowed)
            return <Navigate to={buildLandingPath(basePath, firstAllowed)} replace />;
        }
    } else {
        // Page without tabs - simple permission check
        const hasAccess = perms.length === 0
            ? true
            : mode === 'all' ? canAll(perms) : canAny(perms);

        if (!hasAccess) {
            return <Navigate to="/access-denied" state={{
                error: 'permission_denied',
                page: pageConfig.pageKey
            }} replace />;
        }
    }

    return children ? <>{children}</> : <Outlet />;
};
