import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    FileQuestion,
    CreditCard,
    Users,
    Newspaper,
    Inbox,
    Settings,
    MonitorPlay,
    Menu,
    LogOut,
    Megaphone,
    Store,
    LifeBuoy,
    Shield
} from 'lucide-react';
import PageLoadTimer from '../components/common/PageLoadTimer';

import { Toaster } from 'react-hot-toast';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    React.useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'admin') {
                navigate('/login');
            }
        }
    }, [user, loading, navigate]);

    if (loading) return null; // Or a loader
    if (!user || user.role !== 'admin') return null;

    const menuItems = [
        { path: '/admin', label: 'ภาพรวมธุรกิจ', icon: LayoutDashboard },
        { path: '/admin/businesses', label: 'จัดการเพจธุรกิจ', icon: Store },
        { path: '/admin/questions', label: 'จัดการคลังข้อสอบ', icon: FileQuestion },
        { path: '/admin/payments', label: 'ตรวจสอบการชำระเงิน', icon: CreditCard },
        { path: '/admin/users', label: 'จัดการสมาชิก', icon: Users },
        { path: '/admin/community', label: 'จัดการชุมชน', icon: MonitorPlay }, // Using distinct icon if possible, or same as Sidebar
        { path: '/admin/news', label: 'ข่าวสาร & Affiliate', icon: Newspaper },
        { path: '/admin/inbox', label: 'กล่องข้อความ & รายงาน', icon: Inbox },
        { path: '/admin/rooms', label: 'จัดการห้องสอบ', icon: MonitorPlay },
        { path: '/admin/ads', label: 'จัดการโฆษณา (Ads)', icon: Megaphone },
        { path: '/admin/support', label: 'ศูนย์ช่วยเหลือ (Tickets)', icon: LifeBuoy },
        { path: '/admin/legal', label: 'PDPA/Legal', icon: Shield },
        { path: '/admin/settings', label: 'ตั้งค่าระบบ', icon: Settings },

    ];

    const isActive = (path) => {
        if (path === '/admin' && location.pathname === '/admin') return true;
        if (path !== '/admin' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Toaster position="top-right" />

            {/* Sidebar */}
            <aside
                className={`bg-royal-blue-900 text-white transition-all duration-300 ease-in-out flex flex-col
                    ${sidebarOpen ? 'w-64' : 'w-20'}
                `}
                style={{ backgroundColor: '#1e3a8a' }} // Royal Blue approximate
            >
                <div className="flex items-center justify-between p-4 border-b border-royal-blue-800">
                    {sidebarOpen && <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">PreExam Admin</span>}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-royal-blue-800 rounded">
                        <Menu size={24} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-2">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center p-3 rounded-lg transition-colors group
                                        ${isActive(item.path)
                                            ? 'bg-gradient-to-r from-yellow-500/20 to-transparent text-yellow-300 border-l-4 border-yellow-400'
                                            : 'text-slate-300 hover:bg-white/10 hover:text-white'}
                                    `}
                                >
                                    <item.icon size={24} strokeWidth={1.5} className={`${isActive(item.path) ? 'text-yellow-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-royal-blue-800">
                    <button className="flex items-center w-full p-2 text-slate-300 hover:text-white hover:bg-red-500/20 rounded transition-colors">
                        <LogOut size={24} />
                        {sidebarOpen && <span className="ml-3">ออกจากระบบ</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
                    <h1 className="text-xl font-semibold text-slate-700">
                        {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
                    </h1>
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full bg-royal-blue-100 flex items-center justify-center text-royal-blue-600 font-bold border border-royal-blue-200">
                            A
                        </div>
                        <span className="text-sm font-medium text-slate-600">Admin User</span>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6 relative">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                    <PageLoadTimer />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
