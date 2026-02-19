import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Bell } from 'lucide-react';
import authService from '../services/authService';
import publicService from '../services/publicService';
import EditProfileModal from './EditProfileModal';
import { useTour } from '../context/TourContext';

import NotificationCenter from './Community/NotificationCenter';

const Navbar = () => {
    const { startTour } = useTour();
    const [isOpen, setIsOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, [location]);

    const handleLogout = () => {
        publicService.logActivity('BTN_LOGOUT', { type: 'manual' });
        authService.logout();
        setUser(null);
        navigate('/login');
    };

    const handleNavClick = (label, path) => {
        if (user) {
            publicService.logActivity('BTN_NAV_CLICK', { label, path });
        }
    };

    return (
        <>
            <nav className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50 border-b dark:border-slate-700 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link to="/" className="flex-shrink-0 flex items-center">
                                <span className="text-2xl font-bold text-primary dark:text-indigo-400">PreExam</span>
                            </Link>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {[
                                    { path: '/', label: 'หน้าแรก' },
                                    { path: '/community', label: 'ชุมชน' },
                                    { path: '/learning-center', label: 'ศูนย์การเรียนรู้' },
                                    { path: '/news', label: 'ข่าวสอบ' },
                                    { path: '/lobby', label: 'ห้องสอบกลุ่ม' },
                                    { path: '/exam', label: 'ห้องสอบเดี่ยว' }
                                ].map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => handleNavClick(item.label, item.path)}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${location.pathname === item.path
                                            ? 'border-indigo-500 text-gray-900 dark:text-white'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">

                            <NotificationCenter />

                            {user ? (
                                <>
                                    <span className="text-gray-700 dark:text-gray-200 text-sm font-medium mr-2">
                                        {user.display_name || user.username || 'User'}
                                    </span>

                                    <Link
                                        to="/profile"
                                        onClick={() => handleNavClick('My Profile', '/profile')}
                                        className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        My Profile
                                    </Link>
                                    <Link
                                        to={user.email?.startsWith('guest_') ? "/login" : "/business/dashboard"}
                                        onClick={() => handleNavClick('Manage Page', user.email?.startsWith('guest_') ? "/login" : "/business/dashboard")}
                                        className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        จัดการหน้าเพจ
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        ออกจากระบบ
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/auth/business/login" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                        สำหรับธุรกิจ
                                    </Link>
                                    <Link to="/login" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                        เข้าสู่ระบบ
                                    </Link>
                                    <Link to="/register" className="bg-primary dark:bg-indigo-600 text-white hover:bg-blue-700 dark:hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                        สมัครสมาชิก
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="-mr-2 flex items-center sm:hidden">
                            <div className="sm:hidden flex items-center">
                                <NotificationCenter />
                            </div>
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary ml-2"
                            >
                                {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isOpen && (
                    <div className="sm:hidden bg-white dark:bg-slate-800 border-t dark:border-slate-700 shadow-lg">
                        <div className="pt-2 pb-3 space-y-1">
                            {[
                                { path: '/', label: 'หน้าแรก' },
                                { path: '/community', label: 'ชุมชน' },
                                { path: '/learning-center', label: 'ศูนย์การเรียนรู้' },
                                { path: '/news', label: 'ข่าวสอบ' },
                                { path: '/lobby', label: 'ห้องสอบกลุ่ม' },
                                { path: '/exam', label: 'ห้องสอบเดี่ยว' }
                            ].map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => {
                                        setIsOpen(false);
                                        handleNavClick(item.label, item.path);
                                    }}
                                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${location.pathname === item.path
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-primary text-primary dark:text-indigo-400'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                        <div className="pt-4 pb-4 border-t border-gray-200 dark:border-slate-700">
                            <div className="flex items-center px-4 space-x-4">
                                {user ? (
                                    <div className="w-full">
                                        <div className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-slate-700 mb-2">
                                            สวัสดี, {user.display_name}
                                        </div>

                                        <Link
                                            to="/profile"
                                            onClick={() => {
                                                setIsOpen(false);
                                                handleNavClick('My Profile', '/profile');
                                            }}
                                            className="block text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white px-3 py-2"
                                        >
                                            My Profile
                                        </Link>
                                        <Link
                                            to={user.email?.startsWith('guest_') ? "/login" : "/business/dashboard"}
                                            onClick={() => {
                                                setIsOpen(false);
                                                handleNavClick('Manage Page', user.email?.startsWith('guest_') ? "/login" : "/business/dashboard");
                                            }}
                                            className="block text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white px-3 py-2"
                                        >
                                            จัดการหน้าเพจ
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left text-base font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 mt-2 px-3 py-2"
                                        >
                                            ออกจากระบบ
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full space-y-2">
                                        <Link to="/auth/business/login" className="block text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white px-3 py-2">
                                            สำหรับธุรกิจ
                                        </Link>
                                        <Link to="/login" className="block text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white px-3 py-2">
                                            เข้าสู่ระบบ
                                        </Link>
                                        <Link to="/register" className="block text-base font-medium text-primary dark:text-indigo-400 hover:text-blue-700 dark:hover:text-indigo-300 px-3 py-2">
                                            สมัครสมาชิก
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
            {isEditProfileOpen && user && (
                <EditProfileModal user={user} onClose={() => setIsEditProfileOpen(false)} />
            )}
        </>
    );
};

export default Navbar;
