import { Routes, Route } from 'react-router-dom';
import BillingPage from './views/BillingPage';
import MarketplacePage from './views/MarketplacePage';
import TenantUpgradePage from './views/TenantUpgradePage';

export const BillingRoutes = () => {
    return (
        <Routes>
            <Route index element={<BillingPage />} />
            <Route path="marketplace" element={<MarketplacePage />} />
            <Route path="upgrade" element={<TenantUpgradePage />} />
        </Routes>
    );
};
