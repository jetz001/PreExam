import React from 'react';
import {
    LayoutDashboard,
    FileQuestion,
    Users,
    Newspaper,
    MessageSquare,
    Inbox,
    CreditCard,
    LogOut,
    Palette,
    Shield
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { user } = useAuth();

    const allMenuItems = [
        { id: 'analytics', label: 'ภาพรวมระบบ', icon: LayoutDashboard, permission: 'view_dashboard' },
        { id: 'questions', label: 'จัดการข้อสอบ', icon: FileQuestion, permission: 'manage_exams' },
        { id: 'members', label: 'จัดการสมาชิก', icon: Users, permission: 'manage_users' },
        { id: 'news', label: 'จัดการข่าวสาร', icon: Newspaper, permission: 'manage_news' },
        { id: 'community', label: 'ดูแลชุมชน', icon: MessageSquare, permission: 'manage_community' },
        { id: 'inbox', label: 'กล่องข้อความ', icon: Inbox, permission: 'manage_inbox' },
        { id: 'payments', label: 'แจ้งโอนเงิน', icon: CreditCard, permission: 'manage_payments' },
        { id: 'assets', label: 'จัดการ Theme', icon: Palette, permission: 'manage_assets' },
        { id: 'legal', label: 'PDPA/Legal', icon: Shield, permission: 'manage_legal' },
    ];

    const menuItems = allMenuItems.filter(item => {
        // If no permissions array (legacy super admin), allow all
        if (!user?.admin_permissions || user.admin_permissions.length === 0) return true;
        // Otherwise, check if permission is included
        return user.admin_permissions.includes(item.permission);
    });

    return (
        <div className="w-64 bg-white shadow-lg h-screen-minus-navbar flex flex-col">
            <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <span className="bg-primary text-white p-1 rounded mr-2 text-sm">ADMIN</span>
                    Dashboard
                </h2>
            </div>
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === item.id
                                ? 'bg-blue-50 text-primary font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon className="h-5 w-5 mr-3" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-gray-200">
                <button className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut className="h-5 w-5 mr-3" />
                    ออกจากระบบ
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
