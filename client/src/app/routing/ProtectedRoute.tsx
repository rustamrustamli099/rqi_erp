import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePermissions } from '@/app/auth/hooks/usePermissions';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { useMenu } from '@/app/navigation/useMenu';
import { findFirstPathFromMenu } from '@/app/security/route-utils';
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
    const { isAuthenticated, isLoading, authState } = useAuth();
    const { hasAll, hasAny } = usePermissions();
    const location = useLocation();

    // Normalize permissions: Combine array and singular prop
    const perms = [...requiredPermissions];
    if (requiredPermission) perms.push(requiredPermission);

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

    // Permission Check
    const hasAccess = mode === 'all'
        ? hasAll(perms)
        : hasAny(perms);

    // Diagnostic Log
    if (!hasAccess) {
        console.warn("[ProtectedRoute] DENIED:", location.pathname, "Req:", perms);
    }

    // SAP-Grade Friendly Redirect (Task D)
    const { menu } = useMenu();

    if (!hasAccess) {
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
