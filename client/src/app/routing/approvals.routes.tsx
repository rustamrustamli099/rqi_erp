import { Routes, Route, Navigate } from "react-router-dom"
import ApprovalsPage from "@/domains/approvals/views/ApprovalsPage"
import { ProtectedRoute } from "@/app/routing/ProtectedRoute"

export default function ApprovalsRoutes() {
    return (
        <Routes>
            <Route element={<ProtectedRoute permission="approvals:read" />}>
                <Route path="/" element={<ApprovalsPage />} />
                <Route path="inbox" element={<ApprovalsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}
