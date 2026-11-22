import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';
import SystemBroadcast from '../components/common/SystemBroadcast';

const NO_PADDING_PREFIXES = ['/login', '/register', '/community', '/pricing', '/admin'];
const NO_NAVBAR_PREFIXES = ['/admin'];
const NO_BROADCAST_PREFIXES = ['/admin'];

const MainLayout = () => {
    const location = useLocation();
    const matchesPrefix = (prefixes) =>
        prefixes.some((path) => location.pathname.startsWith(path));

    const isNoPaddingPage = matchesPrefix(NO_PADDING_PREFIXES);
    const isNoNavbarPage = matchesPrefix(NO_NAVBAR_PREFIXES);
    const isNoBroadcastPage = matchesPrefix(NO_BROADCAST_PREFIXES);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200 relative">
            {!isNoBroadcastPage && <SystemBroadcast />}
            {!isNoNavbarPage && <HomeNavbar />}
            <main className={`flex-grow ${isNoPaddingPage ? '' : 'pt-20'}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
