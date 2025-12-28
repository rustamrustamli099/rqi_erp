import { Navigate } from "react-router-dom"
import { useAuth } from "@/domains/auth/context/AuthContext"
import { useMenu } from "@/app/navigation/useMenu"
import { PageLoader } from "@/shared/components/PageLoader"
import { PermissionPreviewEngine } from "@/domains/auth/utils/permissionPreviewEngine"
import { useMemo } from "react"

/**
 * RootRedirect
 * 
 * SAP-Grade intelligent redirection based on user scope/permissions.
 * Uses PermissionPreviewEngine for deterministic landing path.
 */
export function RootRedirect() {
    const { isAuthenticated, isLoading, authState, permissions, activeTenantType } = useAuth();
    const { getFirstAllowedRoute } = useMenu();

    // Preview Engine Result (memoized)
    const context = activeTenantType === 'SYSTEM' ? 'admin' : 'tenant';
    const previewResult = useMemo(() => {
        if (authState !== 'STABLE' || !permissions) return null;
        return PermissionPreviewEngine.run(permissions, context);
    }, [permissions, context, authState]);

    // SAP-Grade Auth FSM Implementation
    // -------------------------------------------------------------
    // State 1: BOOTSTRAP / TOKEN_CHECK
    // Strict Rule: No redirects while loading.
    if (isLoading || authState === 'BOOTSTRAPPING' || authState === 'UNINITIALIZED') {
        return <PageLoader />;
    }

    // State 2: UNAUTHENTICATED
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // State 3: AUTH_READY (Stable Session)
    // Use Preview Engine for deterministic landing path
    const targetRoute = previewResult?.firstLandingPath || getFirstAllowedRoute();

    // State 4: DENIED_TERMINAL (Zero Permissions)
    if (!targetRoute || targetRoute === '/access-denied') {
        console.warn("[RootRedirect] Access Denied: User has no valid routes.");
        return <Navigate to="/access-denied" state={{ error: 'access_denied_redirect' }} replace />;
    }

    // Success: Redirect to calculated landing path
    if (import.meta.env.DEV) {
        console.log(`[RootRedirect] Landing: ${targetRoute}`);
    }

    return <Navigate to={targetRoute} replace />;
}

