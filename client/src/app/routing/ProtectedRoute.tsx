import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { usePermissions } from '@/app/auth/hooks/usePermissions';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { useMenu } from '@/app/navigation/useMenu';
import { findFirstPathFromMenu } from '@/app/security/route-utils';
import { PermissionPreviewEngine } from '@/app/security/permission-preview.engine';
import { RBAC_REGISTRY, getFirstAllowedTab, canAccessTab } from '@/app/security/rbac.registry';
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

    // Context and Menu ID extraction
    const context = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';
    const menuId = getMenuIdFromPath(location.pathname);
    const currentTab = searchParams.get('tab');

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

    // ═══════════════════════════════════════════════════════════════════════
    // SAP-GRADE RBAC: Tab-based permission check (NOT parent permission)
    // ═══════════════════════════════════════════════════════════════════════

    // Check if this menu has tabs
    const registry = context === 'admin' ? RBAC_REGISTRY.admin : RBAC_REGISTRY.tenant;
    const menuConfig = registry[menuId];
    const hasTabs = menuConfig?.tabs && Object.keys(menuConfig.tabs).length > 0;

    let hasRouteAccess = true;

    if (hasTabs) {
        // SAP-GRADE: For tab-based menus, check if user can access ANY tab
        const firstAllowedTab = getFirstAllowedTab(menuId, permissions, context);

        if (!firstAllowedTab) {
            // User has NO tab access at all
            hasRouteAccess = false;
        } else if (currentTab) {
            // User is trying to access a specific tab - validate it
            const canAccess = canAccessTab(menuId, currentTab, permissions, context);

            if (!canAccess) {
                // Redirect to first allowed tab instead of access-denied
                console.warn('[ProtectedRoute] Tab DENIED:', currentTab, '→ Redirecting to:', firstAllowedTab);
                const newPath = `${location.pathname}?tab=${firstAllowedTab}`;
                return <Navigate to={newPath} replace />;
            }
        } else {
            // No tab specified - redirect to first allowed tab
            const newPath = `${location.pathname}?tab=${firstAllowedTab}`;
            return <Navigate to={newPath} replace />;
        }
    } else {
        // Non-tab menu: use traditional permission check
        hasRouteAccess = perms.length === 0
            ? true
            : mode === 'all' ? hasAll(perms) : hasAny(perms);
    }

    // Diagnostic Log
    if (!hasRouteAccess) {
        console.warn("[ProtectedRoute] Route DENIED:", location.pathname, "Req:", perms, "MenuId:", menuId);
    }

    // SAP-GRADE: Terminal /access-denied - NO dashboard fallback
    if (!hasRouteAccess) {
        // INVARIANT: No silent redirect to dashboard
        // If user has no access, they see /access-denied (terminal state)
        return <Navigate to="/access-denied" state={{
            error: 'access_denied_terminal',
            attempted: location.pathname + location.search,
            menuId
        }} replace />;
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
