import { Routes, Route } from 'react-router-dom';
import BranchesPage from './views/BranchesPage';
import BranchDetailsPage from './views/BranchDetailsPage';

export const BranchesRoutes = () => {
    return (
        <Routes>
            <Route index element={<BranchesPage />} />
            <Route path=":id" element={<BranchDetailsPage />} />
        </Routes>
    );
};
