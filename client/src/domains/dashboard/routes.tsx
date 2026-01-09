import { Routes, Route } from "react-router-dom";
import DashboardPage from "./views/DashboardPage";
import { PageGate } from "@/app/security/PageGate";

export default function DashboardRoutes() {
    return (
        <Routes>
            <Route index element={
                <PageGate pageKey="Z_DASHBOARD">
                    <DashboardPage />
                </PageGate>
            } />
        </Routes>
    );
}
