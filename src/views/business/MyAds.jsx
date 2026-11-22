import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adsApi from '../../services/adsApi';
import {
    Pause,
    Play,
    Edit,
    AlertCircle,
    Search,
    Megaphone,
    Plus,
    Eye,
    Wallet,
    Image as ImageIcon,
    Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const MyAds = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: ads, isLoading } = useQuery({
        queryKey: ['myAds'],
        queryFn: adsApi.getMyAds,
        initialData: [
            { id: 1, campaignName: 'Summer Sale', image: null, budget: 5000, spent: 1200, status: 'active', type: 'in-feed' },
            { id: 2, campaignName: 'Brand Awareness', image: null, budget: 2000, spent: 2000, status: 'out_of_budget', type: 'result-page' },
            { id: 3, campaignName: 'Test Ad', image: null, budget: 1000, spent: 0, status: 'paused', type: 'in-feed' },
        ]
    });

    const [searchTerm, setSearchTerm] = useState('');

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, status }) => adsApi.updateAdStatus(id, status),
        onSuccess: () => {
            toast.success('Status updated');
            queryClient.invalidateQueries(['myAds']);
        },
        onError: () => toast.error('Failed to update status')
    });

    const handleToggle = (ad) => {
        if (ad.status === 'out_of_budget') return;
        const newStatus = ad.status === 'active' ? 'paused' : 'active';

        // Optimistic update (simulated via existing data for immediate feedback if api was real)
        // Here we just trigger mutation
        toggleStatusMutation.mutate({ id: ad.id, status: newStatus });

        // Mock update for this demo since API is mocked in component:
        // In real app, invalidateQueries re-fetches.
        // For demo, force a toast.
    };

    const adList = Array.isArray(ads) ? ads : [];
    const filteredAds = adList.filter(ad =>
        (ad.title || ad.campaignName || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    const activeCount = adList.filter(ad => ad.status === 'active').length;
    const totalBudget = adList.reduce((sum, ad) => sum + (Number(ad.budget_total || ad.budget) || 0), 0);
    const totalViews = adList.reduce((sum, ad) => sum + (Number(ad.views_count) || 0), 0);

    return (
        <div className="space-y-6 pb-8">
            {/* Header Bar */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                        <Megaphone size={22} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                            Campaign Management
                        </p>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            My Campaigns
                        </h1>
                        <p className="text-sm text-slate-600 mt-0.5">
                            ติดตามสถานะ งบประมาณ และผลลัพธ์ของแคมเปญโฆษณาทั้งหมด
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            aria-label="Search campaigns"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                        />
                    </div>
                    <Link
                        to="/business/create-ad"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0"
                    >
                        <Plus size={18} />
                        <span>New Campaign</span>
                    </Link>
                </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Active Campaigns
                        </p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">{activeCount}</p>
                        <p className="text-xs text-slate-600 mt-0.5">of {adList.length} total campaigns</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center shrink-0">
                        <Sparkles size={20} />
                    </div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Allocated Budget
                        </p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">
                            ฿{totalBudget.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">Across all placements</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 flex items-center justify-center shrink-0">
                        <Wallet size={20} />
                    </div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Total Views
                        </p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">
                            {totalViews.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">Recorded impressions</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-violet-50 border border-violet-200/80 text-violet-700 flex items-center justify-center shrink-0">
                        <Eye size={20} />
                    </div>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50/90">
                            <tr>
                                <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Campaign
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Budget Used
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Views / Clicks
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Placement
                                </th>
                                <th scope="col" className="relative px-5 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-5 py-10 text-center text-sm font-medium text-slate-600">
                                        Loading campaigns...
                                    </td>
                                </tr>
                            ) : (
                                filteredAds.map((ad) => {
                                    const spent = Number(ad.budget_spent || ad.spent) || 0;
                                    const budget = Number(ad.budget_total || ad.budget) || 0;
                                    const ratio = budget > 0 ? spent / budget : 0;
                                    const pct = Math.min(ratio * 100, 100);

                                    return (
                                        <tr key={ad.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="flex-shrink-0 h-12 w-20 bg-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
                                                        {ad.image_url || ad.image ? (
                                                            <img
                                                                className="h-full w-full object-cover"
                                                                src={ad.image_url || ad.image}
                                                                alt={ad.title || ad.campaignName || 'Campaign creative'}
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 text-[11px] font-medium">
                                                                <ImageIcon size={14} className="mb-0.5" />
                                                                <span>No Img</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900">
                                                            {ad.title || ad.campaignName || 'Untitled'}
                                                        </div>
                                                        <div className="text-xs font-medium text-slate-500">
                                                            ID: #{ad.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full items-center gap-1.5 border ${
                                                        ad.status === 'active'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                                            : ad.status === 'paused'
                                                                ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                                                                : 'bg-slate-100 text-slate-700 border-slate-200'
                                                    }`}
                                                >
                                                    {ad.status === 'active' && (
                                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                    )}
                                                    {ad.status === 'paused' && <Pause size={11} />}
                                                    {ad.status === 'out_of_budget' && <AlertCircle size={11} />}
                                                    <span>
                                                        {ad.status === 'active'
                                                            ? 'Active'
                                                            : ad.status === 'out_of_budget'
                                                                ? 'Out of Budget'
                                                                : 'Paused'}
                                                    </span>
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-slate-900">
                                                    ฿{spent.toLocaleString()} <span className="text-slate-500 font-normal">/ ฿{budget.toLocaleString()}</span>
                                                </div>
                                                <div className="w-28 h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden border border-slate-200/60">
                                                    <div
                                                        className={`h-full rounded-full ${
                                                            ratio > 0.9 ? 'bg-rose-500' : 'bg-indigo-600'
                                                        }`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 whitespace-nowrap text-center">
                                                <div className="text-sm text-slate-900 font-semibold">
                                                    {ad.views_count || 0} <span className="text-slate-500 font-normal">/</span> {ad.clicks_count || 0}
                                                </div>
                                                <div className="text-xs font-medium text-slate-500 mt-0.5">
                                                    CTR: {(((ad.clicks_count || 0) / Math.max(ad.views_count, 1)) * 100).toFixed(1)}%
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-slate-700 capitalize">
                                                {(ad.placement || ad.type || '').replace('-', ' ')}
                                            </td>

                                            <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggle(ad)}
                                                        disabled={ad.status === 'out_of_budget'}
                                                        className={`p-2 rounded-xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                                            ad.status === 'active'
                                                                ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                                                                : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                                        } ${ad.status === 'out_of_budget' ? 'opacity-50 cursor-not-allowed text-slate-500 bg-slate-100 border-slate-200' : ''}`}
                                                        title={ad.status === 'active' ? 'Pause' : 'Resume'}
                                                        aria-label={ad.status === 'active' ? 'Pause campaign' : 'Resume campaign'}
                                                    >
                                                        {ad.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate('/business/create-ad', { state: { ad } })}
                                                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                        title="Edit campaign"
                                                        aria-label="Edit campaign"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {!isLoading && filteredAds.length === 0 && (
                    <div className="p-10 text-center">
                        <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                            <Megaphone size={22} />
                        </div>
                        <p className="text-sm font-semibold text-slate-800">
                            {adList.length === 0 ? 'No campaigns found.' : 'No campaigns match your search.'}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                            <Link
                                to="/business/create-ad"
                                className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1"
                            >
                                Create one now
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAds;
