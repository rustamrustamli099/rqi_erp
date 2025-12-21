import { Routes, Route, Navigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
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
import { PermissionSlugs } from "@/app/security/permission-slugs";

export default function AdminRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.DASHBOARD.VIEW}>
                    <DashboardPage />
                </ProtectedRoute>
            } />

            {/* Core Domains */}
            <Route path="users" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.USERS.READ}>
                    <UsersPage />
                </ProtectedRoute>
            } />

            <Route path="profile" element={<ProfilePage />} />

            {/* Modular Domains */}
            <Route path="branches/*" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.BRANCHES.READ}>
                    <BranchesRoutes />
                </ProtectedRoute>
            } />

            <Route path="files" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.FILES.READ}>
                    <FilesManagerPage />
                </ProtectedRoute>
            } />

            {/* Added Missing Modules */}
            <Route path="tenants" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.TENANTS.READ}>
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
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.GUIDE.READ}>
                    <PlatformOverviewPage />
                </ProtectedRoute>
            } />

            {/* System Console */}
            <Route path="console" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.CONSOLE.READ}>
                    <ConsolePage />
                </ProtectedRoute>
            } />

            {/* Monitoring (Moved to System) */}
            <Route path="monitoring/*" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.CONSOLE.DASHBOARD.READ}>
                    <MonitoringRoutes />
                </ProtectedRoute>
            } />

            {/* Developer Hub */}
            <Route path="developer" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.DEVELOPER.READ}>
                    <DeveloperHubPage />
                </ProtectedRoute>
            } />

            {/* Billing */}
            <Route path="billing/*" element={
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.BILLING.READ}>
                    <BillingRoutes />
                </ProtectedRoute>
            } />

            {/* Finance */}
            <Route path="finance" element={
                // TODO: Define canonical slug for Finance if separate from Billing
                <ProtectedRoute requiredPermission={PermissionSlugs.PLATFORM.BILLING.READ}>
                    <FinancePage />
                </ProtectedRoute>
            } />

            {/* Settings */}
            <Route path="settings" element={
                <ProtectedRoute
                    requiredPermissions={[
                        PermissionSlugs.PLATFORM.SETTINGS.READ,
                        PermissionSlugs.PLATFORM.SETTINGS.GENERAL.READ,
                        PermissionSlugs.PLATFORM.SETTINGS.COMMUNICATION.READ,
                        PermissionSlugs.PLATFORM.SETTINGS.SECURITY.READ,
                        PermissionSlugs.PLATFORM.SETTINGS.CONFIG.READ,
                        PermissionSlugs.PLATFORM.USERS.READ
                    ]}
                    mode="any"
                >
                    <SettingsPage />
                </ProtectedRoute>
            } />

            <Route path="access-denied" element={
                <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                    <div className="p-4 rounded-full bg-red-100/10 text-destructive">
                        <ShieldAlert className="w-12 h-12" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Giriş Qadağandır</h1>
                    <p className="text-muted-foreground max-w-md">
                        Bu hissəyə daxil olmaq üçün icazəniz yoxdur. Zəhmət olmasa, sistem administratoru ilə əlaqə saxlayın.
                    </p>
                    <div className="pt-4">
                        <a href="/login" className="text-sm font-medium text-primary hover:underline" onClick={() => localStorage.clear()}>Giriş səhifəsinə qayıt</a>
                    </div>
                </div>
            } />

            <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
    );
}
