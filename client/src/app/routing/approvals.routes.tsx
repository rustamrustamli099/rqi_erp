import { Routes, Route, Navigate, Outlet } from "react-router-dom"
import ApprovalsPage from "@/domains/approvals/views/ApprovalsPage"
import { ProtectedRoute } from "@/app/routing/ProtectedRoute"
import { PageGate } from "@/app/security/PageGate"

export default function ApprovalsRoutes() {
    return (
        <Routes>
            <Route element={
                <ProtectedRoute>
                    <PageGate pageKey="Z_APPROVALS">
                        <Outlet />
                    </PageGate>
                </ProtectedRoute>
            }>
                <Route path="/" element={<ApprovalsPage />} />
                <Route path="inbox" element={
                    <PageGate pageKey="Z_APPROVALS_INBOX">
                        <ApprovalsPage />
                    </PageGate>
                } />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}
