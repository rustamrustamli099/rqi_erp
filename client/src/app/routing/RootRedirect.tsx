import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import { selectCurrentUser } from "@/domains/auth"
import { PermissionSlugs } from "@/app/security/permission-slugs"

/**
 * RootRedirect
 * 
 * Intelligent redirection based on user scope/permissions.
 * - System Admins -> /admin
 * - Tenant Users -> /dashboard
 * - No Permissions -> /access-denied
 */
export function RootRedirect() {
    const user = useSelector(selectCurrentUser)

    if (!user) {
        return <Navigate to="/login" replace />
    }

    const permissions = user.permissions || []

    // Priority 1: System Admin
    if (permissions.includes(PermissionSlugs.PLATFORM.DASHBOARD.VIEW)) {
        return <Navigate to="/admin" replace />
    }

    // Priority 2: Tenant User
    if (permissions.includes(PermissionSlugs.TENANT.DASHBOARD.VIEW)) {
        return <Navigate to="/dashboard" replace />
    }

    // Fallback: Access Denied
    return <Navigate to="/access-denied" replace />
}
