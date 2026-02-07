import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, List, LogOut, Wallet, Building2, User, Settings, ArrowLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageLoadTimer from '../components/common/PageLoadTimer';

import businessApi from '../services/businessApi';
import SystemBroadcast from '../components/common/SystemBroadcast';

const BusinessLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Check for Business Page Existence
    React.useEffect(() => {
        const checkBusiness = async () => {
            try {
                // If the user is just a generic user accessing business area, check if they have a page
                // We assume businessApi.getMyBusiness() returns 404 if not found
                await businessApi.getMyBusiness();
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    // Redirect to onboarding
                    navigate('/business/welcome');
                }
            }
        };
        checkBusiness();
    }, [navigate]);



    const handleLogout = () => {
        logout();
        navigate('/auth/business/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/business/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Inbox', path: '/business/inbox', icon: <MessageSquare size={20} /> }, // New
        { name: 'Page Content', path: '/business/content', icon: <List size={20} /> }, // New
        { name: 'Wallet', path: '/business/wallet', icon: <Wallet size={20} /> },
        { name: 'Create Ad', path: '/business/create-ad', icon: <PlusCircle size={20} /> },
        { name: 'My Ads', path: '/business/my-ads', icon: <List size={20} /> }, // Keeping for ads
        { name: 'Settings', path: '/business/settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 text-slate-800 font-sans">
            {/* Sidebar */}
            <aside className={`bg-white shadow-xl transition-all duration-300 z-20 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="flex items-center justify-center h-16 border-b border-gray-100">
                    {isSidebarOpen ? (
                        <div className="flex items-center space-x-2 text-blue-600 font-bold text-xl tracking-tight">
                            <Building2 size={28} />
                            <span>Business Portal</span>
                        </div>
                    ) : (
                        <Building2 size={28} className="text-blue-600" />
                    )}
                </div>

                <div className="flex-1 overflow-y-auto py-4 flex flex-col justify-between">
                    <nav className="px-2 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 rounded-lg transition-colors group ${isActive
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`
                                }
                            >
                                <span className="flex-shrink-0 group-hover:text-blue-500 transition-colors">{item.icon}</span>
                                {isSidebarOpen && <span className="ml-3 text-sm">{item.name}</span>}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="px-2 mt-auto">
                        <NavLink
                            to="/"
                            className="flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors group border border-gray-200 bg-white shadow-sm mt-4"
                        >
                            <span className="flex-shrink-0 group-hover:text-blue-500 transition-colors"><ArrowLeft size={20} /></span>
                            {isSidebarOpen && <span className="ml-3 text-sm font-medium">Back to PreExam</span>}
                        </NavLink>
                    </div>
                </div>

                {/* User Profile Summary */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
                        {isSidebarOpen && (
                            <div className="flex items-center truncate mr-2">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600 mr-3">
                                    <User size={18} />
                                </div>
                                <div className="truncate">
                                    <p className="text-sm font-medium text-gray-800 truncate">{user?.name || 'Sponsor'}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            title="Logout"
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Broadcast Banner */}
                {/* Broadcast Banner */}
                <SystemBroadcast />
                {/* Header (optional, maybe specific page headers, keeping clean for now) */}

                {/* Content Body */}
                <div className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 md:p-8">
                    <Outlet />
                    <div className="mt-8 border-t border-slate-200 pt-4">
                        <PageLoadTimer />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BusinessLayout;
