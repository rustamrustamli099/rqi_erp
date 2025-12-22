import { Navigate } from "react-router-dom"
import { usePermissions } from "@/app/auth/hooks/usePermissions"
import { PermissionSlugs } from "@/app/security/permission-slugs"
import { PageLoader } from "@/shared/components/PageLoader"

/**
 * RootRedirect
 * 
 * Intelligent redirection based on user scope/permissions.
 * - System Admins -> /admin/dashboard
 * - Tenant Users -> /dashboard
 * - No Permissions -> /access-denied
 */
export function RootRedirect() {
    const { user, permissions, isLoading } = usePermissions()

    if (isLoading) {
        return <PageLoader />
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Priority 1: System Admin & Platform Staff
    // We check for the canonical dashboard view permission which is auto-hydrated by AuthContext
    if (permissions.includes(PermissionSlugs.PLATFORM.DASHBOARD.VIEW)) {
        return <Navigate to="/admin/dashboard" replace />
    }

    // Priority 2: Tenant User
    if (permissions.includes(PermissionSlugs.TENANT.DASHBOARD.VIEW)) {
        return <Navigate to="/dashboard" replace />
    }

    // Fallback: Access Denied
    return <Navigate to="/access-denied" replace />
}
