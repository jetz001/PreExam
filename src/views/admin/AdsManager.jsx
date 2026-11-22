import React, { useState, useEffect, useMemo } from 'react';
import BusinessDashboard from '../business/BusinessDashboard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adsApi from '../../services/adsApi';
import adminApi from '../../services/adminApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    X,
    Settings,
    Users,
    Ban,
    Eye,
    DollarSign,
    Activity,
    Save,
    AlertTriangle,
    Search,
    CheckCircle,
    XCircle,
    Megaphone,
    BarChart3,
    Sparkles,
    ClipboardList
} from 'lucide-react';
import toast from 'react-hot-toast';

const inputClass =
    'block w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all';

const getAdPreviewImage = (images) => {
    if (!images) return 'https://placehold.co/300x150';
    if (Array.isArray(images)) return images[0] || 'https://placehold.co/300x150';
    try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed) && parsed[0]) return parsed[0];
    } catch {
        if (typeof images === 'string' && images.startsWith('http')) return images;
    }
    return 'https://placehold.co/300x150';
};

const AdsManager = () => {
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'requests' | 'house_ad' | 'sponsors'
    const [viewAsSponsorId, setViewAsSponsorId] = useState(null);
    const [sponsorSearch, setSponsorSearch] = useState('');
    const [sponsorStatusFilter, setSponsorStatusFilter] = useState('all');
    const [walletModalSponsor, setWalletModalSponsor] = useState(null);
    const [walletAmount, setWalletAmount] = useState('');

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setViewAsSponsorId(null);
                setWalletModalSponsor(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // --- Tab 1: Analytics & Configuration ---
    const { data: configData } = useQuery({
        queryKey: ['adsConfig'],
        queryFn: adsApi.getAdsConfig,
        initialData: {
            communityViewCost: 0.1,
            communityClickCost: 5.0,
            newsViewCost: 0.15,
            newsClickCost: 6.0,
            resultViewCost: 0.2,
            resultClickCost: 8.0,
            inFeedFrequency: 10,
            adSenseBackupId: '',
            examResultSlotId: '',
            homeSlotId: ''
        }
    });

    const { data: platformStats } = useQuery({
        queryKey: ['platformAdsStats'],
        queryFn: adsApi.getPlatformStats,
        initialData: {
            totalRevenue: 154000,
            activeSponsors: 45,
            totalViews: 1200000,
            revenueTrend: [
                { date: 'Mon', revenue: 12000 },
                { date: 'Tue', revenue: 15000 },
                { date: 'Wed', revenue: 18000 },
                { date: 'Thu', revenue: 14000 },
                { date: 'Fri', revenue: 22000 },
                { date: 'Sat', revenue: 25000 },
                { date: 'Sun', revenue: 30000 },
            ]
        }
    });

    // --- Tab 2: Sponsors ---
    const { data: sponsors = [] } = useQuery({
        queryKey: ['adminSponsors'],
        queryFn: adsApi.getAllSponsors,
        initialData: [
            { id: 1, businessName: 'Tutor P1', contact: 'p1@tutor.com', balance: 5000, activeAds: 3, totalSpent: 20000, status: 'Active' },
            { id: 2, businessName: 'Drink Energy', contact: 'sales@drink.com', balance: 200, activeAds: 1, totalSpent: 1200, status: 'Active' },
            { id: 3, businessName: 'Scam Crypto', contact: 'ceo@scam.com', balance: 0, activeAds: 0, totalSpent: 500, status: 'Suspended' },
        ]
    });

    const queryClient = useQueryClient();

    const updateConfigMutation = useMutation({
        mutationFn: adsApi.updateAdsConfig,
        onSuccess: () => {
            toast.success('Configuration saved');
            queryClient.invalidateQueries(['adsConfig']);
        }
    });

    const handleConfigSave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        updateConfigMutation.mutate({
            communityViewCost: formData.get('communityViewCost'),
            communityClickCost: formData.get('communityClickCost'),
            newsViewCost: formData.get('newsViewCost'),
            newsClickCost: formData.get('newsClickCost'),
            resultViewCost: formData.get('resultViewCost'),
            resultClickCost: formData.get('resultClickCost'),
            inFeedFrequency: formData.get('inFeedFrequency'),
            adSenseBackupId: formData.get('adSenseBackupId'),
            houseAdTitle: formData.get('houseAdTitle'),
            houseAdDescription: formData.get('houseAdDescription'),
            houseAdImage: formData.get('houseAdImage'),
            houseAdUrl: formData.get('houseAdUrl')
        });
    };

    const handleSuspend = async (id) => {
        if (window.confirm('Are you sure you want to suspend this sponsor? All ads will be stopped.')) {
            try {
                await adsApi.suspendSponsor(id);
                toast.success('Sponsor suspended');
                queryClient.invalidateQueries(['adminSponsors']);
            } catch (error) {
                toast.error('Failed to suspend');
            }
        }
    };

    const handleAdjustWallet = async (id, amount) => {
        try {
            await adsApi.adjustSponsorWallet(id, amount, 'Admin Manual Adjustment');
            toast.success('Wallet adjusted successfully');
            queryClient.invalidateQueries(['adminSponsors']);
            setWalletModalSponsor(null);
            setWalletAmount('');
        } catch (error) {
            console.error(error);
            toast.error('Failed to adjust wallet');
        }
    };

    const filteredSponsors = useMemo(() => {
        const q = sponsorSearch.trim().toLowerCase();
        return (Array.isArray(sponsors) ? sponsors : []).filter((sponsor) => {
            const matchesSearch =
                !q ||
                (sponsor.businessName || '').toLowerCase().includes(q) ||
                (sponsor.contact || '').toLowerCase().includes(q);
            const matchesStatus =
                sponsorStatusFilter === 'all' ||
                (sponsor.status || '').toLowerCase() === sponsorStatusFilter.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }, [sponsors, sponsorSearch, sponsorStatusFilter]);

    return (
        <div className="space-y-6 pb-8">
            {/* Executive Page Header */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur-sm p-5 sm:p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                        <Megaphone size={24} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                            จัดการโฆษณา (Ads Management System)
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            ติดตามรายได้โฆษณา ตั้งค่าเรทราคา อนุมัติคำขอสปอนเซอร์ และจัดการ House Ad
                        </p>
                    </div>
                </div>

                {/* Segmented Pill Tabs */}
                <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/90 p-1 border border-slate-200/80" role="tablist">
                    {[
                        { id: 'analytics', label: 'Analytics & Rates', icon: BarChart3 },
                        { id: 'requests', label: 'Ad Requests', icon: ClipboardList },
                        { id: 'house_ad', label: 'House Ad', icon: Sparkles },
                        { id: 'sponsors', label: 'Sponsor Oversight', icon: Users },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setActiveTab(tab.id)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                    active
                                        ? 'bg-white text-indigo-700 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Icon size={15} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* TAB A: Analytics & Config */}
            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    {/* Performance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Revenue (Burn)</p>
                                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
                                    ฿{(platformStats?.totalRevenue ?? 0).toLocaleString()}
                                </p>
                                <p className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-2">
                                    <Activity size={13} /> +12% from last week
                                </p>
                            </div>
                            <div className="flex h-13 w-13 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 p-3">
                                <DollarSign size={24} />
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Sponsors</p>
                                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
                                    {platformStats?.activeSponsors ?? 0}
                                </p>
                                <p className="text-xs font-medium text-slate-500 mt-2">สปอนเซอร์ที่กำลังใช้งานอยู่</p>
                            </div>
                            <div className="flex h-13 w-13 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20 p-3">
                                <Users size={24} />
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Impressions</p>
                                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
                                    {((platformStats?.totalViews ?? 0) / 1000).toFixed(1)}k
                                </p>
                                <p className="text-xs font-medium text-slate-500 mt-2">จำนวนการแสดงผลสะสม</p>
                            </div>
                            <div className="flex h-13 w-13 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/20 p-3">
                                <Eye size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Revenue Trend Chart */}
                        <div className="lg:col-span-2 rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Revenue Trend (7 Days)</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">สรุปรายได้โฆษณารายวันในรอบสัปดาห์ล่าสุด</p>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                                    7D Analytics
                                </span>
                            </div>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <BarChart data={platformStats?.revenueTrend || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                                        <YAxis axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                                            }}
                                        />
                                        <Bar dataKey="revenue" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={38} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Config Panel */}
                        <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/70">
                                    <Settings size={17} />
                                </span>
                                <span>Slot Configuration</span>
                            </h3>
                            <form onSubmit={handleConfigSave} className="space-y-4">
                                <div className="space-y-3 border-b border-slate-100 pb-4">
                                    <h4 className="text-sm font-bold text-slate-900">1. Community Feed (ชุมชน)</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">View (THB)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="communityViewCost"
                                                defaultValue={configData?.communityViewCost}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Click (THB)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="communityClickCost"
                                                defaultValue={configData?.communityClickCost}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 border-b border-slate-100 pb-4">
                                    <h4 className="text-sm font-bold text-slate-900">2. News Feed (ข่าวสอบ)</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">View (THB)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="newsViewCost"
                                                defaultValue={configData?.newsViewCost}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Click (THB)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="newsClickCost"
                                                defaultValue={configData?.newsClickCost}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 border-b border-slate-100 pb-4">
                                    <h4 className="text-sm font-bold text-slate-900">3. Exam Result (ห้องสอบ)</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">View (THB)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="resultViewCost"
                                                defaultValue={configData?.resultViewCost}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Click (THB)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="resultClickCost"
                                                defaultValue={configData?.resultClickCost}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">In-Feed Injection Frequency</label>
                                    <select
                                        name="inFeedFrequency"
                                        defaultValue={configData?.inFeedFrequency}
                                        className={inputClass}
                                    >
                                        <option value="6">Every 6 Posts</option>
                                        <option value="8">Every 8 Posts</option>
                                        <option value="10">Every 10 Posts</option>
                                        <option value="12">Every 12 Posts</option>
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">Lower number = More ads.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Backup AdSense Slot ID</label>
                                    <input
                                        type="text"
                                        name="adSenseBackupId"
                                        defaultValue={configData?.adSenseBackupId}
                                        className={inputClass}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Used when no direct sponsor wins the bid.</p>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={updateConfigMutation.isPending}
                                        className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-md shadow-indigo-500/20 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    >
                                        <Save size={16} />
                                        <span>{updateConfigMutation.isPending ? 'Saving...' : 'Save Rates'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: Ad Requests */}
            {activeTab === 'requests' && <AdRequestsTab />}

            {/* TAB: House Ad Configuration */}
            {activeTab === 'house_ad' && (
                <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200/70">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">House Ad Management</h3>
                            <p className="text-xs sm:text-sm text-slate-500">Manage the default &ldquo;Advertise Here&rdquo; banner content.</p>
                        </div>
                    </div>

                    <form onSubmit={handleConfigSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Banner Title</label>
                                    <input
                                        type="text"
                                        name="houseAdTitle"
                                        defaultValue={configData?.houseAdTitle || 'ลงโฆษณากับเรา / Advertise Here'}
                                        className={inputClass}
                                        placeholder="e.g. Advertise with Us"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Found at the top of the card.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description Text</label>
                                    <textarea
                                        name="houseAdDescription"
                                        defaultValue={configData?.houseAdDescription || 'เข้าถึงกลุ่มเป้าหมายนักเรียนกว่า 10,000 คน เริ่มต้นเพียง 100 บาท/วัน'}
                                        rows={4}
                                        className={inputClass}
                                        placeholder="e.g. Reach 10k students daily..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Banner Image URL</label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            name="houseAdImage"
                                            defaultValue={configData?.houseAdImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1'}
                                            className="block w-full rounded-l-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-mono text-slate-700 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                        <span className="inline-flex items-center px-3 rounded-r-xl border border-l-0 border-slate-200 bg-slate-100 text-slate-600 text-xs font-bold">
                                            IMG
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Action Link</label>
                                    <input
                                        type="text"
                                        name="houseAdUrl"
                                        defaultValue={configData?.houseAdUrl || '/business'}
                                        className={inputClass}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Where the user goes when clicking.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={updateConfigMutation.isPending}
                                className="inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <Save size={17} />
                                <span>Save House Ad Changes</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB B: Sponsor Oversight */}
            {activeTab === 'sponsors' && (
                <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-50/60">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" aria-hidden="true" />
                            <input
                                type="text"
                                value={sponsorSearch}
                                onChange={(e) => setSponsorSearch(e.target.value)}
                                placeholder="Search sponsors..."
                                aria-label="Search sponsors"
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={sponsorStatusFilter}
                                onChange={(e) => setSponsorStatusFilter(e.target.value)}
                                aria-label="Filter sponsor status"
                                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="all">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200/80 text-left">
                            <thead className="bg-slate-50/90">
                                <tr>
                                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Business / Contact</th>
                                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Wallet Balance</th>
                                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Campaigns</th>
                                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Total Spent</th>
                                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {filteredSponsors.map((sponsor) => (
                                    <tr key={sponsor.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
                                                    {(sponsor.businessName || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900">{sponsor.businessName}</div>
                                                    <div className="text-xs text-slate-500">{sponsor.contact}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm font-bold inline-flex items-center gap-1 ${sponsor.balance < 500 ? 'text-rose-600' : 'text-slate-900'}`}>
                                                <span>฿{(sponsor.balance ?? 0).toLocaleString()}</span>
                                                {sponsor.balance < 500 && <AlertTriangle size={14} aria-label="Low balance" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                {sponsor.activeAds} Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                                            ฿{(sponsor.totalSpent ?? 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full border ${
                                                    sponsor.status === 'Active'
                                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                }`}
                                            >
                                                {sponsor.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="inline-flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setViewAsSponsorId(sponsor.id)}
                                                    aria-label={`ดูแดชบอร์ดของ ${sponsor.businessName}`}
                                                    title="View Dashboard"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                >
                                                    <Eye size={14} />
                                                    <span>View</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setWalletModalSponsor(sponsor);
                                                        setWalletAmount('');
                                                    }}
                                                    aria-label={`ปรับยอดกระเป๋าเงินของ ${sponsor.businessName}`}
                                                    title="Adjust Wallet"
                                                    className="inline-flex items-center justify-center p-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                                >
                                                    <DollarSign size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSuspend(sponsor.id)}
                                                    aria-label={`ระงับบัญชี ${sponsor.businessName}`}
                                                    title="Suspend Account"
                                                    className="inline-flex items-center justify-center p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                                >
                                                    <Ban size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredSponsors.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-sm font-medium text-slate-500">
                                            ไม่พบข้อมูลสปอนเซอร์ที่ตรงกับเงื่อนไข
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-slate-50/70 px-6 py-3.5 border-t border-slate-200/80 flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-600">
                            Showing <span className="font-bold text-slate-900">{filteredSponsors.length}</span> of{' '}
                            <span className="font-bold text-slate-900">{sponsors.length}</span> sponsors
                        </p>
                    </div>
                </div>
            )}

            {/* Adjust Wallet Modal */}
            {walletModalSponsor && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="wallet-modal-title"
                >
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                            <h3 id="wallet-modal-title" className="text-base font-bold text-slate-900">
                                ปรับยอดเงินสปอนเซอร์: {walletModalSponsor.businessName}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setWalletModalSponsor(null)}
                                aria-label="ปิดหน้าต่าง"
                                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const num = Number(walletAmount);
                                if (!walletAmount || Number.isNaN(num)) {
                                    toast.error('กรุณาระบุจำนวนเงินที่ถูกต้อง');
                                    return;
                                }
                                handleAdjustWallet(walletModalSponsor.id, num);
                            }}
                            className="p-6 space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    จำนวนเงิน (+ สำหรับเติมเงิน, - สำหรับหักเงิน)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    autoFocus
                                    value={walletAmount}
                                    onChange={(e) => setWalletAmount(e.target.value)}
                                    placeholder="เช่น 500 หรือ -200"
                                    className={inputClass}
                                />
                                <p className="text-xs text-slate-500 mt-1.5">
                                    ยอดคงเหลือปัจจุบัน: ฿{(walletModalSponsor.balance ?? 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setWalletModalSponsor(null)}
                                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold shadow-sm hover:from-indigo-500 hover:to-violet-500"
                                >
                                    ยืนยันการปรับยอด
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View As Modal */}
            {viewAsSponsorId && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Viewing As Sponsor #${viewAsSponsorId}`}
                >
                    <div className="bg-slate-50 rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
                        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-950 text-white px-5 py-4 flex justify-between items-center shadow-md">
                            <div className="flex items-center gap-2.5">
                                <span className="text-amber-300 font-bold uppercase tracking-wider text-xs border border-amber-400/50 bg-amber-400/10 px-2.5 py-0.5 rounded-full">
                                    Admin Mode
                                </span>
                                <h3 className="text-base sm:text-lg font-bold">Viewing As: Sponsor #{viewAsSponsorId}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewAsSponsorId(null)}
                                aria-label="Close Sponsor Dashboard View"
                                className="inline-flex items-center gap-2 text-slate-200 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                            >
                                <span>Close View</span>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-6">
                            <BusinessDashboard sponsorId={viewAsSponsorId} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdsManager;

const AdRequestsTab = () => {
    const queryClient = useQueryClient();

    const { data: ads, isLoading } = useQuery({
        queryKey: ['pendingAds'],
        queryFn: async () => {
            const res = await adminApi.getPendingAds();
            return res;
        }
    });

    const approveMutation = useMutation({
        mutationFn: adminApi.approveAd,
        onSuccess: () => {
            toast.success('Ad approved and live');
            queryClient.invalidateQueries(['pendingAds']);
        },
        onError: () => toast.error('Failed to approve')
    });

    const rejectMutation = useMutation({
        mutationFn: adminApi.rejectAd,
        onSuccess: () => {
            toast.success('Ad rejected');
            queryClient.invalidateQueries(['pendingAds']);
        },
        onError: () => toast.error('Failed to reject')
    });

    if (isLoading) {
        return (
            <div className="rounded-2xl bg-white/90 border border-slate-200/80 p-8 text-center text-sm font-medium text-slate-600">
                Loading requests...
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/70">
                    <AlertTriangle size={17} />
                </span>
                <span>Pending Ad Approvals</span>
            </h3>

            <div className="space-y-4">
                {(ads || []).map((ad) => (
                    <div key={ad.id} className="border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-5 bg-slate-50/40">
                        {/* Preview */}
                        <div className="w-full md:w-64 flex-shrink-0 border border-slate-200 rounded-xl bg-white p-3">
                            <div className="text-xs font-semibold text-slate-500 mb-1.5">Preview</div>
                            <img
                                src={getAdPreviewImage(ad.images)}
                                alt={ad.title}
                                className="w-full h-32 object-cover rounded-lg mb-2.5 border border-slate-100"
                            />
                            <h4 className="font-bold text-sm text-slate-900 truncate">{ad.title}</h4>
                            <div className="text-xs text-slate-600 line-clamp-2 mt-1" dangerouslySetInnerHTML={{ __html: ad.content }} />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between gap-4">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="text-sm font-bold text-slate-900">{ad.Business?.name || 'Sponsor'}</span>
                                    <span className="text-xs font-medium text-slate-500">
                                        submitted on {new Date(ad.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                                    Requested Boost (Zone B)
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => approveMutation.mutate(ad.id)}
                                    disabled={approveMutation.isPending}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                >
                                    <CheckCircle size={16} />
                                    <span>Approve</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => rejectMutation.mutate(ad.id)}
                                    disabled={rejectMutation.isPending}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                >
                                    <XCircle size={16} />
                                    <span>Reject</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {(!ads || ads.length === 0) && (
                    <div className="text-center py-14 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                            <CheckCircle size={24} />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">No pending ad requests.</p>
                        <p className="text-xs text-slate-500 mt-1">ไม่มีคำขออนุมัติโฆษณาที่รอดำเนินการ</p>
                    </div>
                )}
            </div>
        </div>
    );
};
