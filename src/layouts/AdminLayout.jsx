import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
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
    Shield,
    Database,
    Activity,
    Trophy,
    ChevronDown,
    ChevronRight,
    FolderKanban,
    Sparkles,
    Search,
    X,
    Home,
    ExternalLink,
    Gamepad2,
    MessageSquare,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import SystemBroadcast from '../components/common/SystemBroadcast';
import BrandLogo from '../components/common/BrandLogo';

const MENU_GROUPS = [
    {
        id: 'overview',
        label: 'ภาพรวม',
        items: [
            { path: '/admin', label: 'ภาพรวมธุรกิจ', icon: LayoutDashboard },
            { path: '/admin/users', label: 'จัดการสมาชิก', icon: Users },
            { path: '/admin/payments', label: 'ตรวจสอบการชำระเงิน', icon: CreditCard },
        ],
    },
    {
        id: 'exam',
        label: 'ระบบสอบ',
        items: [
            { path: '/admin/questions', label: 'จัดการคลังข้อสอบ', icon: FileQuestion },
            { path: '/admin/exam-sets', label: 'จัดชุดข้อสอบ', icon: FolderKanban },
            { path: '/admin/rooms', label: 'จัดการห้องสอบ', icon: MonitorPlay },
            { path: '/admin/seasons', label: 'ฤดูกาล & แร้งกิ้ง', icon: Trophy },
        ],
    },
    {
        id: 'motion',
        label: 'เกม แอนิเมชัน และเอฟเฟกต์',
        items: [
            { path: '/admin/arcade', label: 'จัดการอาเขต (Arcade)', icon: Gamepad2 },
            { path: '/admin/animations', label: 'Animation Studio', icon: Sparkles },
        ],
    },
    {
        id: 'business-content',
        label: 'ธุรกิจและคอนเทนต์',
        items: [
            { path: '/admin/businesses', label: 'จัดการเพจธุรกิจ', icon: Store },
            { path: '/admin/community', label: 'จัดการชุมชน', icon: MessageSquare },
            { path: '/admin/news', label: 'ข่าวสาร & Affiliate', icon: Newspaper },
            { path: '/admin/ads', label: 'จัดการโฆษณา (Ads)', icon: Megaphone },
        ],
    },
    {
        id: 'ops',
        label: 'ปฏิบัติการ',
        items: [
            { path: '/admin/inbox', label: 'กล่องข้อความ & รายงาน', icon: Inbox },
            { path: '/admin/support', label: 'ศูนย์ช่วยเหลือ (Tickets)', icon: LifeBuoy },
            { path: '/admin/scraper', label: 'ระบบดึงข้อมูล (Scraper)', icon: Activity },
        ],
    },
    {
        id: 'system',
        label: 'ระบบและความปลอดภัย',
        items: [
            { path: '/admin/backups', label: 'ระบบสำรองข้อมูล (Backup)', icon: Database },
            { path: '/admin/legal', label: 'PDPA/Legal', icon: Shield },
            { path: '/admin/settings', label: 'ตั้งค่าระบบ', icon: Settings },
        ],
    },
];

const AdminBrandEmblem = ({ compact = false }) => (
    <BrandLogo
        variant="admin"
        size="sm"
        showText={!compact}
        badge="ADMIN"
        subtitle="CONTROL CENTER"
        className="min-w-0"
    />
);

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [collapsedGroups, setCollapsedGroups] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { user, loading, logout } = useAuth();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!mobileMenuOpen) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mobileMenuOpen]);

    const isActive = (path) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const isGroupActive = (group) => group.items.some((item) => isActive(item.path));

    const { activeGroup, activeItem } = useMemo(() => {
        for (const group of MENU_GROUPS) {
            const found = group.items.find((item) => isActive(item.path));
            if (found) {
                return { activeGroup: group, activeItem: found };
            }
        }
        return { activeGroup: MENU_GROUPS[0], activeItem: null };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filteredGroups = useMemo(() => {
        if (!normalizedQuery) return MENU_GROUPS;
        return MENU_GROUPS.map((group) => {
            const groupMatches = group.label.toLowerCase().includes(normalizedQuery);
            const items = groupMatches
                ? group.items
                : group.items.filter(
                      (item) =>
                          item.label.toLowerCase().includes(normalizedQuery) ||
                          item.path.toLowerCase().includes(normalizedQuery)
                  );
            return { ...group, items };
        }).filter((group) => group.items.length > 0);
    }, [normalizedQuery]);

    const toggleGroup = (groupId) => {
        setCollapsedGroups((prev) => ({
            ...prev,
            [groupId]: !prev[groupId],
        }));
    };

    const handleLogout = () => {
        if (typeof logout === 'function') {
            logout();
        } else {
            authService.logout();
        }
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-200 font-sans">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-amber-400 animate-spin" />
                    <p className="text-sm font-medium text-slate-400">กำลังโหลดระบบควบคุมผู้ดูแล...</p>
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') return null;

    const displayName = user?.display_name || user?.username || 'Admin User';
    const userInitial = displayName.charAt(0).toUpperCase();
    const avatarUrl = user?.avatar || user?.avatar_url;

    const renderSidebarContent = (isExpanded) => (
        <>
            {/* Ambient command-center glow */}
            <div className="pointer-events-none absolute -top-24 -left-24 w-64 h-64 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-12 -right-20 w-56 h-56 rounded-full bg-violet-600/15 blur-3xl" />

            {/* Sidebar Header */}
            <div className={`relative z-10 flex items-center border-b border-slate-800/80 h-16 px-4 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
                {isExpanded ? (
                    <>
                        <Link
                            to="/admin"
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-xl"
                            aria-label="PreExam Admin Control Center"
                        >
                            <AdminBrandEmblem />
                        </Link>
                        {/* Desktop collapse button */}
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="ย่อเมนูด้านข้าง"
                            title="ย่อเมนูด้านข้าง"
                            className="hidden lg:inline-flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                        >
                            <PanelLeftClose size={19} />
                        </button>
                        {/* Mobile close button */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(false)}
                            aria-label="ปิดเมนูแอดมิน"
                            title="ปิดเมนูแอดมิน"
                            className="lg:hidden inline-flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                        >
                            <X size={20} />
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="ขยายเมนูด้านข้าง"
                        title="ขยายเมนูด้านข้าง"
                        className="group flex items-center justify-center p-1 rounded-xl hover:bg-slate-800/70 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                        <AdminBrandEmblem compact />
                    </button>
                )}
            </div>

            {/* Expand button strip when collapsed on desktop */}
            {!isExpanded && (
                <div className="relative z-10 px-3 pt-3 flex justify-center">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="เปิดแถบค้นหาและขยายเมนู"
                        title="ขยายเมนู"
                        className="w-full flex items-center justify-center py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-indigo-500/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                        <PanelLeftOpen size={18} />
                    </button>
                </div>
            )}

            {/* Sidebar Search Filter */}
            {isExpanded && (
                <div className="relative z-10 px-3.5 pt-3.5 pb-2">
                    <div className="relative flex items-center bg-slate-900/90 border border-slate-800 rounded-xl focus-within:border-indigo-500/70 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-200">
                        <Search size={15} className="ml-3 text-slate-400 flex-shrink-0" aria-hidden="true" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ค้นหาเมนูแอดมิน..."
                            aria-label="ค้นหาเมนูแอดมิน"
                            className="w-full bg-transparent px-2.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                aria-label="ล้างคำค้นหา"
                                title="ล้างคำค้นหา"
                                className="mr-1.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Navigation Groups */}
            <nav className="relative z-10 flex-1 overflow-y-auto py-3 px-3 space-y-2.5" aria-label="เมนูผู้ดูแลระบบ">
                {filteredGroups.length === 0 && isExpanded ? (
                    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 text-center">
                        <p className="text-xs font-medium text-slate-400">ไม่พบเมนูที่ตรงกับ &ldquo;{searchQuery}&rdquo;</p>
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="mt-2.5 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 text-xs font-semibold transition-colors"
                        >
                            ล้างคำค้นหา
                        </button>
                    </div>
                ) : (
                    filteredGroups.map((group) => {
                        const collapsed = normalizedQuery ? false : !!collapsedGroups[group.id];
                        const groupActive = isGroupActive(group);

                        return (
                            <div
                                key={group.id}
                                className={`rounded-2xl border transition-colors ${
                                    groupActive
                                        ? 'border-indigo-500/30 bg-slate-900/75'
                                        : 'border-slate-800/70 bg-slate-900/40'
                                }`}
                            >
                                {isExpanded ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => toggleGroup(group.id)}
                                            aria-expanded={!collapsed}
                                            className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                                                groupActive
                                                    ? 'text-white bg-white/[0.04]'
                                                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                                            }`}
                                        >
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold tracking-wide text-slate-200 truncate">
                                                    {group.label}
                                                </div>
                                                <div className="text-[10px] text-slate-500">
                                                    {group.items.length} เมนู
                                                </div>
                                            </div>
                                            <ChevronDown
                                                size={16}
                                                className={`flex-shrink-0 transition-transform duration-200 ${
                                                    collapsed ? '-rotate-90' : 'rotate-0'
                                                } ${groupActive ? 'text-amber-400' : 'text-slate-500'}`}
                                            />
                                        </button>

                                        {!collapsed && (
                                            <ul className="space-y-1 px-2 pb-2 pt-0.5">
                                                {group.items.map((item) => {
                                                    const active = isActive(item.path);
                                                    const Icon = item.icon;
                                                    return (
                                                        <li key={item.path}>
                                                            <Link
                                                                to={item.path}
                                                                className={`flex items-center rounded-xl px-3 py-2.5 text-sm transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                                                                    active
                                                                        ? 'bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-transparent text-amber-300 border-l-4 border-amber-400 font-semibold shadow-sm'
                                                                        : 'text-slate-300 hover:bg-white/[0.06] hover:text-white border-l-4 border-transparent font-medium'
                                                                }`}
                                                            >
                                                                <Icon
                                                                    size={19}
                                                                    strokeWidth={active ? 2 : 1.7}
                                                                    className={`flex-shrink-0 transition-colors ${
                                                                        active
                                                                            ? 'text-amber-400'
                                                                            : 'text-slate-400 group-hover:text-indigo-300'
                                                                    }`}
                                                                />
                                                                <span className="ml-3 truncate">{item.label}</span>
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </>
                                ) : (
                                    <ul className="space-y-1 p-1.5">
                                        {group.items.map((item) => {
                                            const active = isActive(item.path);
                                            const Icon = item.icon;
                                            return (
                                                <li key={item.path}>
                                                    <Link
                                                        to={item.path}
                                                        title={item.label}
                                                        aria-label={item.label}
                                                        className={`flex items-center justify-center rounded-xl p-2.5 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                                                            active
                                                                ? 'bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-transparent text-amber-300 border-l-4 border-amber-400'
                                                                : 'text-slate-400 hover:bg-white/[0.06] hover:text-white border-l-4 border-transparent'
                                                        }`}
                                                    >
                                                        <Icon
                                                            size={20}
                                                            strokeWidth={active ? 2 : 1.7}
                                                            className={active ? 'text-amber-400' : 'text-slate-400 group-hover:text-indigo-300'}
                                                        />
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        );
                    })
                )}
            </nav>

            {/* Sidebar Footer */}
            <div className="relative z-10 p-3 border-t border-slate-800/80 space-y-2 bg-slate-950/90">
                <Link
                    to="/"
                    title="กลับหน้าเว็บหลัก (User View)"
                    aria-label="กลับหน้าเว็บหลัก (User View)"
                    className={`flex items-center w-full rounded-xl px-3 py-2.5 text-sm font-medium text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-400/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                        isExpanded ? 'justify-between' : 'justify-center'
                    }`}
                >
                    <span className="flex items-center gap-2.5 min-w-0">
                        <Home size={18} className="text-indigo-300 flex-shrink-0" />
                        {isExpanded && <span className="truncate">กลับหน้าเว็บหลัก (User View)</span>}
                    </span>
                    {isExpanded && <ExternalLink size={14} className="text-indigo-300/80 flex-shrink-0 ml-2" />}
                </Link>

                <button
                    type="button"
                    onClick={handleLogout}
                    title="ออกจากระบบ"
                    aria-label="ออกจากระบบ"
                    className={`flex items-center w-full rounded-xl px-3 py-2.5 text-sm font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
                        isExpanded ? 'justify-start gap-2.5' : 'justify-center'
                    }`}
                >
                    <LogOut size={18} className="flex-shrink-0" />
                    {isExpanded && <span>ออกจากระบบ</span>}
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-slate-100/70 overflow-hidden font-sans">
            <Toaster position="top-right" />

            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex relative flex-col bg-slate-950 text-slate-100 border-r border-slate-800/80 transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden ${
                    sidebarOpen ? 'w-72' : 'w-20'
                }`}
            >
                {renderSidebarContent(sidebarOpen)}
            </aside>

            {/* Mobile Drawer Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div
                        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-hidden="true"
                    />
                    <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-slate-950 text-slate-100 border-r border-slate-800/80 overflow-hidden shadow-2xl">
                        {renderSidebarContent(true)}
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
                <SystemBroadcast />

                <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="เปิดเมนูแอดมิน"
                            title="เปิดเมนูแอดมิน"
                            className="lg:hidden inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <Menu size={22} />
                        </button>

                        {/* Breadcrumbs */}
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                <span className="truncate">{activeGroup?.label || 'Admin Portal'}</span>
                                <ChevronRight size={13} className="flex-shrink-0 text-slate-400" aria-hidden="true" />
                                <span className="text-indigo-600 font-semibold truncate">
                                    {activeItem?.label || 'Control Center'}
                                </span>
                            </div>
                            <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate leading-tight">
                                {activeItem?.label || 'ภาพรวมธุรกิจ'}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
                        {/* Live status indicator */}
                        <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <span>System Online</span>
                        </div>

                        {/* Quick User View Link */}
                        <Link
                            to="/"
                            title="กลับหน้าเว็บหลัก (User View)"
                            aria-label="กลับหน้าเว็บหลัก (User View)"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100/80 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 hover:border-indigo-200 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <Home size={16} className="text-indigo-600" />
                            <span className="hidden sm:inline">กลับหน้าเว็บหลัก</span>
                            <ExternalLink size={13} className="hidden md:inline text-slate-500" />
                        </Link>

                        {/* Admin User Chip */}
                        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200/80">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={displayName}
                                    className="w-9 h-9 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-sm border border-indigo-400/30">
                                    {userInitial}
                                </div>
                            )}
                            <div className="hidden sm:block text-left leading-tight">
                                <div className="text-sm font-bold text-slate-800 max-w-[140px] truncate">
                                    {displayName}
                                </div>
                                <div className="text-[11px] font-medium text-indigo-600 uppercase tracking-wider">
                                    {user?.role || 'admin'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 sm:p-6 relative">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
