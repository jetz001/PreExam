import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import adsApi from '../../services/adsApi';
import paymentService from '../../services/paymentService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, Flame, Eye, MousePointer, TrendingUp, Plus, ArrowUpRight, DollarSign, CreditCard, Users, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DailyBurnList from './DailyBurnList';

const BusinessDashboard = ({ sponsorId }) => {
    // Queries
    const { data: walletData, isLoading: walletLoading } = useQuery({
        queryKey: ['businessWallet', sponsorId],
        queryFn: () => sponsorId ? adsApi.getSponsorDetails(sponsorId) : adsApi.getWalletBalance(),
        // Mock data fallback if API fails (for development)
        initialData: { balance: sponsorId ? 5000 : 0.00, currency: 'THB', businessName: 'Mock Business' }
    });

    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['businessStats'],
        queryFn: () => adsApi.getDashboardStats(),
        initialData: {
            totalViews: 0,
            totalClicks: 0,
            activeAds: 0,
            totalSpent: 0,
            dailyStats: [] // { date: '2023-10-01', views: 100, clicks: 5 }
        }
    });

    const [activeTab, setActiveTab] = useState('ads');
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState(1000);
    const [slipFile, setSlipFile] = useState(null);
    const [slipPreview, setSlipPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTopUp = async () => {
        if (!slipFile) {
            toast.error('Please upload a transfer slip');
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload Slip
            const uploadRes = await adsApi.uploadImage(slipFile);
            if (!uploadRes.success) throw new Error('Failed to upload slip');

            // 2. Submit Top Up
            await adsApi.topUpWallet(topUpAmount, uploadRes.imageUrl);

            toast.success('Top-up request submitted! Waiting for approval.');
            setIsTopUpModalOpen(false);
            setSlipFile(null);
            setSlipPreview(null);
        } catch (error) {
            console.error(error);
            toast.error('Top-up failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStripeTopUp = async () => {
        try {
            setIsSubmitting(true);
            const session = await paymentService.createCheckoutSession({
                amount: topUpAmount,
                type: 'WALLET_TOPUP',
                // businessId is strictly not needed if backend uses req.user, but if user has multiple businesses or backend logic requires it:
                // In paymentController, for WALLET_TOPUP, it uses req.user.id. 
                // For AD_PURCHASE it checks businessId. 
                // Safe to send but might be ignored by backend for TOPUP if not set up.
            });
            if (session.url) {
                window.location.href = session.url;
            } else {
                toast.error("Failed to initiate payment");
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error("Stripe TopUp Error", err);
            const errorMsg = err.response?.data?.error || err.message || "Payment initialization failed";
            toast.error("Error: " + errorMsg);
            setIsSubmitting(false);
        }
    };

    const handleSlipChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSlipFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setSlipPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Derived mock data for chart if empty
    // Use real data or empty array
    const chartData = statsData.performanceData || [];

    return (
        <div className="space-y-6">
            {/* Dashboard Headers & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Business Portal</h1>
                    <p className="text-gray-500">Manage your business presence and advertising.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('ads')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'ads' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Ads Console
                    </button>
                    <button
                        onClick={() => setActiveTab('page')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'page' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Page Overview
                    </button>
                </div>
            </div>

            {/* ADS CONSOLE TAB */}
            {activeTab === 'ads' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-end">
                        <Link to="/business/create-ad" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                            <Plus size={18} className="mr-2" />
                            Create New Ad
                        </Link>
                    </div>

                    {/* Stats Cards - Ads Specific */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Wallet Balance */}
                        <Link to="/business/wallet" className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer col-span-1 md:col-span-2 lg:col-span-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium mb-1">Wallet Balance</p>
                                    <h3 className="text-3xl font-bold">
                                        ฿{walletData?.balance ? parseFloat(walletData.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                    </h3>
                                </div>
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Wallet size={24} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1 text-sm text-blue-100">
                                <span>Click to top up & view history</span>
                            </div>
                        </Link>

                        {/* Active Ads */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Active Campaigns</p>
                                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{statsData.activeAds}</h3>
                                </div>
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <Flame size={24} />
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-gray-400">Running normally</p>
                        </div>

                        {/* Total Views */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Views</p>
                                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{statsData.totalViews.toLocaleString()}</h3>
                                </div>
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Eye size={24} />
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-gray-400">Viewability verified (&gt; 1s)</p>
                        </div>

                        {/* Total Clicks */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Clicks</p>
                                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{statsData.totalClicks.toLocaleString()}</h3>
                                </div>
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                    <MousePointer size={24} />
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-gray-400">CTR: {statsData.totalViews > 0 ? ((statsData.totalClicks / statsData.totalViews) * 100).toFixed(2) : 0}%</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                    <TrendingUp size={20} className="mr-2 text-blue-500" /> Performance
                                </h2>
                                <select className="text-sm border-gray-200 rounded-md text-gray-500">
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                </select>
                            </div>
                            <div className="h-80 w-full min-h-[320px]">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                                        <Area type="monotone" dataKey="clicks" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setIsTopUpModalOpen(true)}
                                    className="w-full text-left px-4 py-4 rounded-xl border-2 border-green-100 bg-green-50/50 hover:bg-green-50 hover:border-green-200 transition-all flex items-center justify-between group shadow-sm"
                                >
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center mr-3 shadow-sm group-hover:scale-110 transition-transform">
                                            <Wallet size={20} />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-gray-800 text-base">Top-up Wallet</span>
                                            <span className="text-xs text-green-700 font-medium">Add funds instantly</span>
                                        </div>
                                    </div>
                                    <div className="bg-white p-1.5 rounded-full shadow-sm text-green-500 group-hover:translate-x-1 transition-transform">
                                        <ArrowUpRight size={18} />
                                    </div>
                                </button>
                            </div>

                            <div className="mt-8 flex-grow flex flex-col min-h-0">
                                <h3 className="text-sm font-semibold text-gray-500 mb-3">Recent Daily Burn (Real-time)</h3>
                                <div className="space-y-4 overflow-y-auto pr-1 flex-grow scrollbar-thin">
                                    <DailyBurnList />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PAGE OVERVIEW TAB */}
            {activeTab === 'page' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Followers */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Followers</p>
                                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{statsData.totalFollowers || 0}</h3>
                                </div>
                                <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                                    <Users size={24} />
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-gray-400">Total followers</p>
                        </div>

                        {/* Total Reviews */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{statsData.totalReviews || 0}</h3>
                                </div>
                                <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                                    <MessageSquare size={24} />
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-gray-400">Customer feedback</p>
                        </div>

                        {/* Total Page Views */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Page Views</p>
                                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{statsData.totalPageViews?.toLocaleString() || 0}</h3>
                                </div>
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <MousePointer size={24} />
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-gray-400">Total visits</p>
                        </div>
                    </div>

                    {/* Placeholder for content list or other page management features */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Manage Page Content</h2>
                        <p className="text-gray-500 mb-6">Create and manage your business posts, products, and articles here.</p>
                        <Link to="/business/content" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            Go to Content Manager
                        </Link>
                    </div>
                </div>
            )}

            {/* Top Up Modal */}
            {isTopUpModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Add Funds</h3>
                            <button onClick={() => setIsTopUpModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                &times;
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (THB)</label>
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    {[100, 500, 1000].map(amt => (
                                        <button
                                            key={amt}
                                            onClick={() => setTopUpAmount(amt)}
                                            className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${topUpAmount === amt
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                                }`}
                                        >
                                            ฿{amt.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">฿</span>
                                    </div>
                                    <input
                                        type="number"
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-3"
                                        placeholder="0.00"
                                        value={topUpAmount}
                                        onChange={(e) => setTopUpAmount(Number(e.target.value))}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">THB</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg flex items-start">
                                <CreditCard size={20} className="text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Bank Transfer</p>
                                    <p className="text-xs text-gray-500 mt-1">Transfer to: Krungthai Bank<br />Account: 981-4-53030-1<br />Ref: BUSINESS-ID</p>
                                </div>
                            </div>

                            {/* Stripe Payment Option */}
                            <button
                                onClick={handleStripeTopUp}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                <div className="flex -space-x-1 mr-1">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                Pay Instantly (Credit Card / QR)
                            </button>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or Manual Transfer</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg flex items-start">
                                <CreditCard size={20} className="text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Bank Transfer (Manual)</p>
                                    <p className="text-xs text-gray-500 mt-1">Transfer to: Krungthai Bank<br />Account: 981-4-53030-1<br />Ref: BUSINESS-ID</p>
                                </div>
                            </div>

                            {/* Slip Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Transfer Slip</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors bg-gray-50">
                                    {slipPreview ? (
                                        <div className="relative">
                                            <img src={slipPreview} alt="Slip Preview" className="max-h-32 mx-auto rounded shadow-sm" />
                                            <button
                                                onClick={() => { setSlipFile(null); setSlipPreview(null); }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block">
                                            <div className="text-gray-500 text-sm">
                                                <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5MB)</p>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleSlipChange} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleTopUp}
                                disabled={isSubmitting}
                                className={`w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-all transform active:scale-95 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Confirm Top-up'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessDashboard;
