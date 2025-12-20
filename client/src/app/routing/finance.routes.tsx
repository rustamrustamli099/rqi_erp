import { ProviderFinanceDashboard } from "@/domains/finance/dashboard/ProviderFinanceDashboard"
import { ResellerDashboard } from "@/domains/finance/dashboard/ResellerDashboard"

export default function FinanceRoutes() {
    const location = useLocation();
    return (
        <Routes key={location.pathname}>
            <Route element={<ProtectedRoute permission="system:billing:read" />}>
                <Route path="billing" element={<BillingPage />} />
                <Route path="dashboard" element={<ProviderFinanceDashboard />} />
            </Route>

            <Route element={<ProtectedRoute permission="reseller:dashboard:read" />}>
                <Route path="reseller" element={<ResellerDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
    )
}
