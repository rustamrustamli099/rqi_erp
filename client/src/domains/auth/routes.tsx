import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import LoginPage from "./views/LoginPage"
import ForgotPasswordPage from "./views/ForgotPasswordPage"

export default function AuthRoutes() {
    const location = useLocation();
    return (
        <Routes key={location.pathname}>
            <Route path="login" element={<LoginPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="*" element={<Navigate to="login" replace />} />
        </Routes>
    )
}
