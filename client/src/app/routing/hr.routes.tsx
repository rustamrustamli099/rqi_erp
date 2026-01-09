import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom"
import { ProtectedRoute } from "@/app/routing/ProtectedRoute"
import { PageGate } from "@/app/security/PageGate"

import EmployeesPage from "@/domains/hr/views/EmployeesPage"
import DepartmentsPage from "@/domains/hr/views/DepartmentsPage"
import AttendancePage from "@/domains/hr/views/AttendancePage"
import { UsersPage } from "@/domains/identity" // HR often accesses Users

export default function HRRoutes() {
    const location = useLocation();
    return (
        <Routes key={location.pathname}>
            <Route element={
                <ProtectedRoute>
                    <PageGate pageKey="Z_HR">
                        <Outlet />
                    </PageGate>
                </ProtectedRoute>
            }>
                <Route path="employees" element={
                    <PageGate pageKey="Z_EMPLOYEES">
                        <EmployeesPage />
                    </PageGate>
                } />
                <Route path="users" element={
                    // Z_USERS is already defined for UsersPage
                    <PageGate pageKey="Z_USERS">
                        <UsersPage />
                    </PageGate>
                } />

                <Route path="departments" element={
                    <PageGate pageKey="Z_DEPARTMENTS">
                        <DepartmentsPage />
                    </PageGate>
                } />
                <Route path="attendance" element={
                    <PageGate pageKey="Z_ATTENDANCE">
                        <AttendancePage />
                    </PageGate>
                } />
            </Route>

            <Route path="*" element={<Navigate to="employees" replace />} />
        </Routes>
    )
}
