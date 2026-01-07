/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade Protected Route (USES NAVIGATION RESOLVER)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RULES:
 * 1. Calls evaluateRoute() ONCE
 * 2. ALLOW → render children
 * 3. REDIRECT → Navigate directly (NO /access-denied)
 * 4. DENY → terminal AccessDenied (no auto-redirect)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/domains/auth/context/AuthContext';
import { evaluateRoute } from '@/app/security/navigationResolver';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface ProtectedRouteProps {
    children?: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, authState, activeTenantType, permissions } = useAuth();
    const location = useLocation();
    const [searchParams] = useSearchParams();

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

    // 3. Determine context
    const context = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';

    // 4. SINGLE DECISION POINT: evaluateRoute
    const decision = evaluateRoute(
        location.pathname,
        searchParams,
        permissions,
        context
    );

    // DEBUG - SİL SONRA
    if (import.meta.env?.DEV) {
        console.log('[ProtectedRoute] Decision:', {
            path: location.pathname,
            params: searchParams.toString(),
            decision: decision.decision,
            normalized: decision.decision === 'REDIRECT' ? decision.normalizedUrl : undefined,
            reason: decision.decision === 'DENY' ? decision.reason : undefined
        });
    }

    // 5. Handle decision
    switch (decision.decision) {
        case 'ALLOW':
            return children ? <>{children}</> : <Outlet />;

        case 'REDIRECT':
            // Direct redirect - NO /access-denied intermediate
            console.log('[ProtectedRoute] REDIRECT to:', decision.normalizedUrl);
            return <Navigate to={decision.normalizedUrl} replace />;

        case 'DENY':
            // Terminal AccessDenied - no navigation
            console.log('[ProtectedRoute] DENY:', decision.reason);
            return <Navigate to="/access-denied" state={{
                error: 'no_access',
                reason: decision.reason
            }} replace />;

        default:
            return children ? <>{children}</> : <Outlet />;
    }
};

export default ProtectedRoute;
