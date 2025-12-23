import { Routes, Route, Navigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
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
import { MonitoringRoutes } from "@/domains/system-console/monitoring/routes";
import { ProtectedRoute } from "@/app/routing/ProtectedRoute";
import { PermissionSlugs } from "@/app/security/permission-slugs";

export default function AdminRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.DASHBOARD.VIEW}>
                    <AdminDashboard />
                </ProtectedRoute>
            } />

            {/* Core Domains */}
            <Route path="users" element={
                <ProtectedRoute
                    requiredPermissions={[
                        PermissionSlugs.PLATFORM.USERS.VIEW,
                        PermissionSlugs.PLATFORM.USERS.CONNECT_TO_EMPLOYEE
                    ]}
                    mode="any"
                >
                    <UsersPage />
                </ProtectedRoute>
            } />

            <Route path="profile" element={<ProfilePage />} />

            {/* Modular Domains */}
            <Route path="branches/*" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.BRANCHES.VIEW}>
                    <BranchesRoutes />
                </ProtectedRoute>
            } />

            <Route path="files" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.FILES.VIEW}>
                    <FilesManagerPage />
                </ProtectedRoute>
            } />

            {/* Added Missing Modules */}
            <Route path="tenants" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.TENANTS.VIEW}>
                    <TenantList />
                </ProtectedRoute>
            } />

            <Route path="approvals" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.APPROVALS.VIEW}>
                    <ApprovalsPage />
                </ProtectedRoute>
            } />

            {/* Knowledge Base */}
            <Route path="guide" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.GUIDE.VIEW}>
                    <PlatformOverviewPage />
                </ProtectedRoute>
            } />

            {/* System Console */}
            <Route path="console" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.CONSOLE.VIEW}>
                    <ConsolePage />
                </ProtectedRoute>
            } />

            {/* Monitoring */}
            <Route path="monitoring/*" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.CONSOLE.DASHBOARD.READ}>
                    <MonitoringRoutes />
                </ProtectedRoute>
            } />

            {/* Developer Hub */}
            <Route path="developer" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.DEVELOPER.VIEW}>
                    <DeveloperHubPage />
                </ProtectedRoute>
            } />

            {/* Billing */}
            <Route path="billing/*" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.BILLING.VIEW}>
                    <BillingRoutes />
                </ProtectedRoute>
            } />

            {/* Finance */}
            <Route path="finance" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.BILLING.VIEW}>
                    <FinancePage />
                </ProtectedRoute>
            } />

            {/* Settings */}
            <Route path="settings" element={
                <ProtectedRoute
                    requiredPermission={PermissionSlugs.PLATFORM.SETTINGS.VIEW}
                >
                    <SettingsPage />
                </ProtectedRoute>
            } />



            <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
    );
}
