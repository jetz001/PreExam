import React, { useState } from 'react';
import BusinessDashboard from '../business/BusinessDashboard';
import { X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adsApi from '../../services/adsApi'; // Ensure this uses adminApi actually? No, services/adsApi, let's check.
// Wait, I put getPendingAds into adminApi, not adsApi. 
// I should import adminApi.
import adminApi from '../../services/adminApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Settings, Users, Ban, Eye, DollarSign, Activity, Save, AlertTriangle, Search, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdsManager = () => {
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'sponsors'
    // View As Modal State
    const [viewAsSponsorId, setViewAsSponsorId] = useState(null);

    // --- Tab 1: Analytics & Configuration ---
    const { data: configData, isLoading: configLoading } = useQuery({
        queryKey: ['adsConfig'],
        queryFn: adsApi.getAdsConfig,
        initialData: {
            communityViewCost: 0.1, communityClickCost: 5.0,
            newsViewCost: 0.15, newsClickCost: 6.0,
            resultViewCost: 0.2, resultClickCost: 8.0,
            inFeedFrequency: 10,
            adSenseBackupId: 'ca-pub-123456789',
            examResultSlotId: 'slot-123',
            homeSlotId: 'slot-456'
        }
    });

    const { data: platformStats, isLoading: statsLoading } = useQuery({
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
    const { data: sponsors, isLoading: sponsorsLoading } = useQuery({
        queryKey: ['adminSponsors'],
        queryFn: adsApi.getAllSponsors,
        initialData: [
            { id: 1, businessName: 'Tutor P1', contact: 'p1@tutor.com', balance: 5000, activeAds: 3, totalSpent: 20000, status: 'Active' },
            { id: 2, businessName: 'Drink Energy', contact: 'sales@drink.com', balance: 200, activeAds: 1, totalSpent: 1200, status: 'Active' }, // Low balance
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
                // Mock update local state or refetch
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
        } catch (error) {
            console.error(error);
            toast.error('Failed to adjust wallet');
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* TABS HEADER */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Ads Management System</h1>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'analytics'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Analytics & Rates
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'requests'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Ad Requests
                    </button>
                    <button
                        onClick={() => setActiveTab('house_ad')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'house_ad'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        House Ad
                    </button>
                    <button
                        onClick={() => setActiveTab('sponsors')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'sponsors'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Sponsor Oversight
                    </button>
                </div>
            </div>

            {/* TAB A: Analytics & Config */}
            {activeTab === 'analytics' && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Performance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-500 text-sm font-medium">Total Revenue (Burn)</h3>
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <DollarSign size={20} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-800">฿{platformStats.totalRevenue.toLocaleString()}</p>
                            <p className="text-green-500 text-sm flex items-center mt-2">
                                <Activity size={12} className="mr-1" /> +12% from last week
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-500 text-sm font-medium">Active Sponsors</h3>
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <Users size={20} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-800">{platformStats.activeSponsors}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-500 text-sm font-medium">Total Impressions</h3>
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Eye size={20} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-800">{(platformStats.totalViews / 1000).toFixed(1)}k</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Revenue Trend Chart */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Trend (7 Days)</h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={platformStats.revenueTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Config Panel */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                    <Settings size={20} className="mr-2 text-yellow-600" /> Slot Configuration
                                </h3>
                                <form onSubmit={handleConfigSave} className="space-y-4">
                                    {/* Cost Configurations */}
                                    <div className="space-y-4 border-b border-gray-100 pb-4">
                                        <h4 className="text-sm font-bold text-gray-900">1. Community Feed (ชุมชน)</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">View (THB)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="communityViewCost"
                                                    defaultValue={configData.communityViewCost}
                                                    className="block w-full border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Click (THB)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="communityClickCost"
                                                    defaultValue={configData.communityClickCost}
                                                    className="block w-full border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 border-b border-gray-100 pb-4">
                                        <h4 className="text-sm font-bold text-gray-900">2. News Feed (ข่าวสอบ)</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">View (THB)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="newsViewCost"
                                                    defaultValue={configData.newsViewCost}
                                                    className="block w-full border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Click (THB)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="newsClickCost"
                                                    defaultValue={configData.newsClickCost}
                                                    className="block w-full border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 border-b border-gray-100 pb-4">
                                        <h4 className="text-sm font-bold text-gray-900">3. Exam Result (ห้องสอบ)</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">View (THB)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="resultViewCost"
                                                    defaultValue={configData.resultViewCost}
                                                    className="block w-full border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Click (THB)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="resultClickCost"
                                                    defaultValue={configData.resultClickCost}
                                                    className="block w-full border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">In-Feed Injection Frequency</label>
                                        <select
                                            name="inFeedFrequency"
                                            defaultValue={configData.inFeedFrequency}
                                            className="block w-full border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="6">Every 6 Posts</option>
                                            <option value="8">Every 8 Posts</option>
                                            <option value="10">Every 10 Posts</option>
                                            <option value="12">Every 12 Posts</option>
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Lower number = More ads.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Backup AdSense Slot ID</label>
                                        <input
                                            type="text"
                                            name="adSenseBackupId"
                                            defaultValue={configData.adSenseBackupId}
                                            className="block w-full border-gray-300 rounded-md shadow-sm text-sm text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Used when no direct sponsor wins the bid.</p>
                                    </div>

                                    <div className="pt-4">
                                        <button type="submit" className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                            <Save size={16} className="mr-2" /> Save Rates
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>







                </div>
            )}

            {/* TAB: Ad Requests */}
            {activeTab === 'requests' && <AdRequestsTab />}

            {/* TAB: House Ad Configuration */}
            {
                activeTab === 'house_ad' && (
                    <div className="animate-fadeIn">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 max-w-4xl mx-auto">
                            <div className="flex items-center mb-6">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg mr-3">
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">House Ad Management</h3>
                                    <p className="text-sm text-gray-500">Manage the default "Advertise Here" banner content.</p>
                                </div>
                            </div>

                            <form onSubmit={handleConfigSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title</label>
                                            <input
                                                type="text"
                                                name="houseAdTitle"
                                                defaultValue={configData.houseAdTitle || 'ลงโฆษณากับเรา / Advertise Here'}
                                                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                                placeholder="e.g. Advertise with Us"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Found at the top of the card.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description Text</label>
                                            <textarea
                                                name="houseAdDescription"
                                                defaultValue={configData.houseAdDescription || 'เข้าถึงกลุ่มเป้าหมายนักเรียนกว่า 10,000 คน เริ่มต้นเพียง 100 บาท/วัน'}
                                                rows="4"
                                                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                                placeholder="e.g. Reach 10k students daily..."
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL</label>
                                            <div className="flex">
                                                <input
                                                    type="text"
                                                    name="houseAdImage"
                                                    defaultValue={configData.houseAdImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1'}
                                                    className="block w-full border-gray-300 rounded-l-lg shadow-sm text-xs font-mono text-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                                <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                    IMG
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Action Link</label>
                                            <input
                                                type="text"
                                                name="houseAdUrl"
                                                defaultValue={configData.houseAdUrl || '/business'}
                                                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Where the user goes when clicking.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end">
                                    <button type="submit" className="flex items-center justify-center px-8 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02]">
                                        <Save size={18} className="mr-2" /> Save House Ad Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* TAB B: Sponsor Oversight */}
            {
                activeTab === 'sponsors' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
                        {/* Header/Filter */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search sponsors..."
                                    className="pl-10 block w-64 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex space-x-2">
                                <select className="text-sm border-gray-300 rounded-md">
                                    <option>All Status</option>
                                    <option>Active</option>
                                    <option>Suspended</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business / Contact</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Balance</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaigns</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sponsors.map((sponsor) => (
                                        <tr key={sponsor.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                            {sponsor.businessName.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{sponsor.businessName}</div>
                                                        <div className="text-sm text-gray-500">{sponsor.contact}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm font-bold ${sponsor.balance < 500 ? 'text-red-600' : 'text-gray-900'}`}>
                                                    ฿{sponsor.balance.toLocaleString()}
                                                    {sponsor.balance < 500 && <AlertTriangle size={14} className="inline ml-1 mb-0.5" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {sponsor.activeAds} Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ฿{sponsor.totalSpent.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sponsor.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {sponsor.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => setViewAsSponsorId(sponsor.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="View Dashboard"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const amount = prompt("Enter adjustment amount (+ for deposit, - for deduction):");
                                                        if (amount && !isNaN(amount)) {
                                                            // Call API directly for now or create handler
                                                            // For simplicity in this step, I'll allow a direct call logic via a placeholder handler
                                                            handleAdjustWallet(sponsor.id, Number(amount));
                                                        }
                                                    }}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                    title="Adjust Wallet"
                                                >
                                                    <DollarSign size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleSuspend(sponsor.id)}
                                                    className="text-red-600 hover:text-red-900 flex-inline items-center"
                                                    title="Suspend Account"
                                                >
                                                    <Ban size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination (Mock) */}
                        <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">1</span> to <span className="font-medium">{sponsors.length}</span> of <span className="font-medium">{sponsors.length}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Previous</button>
                                        <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Next</button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* View As Modal */}
            {
                viewAsSponsorId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
                            <div className="bg-royal-blue-900 text-white p-4 flex justify-between items-center shadow-md">
                                <div className="flex items-center space-x-2">
                                    <span className="text-yellow-400 font-bold uppercase tracking-wider text-xs border border-yellow-400 px-2 py-0.5 rounded">Admin Mode</span>
                                    <h3 className="text-lg font-bold">Viewing As: Sponsor #{viewAsSponsorId}</h3>
                                </div>
                                <button
                                    onClick={() => setViewAsSponsorId(null)}
                                    className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full text-sm font-medium flex items-center"
                                >
                                    <span className="mr-2">Close View</span>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-auto p-6">
                                {/* Render Business Dashboard with Override Context */}
                                <BusinessDashboard sponsorId={viewAsSponsorId} />
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
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

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading requests...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <AlertTriangle className="mr-2 text-yellow-500" /> Pending Ad Approvals
            </h3>

            <div className="space-y-4">
                {ads?.map(ad => (
                    <div key={ad.id} className="border rounded-lg p-4 flex gap-4">
                        {/* Preview */}
                        <div className="w-1/4 min-w-[200px] border rounded bg-gray-50 p-2">
                            <div className="text-xs text-gray-400 mb-1">Preview</div>
                            <img
                                src={ad.images && JSON.parse(ad.images)[0] ? JSON.parse(ad.images)[0] : 'https://via.placeholder.com/300x150'}
                                className="w-full h-32 object-cover rounded mb-2"
                            />
                            <h4 className="font-bold text-sm truncate">{ad.title}</h4>
                            <div className="text-xs text-gray-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: ad.content }} />
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-gray-700">{ad.Business?.name}</span>
                                <span className="text-xs text-gray-400">submitted on {new Date(ad.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-4">
                                Requested Boost (Zone B)
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => approveMutation.mutate(ad.id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium flex items-center"
                                >
                                    <CheckCircle size={16} className="mr-1" /> Approve
                                </button>
                                <button
                                    onClick={() => rejectMutation.mutate(ad.id)}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium flex items-center"
                                >
                                    <XCircle size={16} className="mr-1" /> Reject
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {(!ads || ads.length === 0) && (
                    <div className="text-center py-12 text-gray-400">
                        No pending ad requests.
                    </div>
                )}
            </div>
        </div>
    );
}
