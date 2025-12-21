import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePermissions } from '@/app/auth/hooks/usePermissions';
import { useAuth } from '@/domains/auth/context/AuthContext';
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
    const { isAuthenticated, isLoading } = useAuth();
    const { hasAll, hasAny } = usePermissions();
    const location = useLocation();

    // Normalize permissions: Combine array and singular prop
    const perms = [...requiredPermissions];
    if (requiredPermission) perms.push(requiredPermission);

    if (isLoading) {
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

    if (!hasAccess) {
        if (!hasAccess) {
            return <Navigate to="/admin/access-denied" replace />;
        }
    }

    return children ? <>{children}</> : <Outlet />;
};
