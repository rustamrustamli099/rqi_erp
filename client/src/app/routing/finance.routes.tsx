import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { ProtectedRoute } from "@/app/routing/ProtectedRoute"

import BillingPage from "@/domains/billing/views/BillingPage"

export default function FinanceRoutes() {
    const location = useLocation();
    return (
        <Routes key={location.pathname}>
            <Route element={<ProtectedRoute permission="system:billing:read" />}>
                <Route path="billing" element={<BillingPage />} />
            </Route>

            <Route path="*" element={<Navigate to="billing" replace />} />
        </Routes>
    )
}
