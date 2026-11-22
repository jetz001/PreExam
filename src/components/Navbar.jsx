import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  MessageSquare,
  BookOpen,
  Newspaper,
  Trophy,
  FileCheck2,
  User,
  Building2,
  LogOut,
  Briefcase,
  LogIn,
  Sparkles,
} from 'lucide-react';
import authService from '../services/authService';
import publicService from '../services/publicService';
import EditProfileModal from './EditProfileModal';
import { useTour } from '../context/TourContext';
import NotificationCenter from './Community/NotificationCenter';
import BrandLogo from './common/BrandLogo';

const NAV_ITEMS = [
  { path: '/', label: 'หน้าแรก', Icon: Home },
  { path: '/community', label: 'ชุมชน', Icon: MessageSquare },
  { path: '/learning-center', label: 'ศูนย์การเรียนรู้', Icon: BookOpen },
  { path: '/news', label: 'ข่าวสอบ', Icon: Newspaper },
  { path: '/lobby', label: 'ห้องสอบกลุ่ม', Icon: Trophy },
  { path: '/exam', label: 'ห้องสอบเดี่ยว', Icon: FileCheck2 },
];

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
    setIsOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await publicService.logActivity('BTN_LOGOUT', { type: 'manual' });
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const handleNavClick = (label, path) => {
    if (user) {
      publicService.logActivity('BTN_NAV_CLICK', { label, path });
    }
  };

  const displayName = user?.display_name || user?.username || 'User';

  return (
    <>
      <nav
        aria-label="แถบนำทาง"
        className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl transition-colors duration-200 dark:border-slate-800/80 dark:bg-slate-900/85"
        style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link
                to="/"
                aria-label="PreExam หน้าแรก"
                className="group flex shrink-0 items-center gap-2.5 rounded-xl px-1.5 py-1 transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <BrandLogo showText={false} size="sm" variant="light" aria-hidden="true" />
                <span
                  className="text-xl font-black tracking-tight text-slate-900 dark:text-white"
                  style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
                >
                  PreExam
                  <span className="text-rose-500 dark:text-amber-400">!</span>
                </span>
              </Link>

              <div className="hidden lg:flex lg:items-center lg:gap-1">
                {NAV_ITEMS.map(({ path, label, Icon }) => {
                  const active = location.pathname === path;
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => handleNavClick(label, path)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        active
                          ? 'bg-indigo-50 text-indigo-700 shadow-xs dark:bg-indigo-500/15 dark:text-indigo-300'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                      }`}
                    >
                      <Icon size={16} strokeWidth={2.2} />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="hidden lg:flex lg:items-center lg:gap-3">
              <NotificationCenter />

              {user ? (
                <>
                  <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-100/80 px-3 py-1.5 text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
                    <User size={15} className="text-indigo-500 dark:text-indigo-400" />
                    <span className="max-w-[140px] truncate">{displayName}</span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => handleNavClick('My Profile', '/profile')}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <User size={16} />
                    <span>โปรไฟล์</span>
                  </Link>

                  <Link
                    to={user.email?.startsWith('guest_') ? '/login' : '/business/content'}
                    onClick={() =>
                      handleNavClick(
                        'Manage Page',
                        user.email?.startsWith('guest_') ? '/login' : '/business/content'
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Building2 size={16} />
                    <span>จัดการหน้าเพจ</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2 text-sm font-bold text-rose-600 transition-all duration-200 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25"
                  >
                    <LogOut size={16} />
                    <span>ออกจากระบบ</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/business/login"
                    onClick={() => handleNavClick('Business Login', '/auth/business/login')}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Briefcase size={16} />
                    <span>สำหรับธุรกิจ</span>
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => handleNavClick('Login', '/login')}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-700 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <LogIn size={16} />
                    <span>เข้าสู่ระบบ</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => handleNavClick('Register', '/register')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <Sparkles size={15} />
                    <span>สมัครสมาชิก</span>
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <NotificationCenter />
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
                aria-expanded={isOpen}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="border-t border-slate-200/80 bg-white/95 backdrop-blur-xl lg:hidden dark:border-slate-800 dark:bg-slate-900/95">
            <div className="space-y-1 px-3 pb-3 pt-3">
              {NAV_ITEMS.map(({ path, label, Icon }) => {
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => {
                      setIsOpen(false);
                      handleNavClick(label, path);
                    }}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-base font-bold transition-colors ${
                      active
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-slate-200/80 px-4 py-4 dark:border-slate-800">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 text-base font-bold text-slate-800 dark:border-slate-800 dark:text-slate-100">
                    <User size={18} className="text-indigo-500" />
                    <span>สวัสดี, {displayName}</span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => {
                      setIsOpen(false);
                      handleNavClick('My Profile', '/profile');
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-base font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <User size={17} />
                    <span>โปรไฟล์ของฉัน</span>
                  </Link>

                  <Link
                    to={user.email?.startsWith('guest_') ? '/login' : '/business/content'}
                    onClick={() => {
                      setIsOpen(false);
                      handleNavClick(
                        'Manage Page',
                        user.email?.startsWith('guest_') ? '/login' : '/business/content'
                      );
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-base font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Building2 size={17} />
                    <span>จัดการหน้าเพจ</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl bg-rose-50 px-3 py-2.5 text-left text-base font-bold text-rose-600 transition-colors hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25"
                  >
                    <LogOut size={17} />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/auth/business/login"
                    onClick={() => {
                      setIsOpen(false);
                      handleNavClick('Business Login', '/auth/business/login');
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-base font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Briefcase size={17} />
                    <span>สำหรับธุรกิจ</span>
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => {
                      setIsOpen(false);
                      handleNavClick('Login', '/login');
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-base font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <LogIn size={17} />
                    <span>เข้าสู่ระบบ</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => {
                      setIsOpen(false);
                      handleNavClick('Register', '/register');
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-base font-bold text-white shadow-sm hover:from-indigo-500 hover:to-violet-500"
                  >
                    <Sparkles size={17} />
                    <span>สมัครสมาชิก</span>
                  </Link>
                </div>
              )}
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
