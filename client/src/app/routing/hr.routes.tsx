import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { ProtectedRoute } from "@/app/routing/ProtectedRoute"

import EmployeesPage from "@/domains/hr/views/EmployeesPage"
import DepartmentsPage from "@/domains/hr/views/DepartmentsPage"
import AttendancePage from "@/domains/hr/views/AttendancePage"
import { UsersPage } from "@/domains/identity" // HR often accesses Users

export default function HRRoutes() {
    const location = useLocation();
    return (
        <Routes key={location.pathname}>
            <Route element={<ProtectedRoute permission="hr:employees:read" />}>
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="users" element={<UsersPage />} />
            </Route>

            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="attendance" element={<AttendancePage />} />

            <Route path="*" element={<Navigate to="employees" replace />} />
        </Routes>
    )
}
