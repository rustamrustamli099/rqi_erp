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

            <Route path="profile" element={
                <ProtectedRoute>
                    <ProfilePage />
                </ProtectedRoute>
            } />

            {/* Modular Domains */}
            <Route path="branches/*" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.SYSTEM.BRANCHES.VIEW}>
                    <BranchesRoutes />
                </ProtectedRoute>
            } />

            <Route path="files" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.SYSTEM.FILES.VIEW}>
                    <FilesManagerPage />
                </ProtectedRoute>
            } />

            {/* Added Missing Modules */}
            <Route path="tenants" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.SYSTEM.TENANTS.VIEW}>
                    <TenantList />
                </ProtectedRoute>
            } />

            <Route path="approvals" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.SYSTEM.APPROVALS.VIEW}>
                    <ApprovalsPage />
                </ProtectedRoute>
            } />

            {/* Knowledge Base */}
            <Route path="guide" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.SYSTEM.GUIDE.VIEW}>
                    <PlatformOverviewPage />
                </ProtectedRoute>
            } />

            {/* System Console */}
            <Route path="system-console" element={
                <ProtectedRoute
                    requiredPermissions={[
                        PermissionSlugs.SYSTEM.CONSOLE.DASHBOARD.READ,
                        PermissionSlugs.SYSTEM.CONSOLE.MONITORING.READ,
                        PermissionSlugs.SYSTEM.CONSOLE.AUDIT.READ,
                        PermissionSlugs.SYSTEM.CONSOLE.SCHEDULER.READ,
                        PermissionSlugs.SYSTEM.CONSOLE.RETENTION.READ,
                        PermissionSlugs.SYSTEM.CONSOLE.FEATURES.READ,
                        PermissionSlugs.SYSTEM.CONSOLE.POLICY.READ,
                        PermissionSlugs.SYSTEM.CONSOLE.FEEDBACK.READ,
                        PermissionSlugs.SYSTEM.CONSOLE.TOOLS.READ
                    ]}
                    mode="any"
                >
                    <ConsolePage />
                </ProtectedRoute>
            } />

            {/* Monitoring */}
            <Route path="monitoring/*" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.SYSTEM.CONSOLE.DASHBOARD.READ}>
                    <MonitoringRoutes />
                </ProtectedRoute>
            } />

            {/* Developer Hub */}
            <Route path="developer" element={
                <ProtectedRoute
                    requiredPermissions={[
                        PermissionSlugs.SYSTEM.DEVELOPER.API.READ,
                        PermissionSlugs.SYSTEM.DEVELOPER.SDK.READ,
                        PermissionSlugs.SYSTEM.DEVELOPER.WEBHOOKS.READ,
                        PermissionSlugs.SYSTEM.DEVELOPER.PERM_MAP.READ
                    ]}
                    mode="any"
                >
                    <DeveloperHubPage />
                </ProtectedRoute>
            } />

            {/* Billing */}
            <Route path="billing/*" element={
                <ProtectedRoute
                    requiredPermissions={[
                        PermissionSlugs.SYSTEM.BILLING.MARKETPLACE.READ,
                        PermissionSlugs.SYSTEM.BILLING.PACKAGES.READ,
                        PermissionSlugs.SYSTEM.BILLING.PLANS.READ,
                        PermissionSlugs.SYSTEM.BILLING.INVOICES.READ,
                        PermissionSlugs.SYSTEM.BILLING.LICENSES.READ
                    ]}
                    mode="any"
                >
                    <BillingRoutes />
                </ProtectedRoute>
            } />

            {/* Finance */}
            <Route path="finance" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.SYSTEM.BILLING.INVOICES.READ}>
                    <FinancePage />
                </ProtectedRoute>
            } />

            {/* Settings */}
            <Route path="settings" element={
                <ProtectedRoute
                    requiredPermissions={[
                        PermissionSlugs.SYSTEM.SETTINGS.GENERAL.READ,
                        PermissionSlugs.SYSTEM.SETTINGS.NOTIFICATIONS.READ,
                        PermissionSlugs.SYSTEM.SETTINGS.COMMUNICATION.READ,
                        PermissionSlugs.SYSTEM.SETTINGS.SECURITY.READ,
                        PermissionSlugs.SYSTEM.ROLES.READ,
                        PermissionSlugs.SYSTEM.SETTINGS.CONFIG.READ
                    ]}
                    mode="any"
                >
                    <SettingsPage />
                </ProtectedRoute>
            } />



            <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
    );
}
