import { Routes, Route } from "react-router-dom";
import DashboardPage from "./views/DashboardPage";

export default function DashboardRoutes() {
    return (
        <Routes>
            <Route index element={<DashboardPage />} />
        </Routes>
    );
}
