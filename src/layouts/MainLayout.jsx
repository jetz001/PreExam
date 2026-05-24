import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';
import SystemBroadcast from '../components/common/SystemBroadcast';

const MainLayout = () => {
    const location = useLocation();
    const isNoPaddingPage = ['/login', '/register', '/community'].includes(location.pathname);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200 relative">
            <SystemBroadcast />
            <HomeNavbar />
            <main className={`flex-grow ${isNoPaddingPage ? '' : 'pt-20'}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
