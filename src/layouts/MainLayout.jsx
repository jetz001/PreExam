import React from 'react';
import { Outlet } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';
import SystemBroadcast from '../components/common/SystemBroadcast';

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
            <SystemBroadcast />
            <HomeNavbar />
            <main className="flex-grow pt-20">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
