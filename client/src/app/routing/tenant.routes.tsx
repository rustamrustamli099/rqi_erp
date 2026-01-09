import { Routes, Route, Navigate } from "react-router-dom"
import { PageGate } from "@/app/security/PageGate"

import TenantList from "@/domains/tenant/views/TenantList"
import SettingsPage from "@/domains/tenant/views/SettingsPage"
import ApprovalsPage from "@/domains/tenant/views/ApprovalsPage"

export default function TenantRoutes() {
    return (
        <Routes>
            {/* Admin View of All Tenants */}
            <Route path="list" element={
                <PageGate pageKey="Z_TENANTS">
                    <TenantList />
                </PageGate>
            } />

            {/* Tenant Configuration */}
            <Route path="settings" element={
                <PageGate pageKey="Z_TENANT_SETTINGS">
                    <SettingsPage />
                </PageGate>
            } />

            <Route path="approvals" element={
                <PageGate pageKey="Z_TENANT_APPROVALS">
                    <ApprovalsPage />
                </PageGate>
            } />

            <Route path="*" element={<Navigate to="list" replace />} />
        </Routes>
    )
}
