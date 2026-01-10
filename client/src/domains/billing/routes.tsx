import { Routes, Route } from 'react-router-dom';
import { PageGate } from "@/app/security/PageGate";
import BillingPage from './views/BillingPage';
import MarketplacePage from './views/MarketplacePage';
import TenantUpgradePage from './views/TenantUpgradePage';

export const BillingRoutes = () => {
    return (
        <Routes>
            <Route index element={<BillingPage />} />
            <Route path="marketplace" element={
                <PageGate pageKey="Z_BILLING_MARKETPLACE_PAGE">
                    <MarketplacePage />
                </PageGate>
            } />
            <Route path="upgrade" element={
                <PageGate pageKey="Z_BILLING_UPGRADE">
                    <TenantUpgradePage />
                </PageGate>
            } />
        </Routes>
    );
};
