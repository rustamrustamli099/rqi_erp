import { Routes, Route } from 'react-router-dom';
import BranchesPage from './views/BranchesPage';
import BranchDetailsPage from './views/BranchDetailsPage';
import { PageGate } from '@/app/security/PageGate';

export const BranchesRoutes = () => {
    return (
        <PageGate pageKey="Z_BRANCHES">
            <Routes>
                <Route index element={<BranchesPage />} />
                <Route path=":id" element={<BranchDetailsPage />} />
            </Routes>
        </PageGate>
    );
};
