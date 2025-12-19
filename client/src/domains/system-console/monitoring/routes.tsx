import { Routes, Route } from 'react-router-dom';
import MonitoringPage from './views/MonitoringPage';

export const MonitoringRoutes = () => {
    return (
        <Routes>
            <Route index element={<MonitoringPage />} />
        </Routes>
    );
};
