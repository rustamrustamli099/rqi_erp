/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PHASE 14H.4: Auth-Only Protected Route
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RULE: This component checks ONLY authentication status.
 * It does NOT make any authorization decisions.
 * 
 * ALLOWED:
 * - if no token/session → redirect to /login
 * - else → render children/Outlet
 * 
 * FORBIDDEN:
 * - permission checks
 * - evaluateRoute() calls
 * - ALLOW/REDIRECT/DENY decisions based on permissions
 * 
 * Authorization is handled by:
 * - Backend DecisionCenterService
 * - PageGate component (consumes pageState.authorized)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface ProtectedRouteProps {
    children?: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, authState } = useAuth();
    const location = useLocation();

    // 1. Loading state - show skeleton
    if (isLoading || authState === 'BOOTSTRAPPING') {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // 2. Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Authenticated - render children
    // Authorization decisions are made by PageGate at page level
    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
