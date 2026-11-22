import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  Megaphone,
  LogOut,
  Wallet,
  User,
  Settings,
  Home,
  MessageSquare,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import businessApi from '../services/businessApi';
import publicService from '../services/publicService';
import SystemBroadcast from '../components/common/SystemBroadcast';
import BrandLogo from '../components/common/BrandLogo';

const NAV_ITEMS = [
  { name: 'Page Content', labelTh: 'จัดการเนื้อหาเพจ', path: '/business/content', icon: FileText },
  { name: 'Inbox', labelTh: 'กล่องข้อความ', path: '/business/inbox', icon: MessageSquare },
  { name: 'Wallet', labelTh: 'กระเป๋าเงิน & เติมเครดิต', path: '/business/wallet', icon: Wallet },
  { name: 'Create Ad', labelTh: 'สร้างแคมเปญโฆษณา', path: '/business/create-ad', icon: PlusCircle },
  { name: 'My Ads', labelTh: 'รายการโฆษณา', path: '/business/my-ads', icon: Megaphone },
  { name: 'Settings', labelTh: 'ตั้งค่าเพจธุรกิจ', path: '/business/settings', icon: Settings },
];

const BusinessLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check for Business Page Existence
  useEffect(() => {
    const checkBusiness = async () => {
      try {
        await businessApi.getMyBusiness();
      } catch (error) {
        if (error.response && error.response.status === 404) {
          navigate('/business/welcome');
        }
      }
    };
    checkBusiness();
  }, [navigate]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await publicService.logActivity('BTN_LOGOUT', { type: 'manual' });
    logout();
    navigate('/auth/business/login');
  };

  const activeNav = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path)) || NAV_ITEMS[0];
  const displayName = user?.display_name || user?.name || 'Sponsor';
  const initial = displayName.charAt(0).toUpperCase();

  const renderSidebarContent = ({ mobile = false } = {}) => {
    const expanded = mobile || isSidebarOpen;
    return (
      <div className="relative flex h-full flex-col overflow-hidden bg-slate-950 text-slate-100">
        {/* Ambient indigo/violet glow */}
        <div
          className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-indigo-600/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 -right-12 h-56 w-56 rounded-full bg-violet-600/15 blur-3xl"
          aria-hidden="true"
        />

        {/* Sidebar Header */}
        <div className="relative z-10 flex h-20 items-center justify-between border-b border-slate-800/80 px-4">
          <Link
            to="/business/content"
            className="flex min-w-0 items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label="Business Sponsor Portal"
          >
            <BrandLogo
              variant="dark"
              size="sm"
              showText={expanded}
              badge="BUSINESS"
              subtitle="SPONSOR PORTAL"
              className="min-w-0"
            />
          </Link>

          {mobile ? (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="ปิดเมนู"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <X size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              aria-label={isSidebarOpen ? 'ย่อแถบข้าง' : 'ขยายแถบข้าง'}
              title={isSidebarOpen ? 'ย่อแถบข้าง' : 'ขยายแถบข้าง'}
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 transition hover:border-indigo-500/40 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 lg:inline-flex"
            >
              {isSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="custom-scrollbar relative z-10 flex-1 overflow-y-auto px-3 py-5">
          {expanded && (
            <div className="mb-2.5 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Sponsor Workspace
            </div>
          )}

          <nav className="space-y-1.5" aria-label="เมนูหลักธุรกิจ">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={!expanded ? item.name : undefined}
                  className={({ isActive }) =>
                    `group flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                      !expanded ? 'justify-center' : 'gap-3'
                    } ${
                      isActive
                        ? 'border-l-4 border-amber-400 bg-gradient-to-r from-indigo-500/25 via-violet-500/15 to-transparent text-amber-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                        : 'border-l-4 border-transparent text-slate-300 hover:bg-slate-900/90 hover:text-white'
                    }`
                  }
                >
                  <Icon
                    size={18}
                    className="shrink-0 transition-transform duration-200 group-hover:scale-105"
                  />
                  {expanded && (
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate leading-tight">{item.name}</span>
                      <span className="truncate text-[11px] font-medium text-slate-400">
                        {item.labelTh}
                      </span>
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Back to main platform link */}
          <div className="mt-6 border-t border-slate-800/80 pt-4">
            <Link
              to="/"
              title={!expanded ? 'กลับหน้าเว็บหลัก' : undefined}
              className={`flex items-center rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2.5 text-sm font-semibold text-slate-200 transition-all duration-200 hover:border-indigo-500/40 hover:bg-indigo-950/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                !expanded ? 'justify-center' : 'justify-between'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Home size={17} className="shrink-0 text-indigo-400" />
                {expanded && <span>กลับหน้าเว็บหลัก</span>}
              </span>
              {expanded && <ExternalLink size={14} className="text-slate-400" />}
            </Link>
          </div>
        </div>

        {/* User Profile & Logout Footer */}
        <div className="relative z-10 border-t border-slate-800/80 bg-slate-900/70 p-3.5 backdrop-blur-md">
          <div className={`flex items-center ${expanded ? 'justify-between gap-2' : 'justify-center'}`}>
            {expanded && (
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-indigo-400/30 bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-extrabold text-white shadow-sm">
                  {initial || <User size={16} />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-100">{displayName}</p>
                  <p className="truncate text-xs text-slate-400">{user?.email || 'Business Account'}</p>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              title="ออกจากระบบ"
              aria-label="ออกจากระบบ"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-300 transition-all duration-200 hover:border-rose-400/40 hover:bg-rose-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden shrink-0 border-r border-slate-800/80 transition-all duration-300 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col ${
          isSidebarOpen ? 'lg:w-68' : 'lg:w-20'
        }`}
      >
        {renderSidebarContent({ mobile: false })}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col border-r border-slate-800 shadow-2xl">
            {renderSidebarContent({ mobile: true })}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex min-w-0 flex-1 flex-col">
        <SystemBroadcast />

        {/* Modern Glass Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="เปิดเมนูธุรกิจ"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden"
            >
              <Menu size={18} />
            </button>

            <div className="flex min-w-0 items-center gap-1.5 text-sm">
              <span className="hidden font-semibold text-slate-500 sm:inline">Business Portal</span>
              <ChevronRight size={14} className="hidden text-slate-400 sm:inline" />
              <span className="truncate font-bold text-slate-900">{activeNav?.name}</span>
              <span className="hidden rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 md:inline-flex items-center gap-1">
                <Sparkles size={11} />
                {activeNav?.labelTh}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:text-sm"
            >
              <Home size={15} className="text-indigo-600" />
              <span className="hidden sm:inline">กลับหน้าเว็บหลัก</span>
            </Link>

            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-100/80 py-1 pl-1.5 pr-3 sm:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-extrabold text-white">
                {initial}
              </span>
              <span className="max-w-[120px] truncate text-xs font-bold text-slate-700">
                {displayName}
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default BusinessLayout;
