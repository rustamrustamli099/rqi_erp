/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade Protected Route (Flicker-Free)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Uses rbacResolver for ALL authorization decisions.
 * 
 * Rules:
 * 1. EXACT permission match only
 * 2. Flicker-free: redirect to allowed tab if exists
 * 3. Terminal 403 ONLY when zero allowed tabs
 * 4. NO prefix matching
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { usePermissions } from '@/app/auth/hooks/usePermissions';
import {
    resolveSafeLocation,
    isTerminal403,
    buildUrl,
    normalizePermissions
} from '@/app/security/rbacResolver';
import { getPageByPath, buildLandingPath, getFirstAllowedTab } from '@/app/navigation/tabSubTab.registry';
import { Loader2 } from 'lucide-react';
import React, { useMemo } from 'react';

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
    const { canAny, canAll, permissions } = usePermissions();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Normalize permissions for exact matching
    const perms = [...requiredPermissions];
    if (requiredPermission) perms.push(requiredPermission);

    const context = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';

    // Memoize normalized permissions set
    const permSet = useMemo(() => normalizePermissions(permissions), [permissions]);

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
    // SAP-GRADE: Use RBAC Resolver for flicker-free navigation
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

    // Page has tabs - use resolver for flicker-free navigation
    const hasTabs = pageConfig.tabs && pageConfig.tabs.length > 0;

    if (hasTabs) {
        // Use the resolver to determine safe location
        const result = resolveSafeLocation({
            pathname: location.pathname,
            search: location.search,
            perms: permSet,
            context
        });

        // TERMINAL 403: No allowed tabs at all
        if (isTerminal403(result)) {
            return <Navigate to="/access-denied" state={{
                error: 'no_tab_access',
                reason: result.reason,
                page: pageConfig.pageKey
            }} replace />;
        }

        // Check if we need to redirect (current URL differs from safe URL)
        const safeUrl = buildUrl(result);
        const currentUrl = `${location.pathname}${location.search}`;

        if (safeUrl !== currentUrl) {
            // FLICKER-FREE: Redirect directly to allowed tab (no /access-denied)
            console.log('[ProtectedRoute] Redirecting to safe location:', safeUrl);
            return <Navigate to={safeUrl} replace />;
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
