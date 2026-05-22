import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';
import SystemBroadcast from '../components/common/SystemBroadcast';

const MainLayout = () => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200 relative">
            <SystemBroadcast />
            <HomeNavbar />
            <main className={`flex-grow ${isAuthPage ? '' : 'pt-20'}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
