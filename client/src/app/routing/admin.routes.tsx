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
import { PageGate } from "@/app/security/PageGate";

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
                    <PageGate pageKey="Z_USERS">
                        <UsersPage />
                    </PageGate>
                </ProtectedRoute>
            } />

            {/* Profile - always accessible if authenticated */}
            <Route path="profile" element={
                <ProtectedRoute>
                    <PageGate pageKey="Z_PROFILE">
                        <ProfilePage />
                    </PageGate>
                </ProtectedRoute>
            } />

            {/* Branches */}
            <Route path="branches/*" element={
                <ProtectedRoute>
                    <PageGate pageKey="Z_BRANCHES">
                        <BranchesRoutes />
                    </PageGate>
                </ProtectedRoute>
            } />

            {/* Files */}
            <Route path="files" element={
                <ProtectedRoute>
                    <PageGate pageKey="Z_FILES">
                        <FilesManagerPage />
                    </PageGate>
                </ProtectedRoute>
            } />

            {/* Tenants */}
            <Route path="tenants" element={
                <ProtectedRoute>
                    <PageGate pageKey="Z_TENANTS">
                        <TenantList />
                    </PageGate>
                </ProtectedRoute>
            } />

            {/* Approvals */}
            <Route path="approvals" element={
                <ProtectedRoute>
                    <PageGate pageKey="Z_APPROVALS">
                        <ApprovalsPage />
                    </PageGate>
                </ProtectedRoute>
            } />

            {/* Guide */}
            <Route path="guide" element={
                <ProtectedRoute>
                    <PageGate pageKey="Z_GUIDE">
                        <PlatformOverviewPage />
                    </PageGate>
                </ProtectedRoute>
            } />

            {/* System Console */}
            <Route path="console" element={
                <ProtectedRoute>
                    <PageGate pageKey="Z_CONSOLE">
                        <ConsolePage />
                    </PageGate>
                </ProtectedRoute>
            } />

            {/* Developer Hub */}
            <Route path="developer" element={
                <ProtectedRoute>
                    <PageGate pageKey="Z_DEVELOPER">
                        <DeveloperHubPage />
                    </PageGate>
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
                    <PageGate pageKey="Z_FINANCE">
                        <FinancePage />
                    </PageGate>
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
