import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, List, LogOut, Wallet, Building2, User, Settings, ArrowLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
        <div className="flex h-screen bg-[#f3f4f6] text-black font-sans">
            {/* Sidebar */}
            <aside className={`bg-white border-r-4 border-black z-20 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="flex items-center justify-center h-20 border-b-4 border-black bg-yellow-300">
                    {isSidebarOpen ? (
                        <div className="flex items-center space-x-2 text-black font-black text-2xl tracking-tight uppercase">
                            <Building2 size={32} />
                            <span>Business Portal</span>
                        </div>
                    ) : (
                        <Building2 size={32} className="text-black" />
                    )}
                </div>

                <div className="flex-1 overflow-y-auto py-4 flex flex-col justify-between">
                    <nav className="px-2 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 rounded-xl transition-all group border-4 ${isActive
                                        ? 'bg-cyan-300 text-black font-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]'
                                        : 'bg-white text-gray-700 font-bold border-transparent hover:border-black hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                    }`
                                }
                            >
                                <span className="flex-shrink-0 text-black">{item.icon}</span>
                                {isSidebarOpen && <span className="ml-3 text-sm">{item.name}</span>}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="px-2 mt-auto">
                        <NavLink
                            to="/"
                            className="flex items-center px-4 py-3 rounded-xl text-black font-bold hover:bg-pink-300 transition-all group border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-4"
                        >
                            <span className="flex-shrink-0 group-hover:text-blue-500 transition-colors"><ArrowLeft size={20} /></span>
                            {isSidebarOpen && <span className="ml-3 text-sm font-medium">Back to PreExam</span>}
                        </NavLink>
                    </div>
                </div>

                {/* User Profile Summary */}
                <div className="p-4 border-t-4 border-black bg-lime-300">
                    <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
                        {isSidebarOpen && (
                            <div className="flex items-center truncate mr-2">
                                <div className="bg-white border-2 border-black p-2 rounded-full text-black mr-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <User size={18} />
                                </div>
                                <div className="truncate">
                                    <p className="text-base font-black text-black truncate">{user?.name || 'Sponsor'}</p>
                                    <p className="text-xs font-bold text-gray-800 truncate">{user?.email}</p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            title="Logout"
                            className="p-2 text-black bg-white border-2 border-black hover:bg-red-400 hover:text-white rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[1px] hover:translate-x-[1px]"
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
                <div className="flex-1 overflow-x-hidden overflow-y-auto bg-[#ffb347] p-6 md:p-8 relative">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default BusinessLayout;
