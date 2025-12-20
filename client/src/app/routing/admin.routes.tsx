
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "@/domains/dashboard/views/DashboardPage";
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

export default function AdminRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Core Domains */}
            <Route path="users" element={
                <ProtectedRoute requiredPermission="admin_panel.users.users.read">
                    <UsersPage />
                </ProtectedRoute>
            } />
            <Route path="profile" element={<ProfilePage />} />

            {/* Modular Domains */}
            <Route path="branches/*" element={<BranchesRoutes />} />
            <Route path="files" element={<FilesManagerPage />} />

            {/* Added Missing Modules */}
            <Route path="tenants" element={
                <ProtectedRoute requiredPermission="admin_panel.tenants.read">
                    <TenantList />
                </ProtectedRoute>
            } />
            <Route path="approvals" element={<ApprovalsPage />} />

            {/* Knowledge Base */}
            <Route path="guide" element={<PlatformOverviewPage />} />

            {/* System Console */}
            <Route path="console" element={
                <ProtectedRoute requiredPermission="admin_panel.system_console.dashboard.read">
                    <ConsolePage />
                </ProtectedRoute>
            } />

            {/* Monitoring (Moved to System) */}
            <Route path="monitoring/*" element={<MonitoringRoutes />} />

            {/* Developer Hub */}
            <Route path="developer" element={
                <ProtectedRoute requiredPermission="admin_panel.developer_hub.api_reference.read">
                    <DeveloperHubPage />
                </ProtectedRoute>
            } />

            {/* Billing */}
            <Route path="billing/*" element={<BillingRoutes />} />

            {/* Finance */}
            <Route path="finance" element={<FinancePage />} />

            {/* Settings */}
            <Route path="settings" element={
                <ProtectedRoute requiredPermission="admin_panel.settings.read">
                    <SettingsPage />
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
    );
}
