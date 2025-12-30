import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "@/domains/dashboard/views/AdminDashboard";
import UsersPage from "@/domains/identity/views/UsersPage";
import ProfilePage from "@/domains/identity/views/ProfilePage";
import SettingsPage from "@/domains/settings/SettingsPage";
import PlatformOverviewPage from "@/domains/system-guide/views/PlatformOverviewPage";
import ConsolePage from "@/domains/system-console/ConsolePage";
import DeveloperHubPage from "@/domains/system-console/DeveloperHubPage";
import FinancePage from "@/domains/finance/views/FinancePage";
import TenantList from "@/domains/tenant/views/TenantList";
import ApprovalsPage from "@/domains/approvals/views/ApprovalsPage";
import FilesManagerPage from "@/domains/file-manager/views/FilesManagerPage";

// New Domain Routes
import { BillingRoutes } from "@/domains/billing/routes";
import { BranchesRoutes } from "@/domains/branches/routes";
import { ProtectedRoute } from "@/app/routing/ProtectedRoute";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SAP-Grade Admin Routes
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ALL authorization is handled by ProtectedRoute + evaluateRoute().
 * NO legacy requiredPermission/requiredPermissions props.
 * 
 * If a route is not in TAB_SUBTAB_REGISTRY, evaluateRoute returns DENY.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function AdminRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />

            {/* Dashboard */}
            <Route path="dashboard" element={
                <ProtectedRoute>
                    <AdminDashboard />
                </ProtectedRoute>
            } />

            {/* Users */}
            <Route path="users" element={
                <ProtectedRoute>
                    <UsersPage />
                </ProtectedRoute>
            } />

            {/* Profile - always accessible if authenticated */}
            <Route path="profile" element={
                <ProtectedRoute>
                    <ProfilePage />
                </ProtectedRoute>
            } />

            {/* Branches */}
            <Route path="branches/*" element={
                <ProtectedRoute>
                    <BranchesRoutes />
                </ProtectedRoute>
            } />

            {/* Files */}
            <Route path="files" element={
                <ProtectedRoute>
                    <FilesManagerPage />
                </ProtectedRoute>
            } />

            {/* Tenants */}
            <Route path="tenants" element={
                <ProtectedRoute>
                    <TenantList />
                </ProtectedRoute>
            } />

            {/* Approvals */}
            <Route path="approvals" element={
                <ProtectedRoute>
                    <ApprovalsPage />
                </ProtectedRoute>
            } />

            {/* Guide */}
            <Route path="guide" element={
                <ProtectedRoute>
                    <PlatformOverviewPage />
                </ProtectedRoute>
            } />

            {/* System Console */}
            <Route path="console" element={
                <ProtectedRoute>
                    <ConsolePage />
                </ProtectedRoute>
            } />

            {/* Developer Hub */}
            <Route path="developer" element={
                <ProtectedRoute>
                    <DeveloperHubPage />
                </ProtectedRoute>
            } />

            {/* Billing */}
            <Route path="billing/*" element={
                <ProtectedRoute>
                    <BillingRoutes />
                </ProtectedRoute>
            } />

            {/* Finance */}
            <Route path="finance" element={
                <ProtectedRoute>
                    <FinancePage />
                </ProtectedRoute>
            } />

            {/* Settings */}
            <Route path="settings" element={
                <ProtectedRoute>
                    <SettingsPage />
                </ProtectedRoute>
            } />

            {/* Catch-all: redirect to dashboard (evaluateRoute will handle) */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
    );
}
