/**
 * SAP-Grade Workspace Routes
 * 
 * Default portal for Tenant Users (Non-Admin).
 * Mounted at: /dashboard/* or /workspace/*
 * 
 * NO hook-based permission checks in route body.
 * Context switching handled by auth layer.
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/app/routing/ProtectedRoute";
import TenantDashboard from "@/domains/dashboard/views/TenantDashboard";

export default function WorkspaceRoutes() {
    // SAP-GRADE: NO can() calls in route body
    // ProtectedRoute + evaluateRoute handles all authorization

    return (
        <Routes>
            <Route index element={
                <ProtectedRoute>
                    <TenantDashboard />
                </ProtectedRoute>
            } />

            {/* Add other tenant module routes here later */}

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
