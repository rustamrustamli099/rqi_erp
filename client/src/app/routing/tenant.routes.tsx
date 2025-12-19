import { Routes, Route, Navigate } from "react-router-dom"
import { ProtectedRoute } from "@/app/routing/ProtectedRoute"

import TenantList from "@/domains/tenant/views/TenantList"
import SettingsPage from "@/domains/tenant/views/SettingsPage"
import ApprovalsPage from "@/domains/tenant/views/ApprovalsPage"

export default function TenantRoutes() {
    return (
        <Routes>
            {/* Admin View of All Tenants */}
            <Route path="list" element={<TenantList />} />

            {/* Tenant Configuration */}
            <Route element={<ProtectedRoute permission="config:roles:read" />}>
                <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route element={<ProtectedRoute permission="config:dict:approval_templates:read" />}>
                <Route path="approvals" element={<ApprovalsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="list" replace />} />
        </Routes>
    )
}
