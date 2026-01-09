import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { ProtectedRoute } from "@/app/routing/ProtectedRoute";
import { PageGate } from "@/app/security/PageGate";
import { ProviderFinanceDashboard } from "@/domains/finance/dashboard/ProviderFinanceDashboard";
import { ResellerDashboard } from "@/domains/finance/dashboard/ResellerDashboard";
import BillingPage from "@/domains/billing/views/BillingPage"; // Assuming path based on other files

export default function FinanceRoutes() {
    const location = useLocation();
    return (
        <Routes key={location.pathname}>
            {/* Provider Finance Section */}
            <Route element={
                <ProtectedRoute>
                    {/* Wrap in Z_FINANCE but internal pages might need specific gates */}
                    <PageGate pageKey="Z_FINANCE">
                        <Outlet />
                    </PageGate>
                </ProtectedRoute>
            }>
                <Route path="billing" element={
                    <PageGate pageKey="Z_BILLING">
                        <BillingPage />
                    </PageGate>
                } />
                <Route path="dashboard" element={<ProviderFinanceDashboard />} />
            </Route>

            {/* Reseller Section */}
            <Route element={
                <ProtectedRoute>
                    <PageGate pageKey="Z_RESELLER">
                        <ResellerDashboard />
                    </PageGate>
                </ProtectedRoute>
            }>
                <Route path="reseller" element={<ResellerDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
    )
}
