import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    AreaChart,
    Area
} from 'recharts';
import {
    TrendingUp,
    Users,
    DollarSign,
    AlertTriangle,
    RefreshCw,
    FileQuestion,
    CreditCard,
    MonitorPlay,
    Newspaper,
    LifeBuoy,
    ArrowUpRight,
    Wallet,
    BarChart3,
    Activity,
    CheckCircle2,
    Sparkles,
    ShieldCheck,
    Clock
} from 'lucide-react';
import adminApi from '../../services/adminApi';

const QUICK_ACTIONS = [
    {
        to: '/admin/questions',
        title: 'จัดการคลังข้อสอบ',
        subtitle: 'Question Bank',
        description: 'เพิ่ม แก้ไข และจัดหมวดหมู่ข้อสอบ',
        icon: FileQuestion,
        gradient: 'from-indigo-500 to-violet-600',
        shadow: 'shadow-indigo-500/20',
    },
    {
        to: '/admin/payments',
        title: 'ตรวจสอบการชำระเงิน',
        subtitle: 'Payment Verification',
        description: 'อนุมัติสลิปและจัดการแพ็กเกจ',
        icon: CreditCard,
        gradient: 'from-emerald-500 to-teal-600',
        shadow: 'shadow-emerald-500/20',
    },
    {
        to: '/admin/users',
        title: 'จัดการสมาชิก',
        subtitle: 'User Management',
        description: 'ตรวจสอบบัญชีและสิทธิ์ผู้ดูแล',
        icon: Users,
        gradient: 'from-violet-500 to-fuchsia-600',
        shadow: 'shadow-violet-500/20',
    },
    {
        to: '/admin/rooms',
        title: 'จัดการห้องสอบ',
        subtitle: 'Exam Rooms',
        description: 'ควบคุมห้องสอบออนไลน์แบบเรียลไทม์',
        icon: MonitorPlay,
        gradient: 'from-sky-500 to-blue-600',
        shadow: 'shadow-sky-500/20',
    },
    {
        to: '/admin/news',
        title: 'ข่าวสาร & Affiliate',
        subtitle: 'News & Content',
        description: 'อัปเดตข่าวการสอบและแหล่งข้อมูล',
        icon: Newspaper,
        gradient: 'from-amber-500 to-orange-600',
        shadow: 'shadow-amber-500/20',
    },
    {
        to: '/admin/support',
        title: 'ศูนย์ช่วยเหลือ',
        subtitle: 'Support Tickets',
        description: 'ติดตามคำร้องและปัญหาผู้ใช้งาน',
        icon: LifeBuoy,
        gradient: 'from-rose-500 to-pink-600',
        shadow: 'shadow-rose-500/20',
    },
];

const formatCurrency = (value) => `฿${Number(value ?? 0).toLocaleString()}`;

const DashboardOverview = () => {
    const {
        data: stats,
        isLoading,
        error,
        refetch,
        isFetching
    } = useQuery({
        queryKey: ['adminStats'],
        queryFn: adminApi.getDashboardStats,
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse" role="status" aria-label="กำลังโหลดข้อมูลแดชบอร์ด">
                <div className="h-36 rounded-3xl bg-slate-200/80" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, idx) => (
                        <div key={idx} className="h-24 rounded-2xl bg-slate-200/80" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[...Array(3)].map((_, idx) => (
                        <div key={idx} className="h-32 rounded-2xl bg-slate-200/80" />
                    ))}
                </div>
                <div className="h-80 rounded-2xl bg-slate-200/80" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-3xl border border-rose-200 bg-white/90 backdrop-blur-sm p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 border border-rose-100">
                    <AlertTriangle size={28} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">ไม่สามารถโหลดข้อมูลภาพรวมได้</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Failed to load dashboard statistics. กรุณาลองใหม่อีกครั้ง
                </p>
                <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
                    <span>ลองใหม่อีกครั้ง (Retry)</span>
                </button>
            </div>
        );
    }

    const totalRevenue = Number(stats?.revenue?.total ?? 0);
    const monthlyRevenue = Number(stats?.revenue?.monthly ?? 0);
    const yearlyRevenue = Number(stats?.revenue?.yearly ?? 0);
    const pendingRevenue = Number(stats?.revenue?.pending ?? 0);
    const conversionRate = stats?.conversionRate ?? 0;
    const activeUsers = Number(stats?.activeUsers ?? 0);
    const revenueTrend = Array.isArray(stats?.revenue?.trend) ? stats.revenue.trend : [];
    const examActivity = Array.isArray(stats?.examActivity) ? stats.examActivity : [];
    const commercialViability = Array.isArray(stats?.commercialViability) ? stats.commercialViability : [];
    const painPoints = Array.isArray(stats?.painPoints) ? stats.painPoints : [];
    const recentReports = Number(stats?.communityHealth?.recentReports ?? stats?.recentReports ?? 0);
    const mau = Number(stats?.communityHealth?.mau ?? 0);
    const isHealthy = recentReports <= 10;

    return (
        <div className="space-y-6 pb-8">
            {/* Executive Welcome / Summary Banner */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-6 sm:p-8 text-white shadow-xl border border-indigo-500/20">
                <div className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-indigo-500/25 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-amber-400/15 blur-3xl" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-2.5 max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
                            <Sparkles size={14} />
                            <span>EXECUTIVE CONTROL CENTER</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                            ภาพรวมระบบ PreExam <span className="text-indigo-300 font-semibold text-lg sm:text-xl">Overview Indicators</span>
                        </h2>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            ติดตามรายได้ การเติบโตของสมาชิก อัตราการอัปเกรดพรีเมียม และสุขภาพของแพลตฟอร์มได้ในจุดเดียว
                        </p>

                        <div className="flex flex-wrap items-center gap-2.5 pt-2">
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                                <Wallet size={14} />
                                รายได้รวม {formatCurrency(totalRevenue)}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
                                <Clock size={14} />
                                รอตรวจสอบ {formatCurrency(pendingRevenue)}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-200">
                                <Users size={14} />
                                ออนไลน์วันนี้ {activeUsers.toLocaleString()} คน
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
                        <button
                            type="button"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            aria-label="รีเฟรชข้อมูลแดชบอร์ด"
                            className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                        >
                            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
                            <span>{isFetching ? 'กำลังอัปเดต...' : 'รีเฟรชข้อมูล'}</span>
                        </button>
                        <Link
                            to="/admin/payments"
                            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                        >
                            <CreditCard size={16} />
                            <span>ตรวจสลิปชำระเงิน</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Quick Action Shortcut Cards */}
            <section aria-label="ทางลัดการจัดการระบบ">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                        ทางลัดการจัดการ (Quick Actions)
                    </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {QUICK_ACTIONS.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={action.to}
                                to={action.to}
                                className="group relative flex items-center justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur-sm p-4 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300/80 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${action.gradient} text-white shadow-md ${action.shadow} group-hover:scale-105 transition-transform duration-200`}>
                                        <Icon size={22} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 truncate transition-colors">
                                            {action.title}
                                        </div>
                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600 truncate">
                                            {action.subtitle}
                                        </div>
                                        <p className="text-xs text-slate-600 truncate mt-0.5">
                                            {action.description}
                                        </p>
                                    </div>
                                </div>
                                <ArrowUpRight
                                    size={18}
                                    className="flex-shrink-0 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
                                />
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Revenue KPI Cards */}
            <section aria-label="ตัวชี้วัดรายได้">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Total Revenue
                            </p>
                            <p className="text-sm font-bold text-slate-700 mt-0.5">รายได้รวมทั้งหมด</p>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 truncate">
                                {formatCurrency(totalRevenue)}
                            </h3>
                            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/70 rounded-full px-2.5 py-0.5 mt-2.5">
                                <Clock size={12} />
                                รอตรวจสอบ: {formatCurrency(pendingRevenue)}
                            </p>
                        </div>
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                            <DollarSign size={26} />
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Monthly Revenue
                            </p>
                            <p className="text-sm font-bold text-slate-700 mt-0.5">รายได้เดือนนี้</p>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 truncate">
                                {formatCurrency(monthlyRevenue)}
                            </h3>
                            <p className="text-xs font-medium text-slate-500 mt-2.5">
                                รอบบัญชีเดือนปัจจุบัน (Current Month)
                            </p>
                        </div>
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25">
                            <TrendingUp size={26} />
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Yearly Revenue
                            </p>
                            <p className="text-sm font-bold text-slate-700 mt-0.5">รายได้สะสมปีนี้</p>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 truncate">
                                {formatCurrency(yearlyRevenue)}
                            </h3>
                            <p className="text-xs font-medium text-slate-500 mt-2.5">
                                รอบบัญชีปีปัจจุบัน (Current Year)
                            </p>
                        </div>
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25">
                            <BarChart3 size={26} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Platform & Community KPI Cards */}
            <section aria-label="ตัวชี้วัดผู้ใช้งานและชุมชน">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Conversion Rate</p>
                            <p className="text-sm font-bold text-slate-700">อัตราอัปเกรดพรีเมียม</p>
                            <h3 className="text-2xl font-extrabold text-slate-900 mt-1.5">{conversionRate}%</h3>
                            <p className="text-xs font-semibold text-emerald-600 mt-1">Free to Premium</p>
                        </div>
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/25">
                            <TrendingUp size={22} />
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Users</p>
                            <p className="text-sm font-bold text-slate-700">ผู้ใช้งานวันนี้</p>
                            <h3 className="text-2xl font-extrabold text-slate-900 mt-1.5">{activeUsers.toLocaleString()}</h3>
                            <p className="text-xs font-medium text-slate-500 mt-1">Online Today</p>
                        </div>
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25">
                            <Users size={22} />
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Members (MAU)</p>
                            <p className="text-sm font-bold text-slate-700">สมาชิกรวมในระบบ</p>
                            <h3 className="text-2xl font-extrabold text-slate-900 mt-1.5">{mau.toLocaleString()}</h3>
                            <p className="text-xs font-semibold text-indigo-600 mt-1">Monthly Active Base</p>
                        </div>
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white shadow-md shadow-fuchsia-500/25">
                            <Activity size={22} />
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recent Reports</p>
                            <p className="text-sm font-bold text-slate-700">รายงานล่าสุด (24 ชม.)</p>
                            <h3 className="text-2xl font-extrabold text-slate-900 mt-1.5">{recentReports.toLocaleString()}</h3>
                            <p className={`text-xs font-semibold mt-1 ${isHealthy ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {isHealthy ? 'สถานะปกติ (Healthy)' : 'ควรตรวจสอบ (Needs Review)'}
                            </p>
                        </div>
                        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${isHealthy ? 'from-emerald-500 to-green-600 shadow-emerald-500/25' : 'from-rose-500 to-red-600 shadow-rose-500/25'} text-white shadow-md`}>
                            <ShieldCheck size={22} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Revenue Trend AreaChart */}
            <section className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            แนวโน้มรายได้ 6 เดือนล่าสุด <span className="text-sm font-medium text-slate-500">(Revenue Trend)</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            สรุปยอดรายรับสุทธิรายเดือนย้อนหลัง 6 เดือน
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
                        <TrendingUp size={14} />
                        <span>Revenue Analytics</span>
                    </div>
                </div>

                {revenueTrend.length > 0 ? (
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <AreaChart data={revenueTrend}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) =>
                                        value >= 1000 ? `฿${(value / 1000).toFixed(1)}k` : `฿${value}`
                                    }
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                                    }}
                                    formatter={(value) => [formatCurrency(value), 'รายได้ (Revenue)']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    strokeWidth={2.5}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-56 flex items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
                        ยังไม่มีข้อมูลแนวโน้มรายได้ในช่วง 6 เดือนล่าสุด
                    </div>
                )}
            </section>

            {/* Optional Exam Activity Chart when provided by API */}
            {examActivity.length > 0 && (
                <section className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">
                                กิจกรรมการทำข้อสอบ <span className="text-sm font-medium text-slate-500">(Exam Activity)</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">สถิติการเข้าสอบและทำแบบฝึกหัดบนแพลตฟอร์ม</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                            Active Sessions
                        </span>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <AreaChart data={examActivity}>
                                <defs>
                                    <linearGradient id="colorExamActivity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.28} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    fillOpacity={1}
                                    fill="url(#colorExamActivity)"
                                    strokeWidth={2.5}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            )}

            {/* Analytics Grid: Commercial Viability & Pain Points */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Commercial Viability Score */}
                <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">
                                ดัชนีศักยภาพตลาด <span className="text-sm font-medium text-slate-500">(Commercial Viability)</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Score = (Search Demand × 0.6) + (Engagement × 0.4)
                            </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 text-xs font-semibold">
                            Growth Score
                        </span>
                    </div>

                    {commercialViability.length > 0 ? (
                        <div className="h-64 w-full flex-1">
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                <LineChart data={commercialViability}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#f59e0b"
                                        strokeWidth={3}
                                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 7 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
                            ยังไม่มีข้อมูลดัชนีศักยภาพตลาด
                        </div>
                    )}
                </div>

                {/* Pain Points / Weakest Subjects */}
                <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">
                                วิชาที่ผู้สอบทำคะแนนได้น้อย <span className="text-sm font-medium text-slate-500">(Weakest Subjects)</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">คะแนนเฉลี่ยรายวิชาที่ควรเสริมคลังข้อสอบ</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70 text-xs font-semibold">
                            Pain Points
                        </span>
                    </div>

                    {painPoints.length > 0 ? (
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                <BarChart data={painPoints} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="subject" type="category" width={90} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                                        }}
                                    />
                                    <Bar dataKey="score" fill="#4f46e5" radius={[0, 8, 8, 0]} barSize={22} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-56 flex items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
                            ยังไม่มีข้อมูลคะแนนจุดอ่อนรายวิชา
                        </div>
                    )}

                    <div className="flex items-start gap-2.5 mt-4 p-3.5 bg-rose-50/90 border border-rose-200/70 rounded-xl">
                        <AlertTriangle className="text-rose-500 mt-0.5 flex-shrink-0" size={16} />
                        <p className="text-xs sm:text-sm text-rose-700 leading-relaxed">
                            <strong>Action Needed:</strong> คะแนนเฉลี่ยที่ต่ำในบางรายวิชาบ่งชี้ว่าผู้เรียนต้องการเนื้อหาสรุปหรือคลังข้อสอบฝึกซ้อมเพิ่มเติม
                        </p>
                    </div>
                </div>
            </section>

            {/* Community Health Footer Card */}
            <section className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            สุขภาพชุมชนและการดูแลระบบ <span className="text-sm font-medium text-slate-500">(Community Health)</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">ภาพรวมรายงานปัญหาและความเคลื่อนไหวของสมาชิก</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                                isHealthy
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                        >
                            <CheckCircle2 size={14} />
                            {isHealthy ? 'Healthy' : 'Monitor'}
                        </span>
                        <Link
                            to="/admin/inbox"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        >
                            <span>ไปที่กล่องรายงาน</span>
                            <ArrowUpRight size={14} />
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/70 flex items-center justify-between">
                        <div>
                            <p className="text-slate-600 text-sm font-medium">รายงานที่เข้ามาล่าสุด (Recent Reports)</p>
                            <p className="text-2xl font-extrabold text-slate-900 mt-1">{recentReports.toLocaleString()}</p>
                            <p className="text-xs text-slate-500 mt-0.5">ใน 24 ชั่วโมงที่ผ่านมา (Last 24 hours)</p>
                        </div>
                        <div className="h-11 w-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                            <AlertTriangle size={20} />
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/70 flex items-center justify-between">
                        <div>
                            <p className="text-slate-600 text-sm font-medium">ผู้ใช้งานรายเดือน (Monthly Active Users)</p>
                            <p className="text-2xl font-extrabold text-slate-900 mt-1">{mau.toLocaleString()}</p>
                            <p className="text-xs text-emerald-600 font-semibold mt-0.5">ฐานสมาชิกทั้งหมดในระบบ</p>
                        </div>
                        <div className="h-11 w-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <Users size={20} />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DashboardOverview;
