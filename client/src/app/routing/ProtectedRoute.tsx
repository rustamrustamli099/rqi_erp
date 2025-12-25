import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { usePermissions } from '@/app/auth/hooks/usePermissions';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { useMenu } from '@/app/navigation/useMenu';
import { findFirstPathFromMenu } from '@/app/security/route-utils';
import { PermissionPreviewEngine } from '@/app/security/permission-preview.engine';
import { RBAC_REGISTRY } from '@/app/security/rbac.registry';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface ProtectedRouteProps {
    requiredPermissions?: string[];
    requiredPermission?: string; // Support singular prop for convenience
    mode?: 'any' | 'all';
    children?: React.ReactNode;
}

export const ProtectedRoute = ({
    requiredPermissions = [],
    requiredPermission,
    mode = 'all',
    children
}: ProtectedRouteProps) => {
    // ═══════════════════════════════════════════════════════════════════════
    // ALL HOOKS MUST BE AT THE TOP - React Rules of Hooks
    // ═══════════════════════════════════════════════════════════════════════
    const { isAuthenticated, isLoading, authState, permissions, activeTenantType } = useAuth();
    const { hasAll, hasAny } = usePermissions();
    const { menu } = useMenu(); // MUST be called before any conditional returns
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Normalize permissions: Combine array and singular prop
    const perms = [...requiredPermissions];
    if (requiredPermission) perms.push(requiredPermission);

    // ═══════════════════════════════════════════════════════════════════════
    // CONDITIONAL RETURNS (after all hooks)
    // ═══════════════════════════════════════════════════════════════════════

    // SAP-Grade State Machine: WAIT during BOOTSTRAPPING
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

    // Route-Level Permission Check
    const hasRouteAccess = perms.length === 0
        ? true
        : mode === 'all' ? hasAll(perms) : hasAny(perms);

    // SAP-Grade: Tab-Level Permission Check
    const currentTab = searchParams.get('tab');
    const context = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';

    if (currentTab) {
        const allowedTab = PermissionPreviewEngine.getFirstAllowedTabForPath(
            location.pathname,
            permissions,
            context
        );

        // If current tab is not allowed, redirect to first allowed tab
        if (allowedTab !== null) {
            const visibleTabs = PermissionPreviewEngine.getVisibleTabs(
                getMenuIdFromPath(location.pathname),
                permissions,
                context
            ).filter(t => t.hasAccess).map(t => t.tabId);

            if (!visibleTabs.includes(currentTab)) {
                console.warn('[ProtectedRoute] Tab DENIED:', currentTab, '→ Redirecting to:', allowedTab);
                const newPath = `${location.pathname}?tab=${allowedTab}`;
                return <Navigate to={newPath} replace />;
            }
        }
    }

    // Diagnostic Log
    if (!hasRouteAccess) {
        console.warn("[ProtectedRoute] Route DENIED:", location.pathname, "Req:", perms);
    }

    // SAP-Grade Friendly Redirect
    if (!hasRouteAccess) {
        const target = findFirstPathFromMenu(menu);

        // Prevent Loop: If target is same as current (unlikely due to perm check) or null
        // Also check if we are ALREADY at /access-denied
        if (target && target !== location.pathname + location.search) {
            return <Navigate to={target} replace />;
        }

        return <Navigate to="/access-denied" state={{ error: 'access_denied_redirect' }} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

/**
 * Extract menu ID from path using RBAC_REGISTRY
 * Maps URL path to registry key
 */
function getMenuIdFromPath(path: string): string {
    // Check admin registry
    for (const [menuId, config] of Object.entries(RBAC_REGISTRY.admin)) {
        if (path.startsWith((config as any).path)) {
            return menuId;
        }
    }

    // Check tenant registry
    for (const [menuId, config] of Object.entries(RBAC_REGISTRY.tenant)) {
        if (path.startsWith((config as any).path)) {
            return menuId;
        }
    }

    // Fallback: extract last segment
    const segments = path.split('/').filter(Boolean);
    return segments[segments.length - 1] || '';
}
