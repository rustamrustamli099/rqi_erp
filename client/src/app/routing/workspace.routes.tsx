import { Routes, Route, Navigate } from "react-router-dom"
import { ProtectedRoute } from "@/app/routing/ProtectedRoute"
import { PermissionSlugs } from "@/app/security/permission-slugs"
import TenantDashboard from "@/domains/dashboard/views/TenantDashboard"

/**
 * Workspace Routes
 * 
 * Default portal for Tenant Users (Non-Admin).
 * Mounted at: /dashboard/* or /workspace/*
 */
export default function WorkspaceRoutes() {
    return (
        <Routes>
            <Route index element={
                <ProtectedRoute requiredPermission={PermissionSlugs.TENANT.DASHBOARD.VIEW}>
                    <TenantDashboard />
                </ProtectedRoute>
            } />

            {/* Add other tenant module routes here later (e.g. My Profile, My Tasks) */}

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}
