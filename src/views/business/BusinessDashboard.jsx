import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import adsApi from '../../services/adsApi';
import paymentService from '../../services/paymentService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, Flame, Eye, MousePointer, TrendingUp, Plus, ArrowUpRight, DollarSign, CreditCard, Users, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DailyBurnList from './DailyBurnList';
import { motion } from 'framer-motion';


const FloatingShapes = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 left-10 w-24 h-24 bg-red-400 rounded-2xl border-4 border-black opacity-30" />
            <motion.div animate={{ y: [0, 30, 0], rotate: [0, -15, 15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-40 right-20 w-16 h-16 bg-blue-400 rounded-full border-4 border-black opacity-30" />
            <motion.div animate={{ x: [0, 20, 0], y: [0, 15, 0], rotate: [0, 45, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-32 left-32 w-20 h-20 bg-yellow-400 border-4 border-black opacity-30" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
            <motion.div animate={{ y: [0, -40, 0], rotate: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute bottom-20 right-40 w-28 h-28 bg-green-400 rounded-3xl border-4 border-black opacity-30" />
        </div>
    );
};

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
        <div className="space-y-6 min-h-[calc(100vh-80px)] bg-cyan-100 p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden font-sans">
            <FloatingShapes />
            <div className="relative z-10">
            {/* Dashboard Headers & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-black uppercase tracking-wide drop-shadow-md">Business Portal 🚀</h1>
                    <p className="text-black font-bold mt-2 text-lg">Manage your business presence and advertising.</p>
                </div>
                <div className="flex bg-white border-4 border-black p-2 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <button
                        onClick={() => setActiveTab('ads')}
                        className={`px-6 py-3 rounded-xl text-lg font-black transition-all ${activeTab === 'ads' ? 'bg-yellow-400 text-black border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-gray-600 hover:text-black border-4 border-transparent hover:border-gray-200'}`}
                    >
                        Ads Console
                    </button>
                    <button
                        onClick={() => setActiveTab('page')}
                        className={`px-6 py-3 rounded-xl text-lg font-black transition-all ${activeTab === 'page' ? 'bg-yellow-400 text-black border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-gray-600 hover:text-black border-4 border-transparent hover:border-gray-200'}`}
                    >
                        Page Overview
                    </button>
                </div>
            </div>

            {/* ADS CONSOLE TAB */}
            {activeTab === 'ads' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-end">
                        <Link to="/business/create-ad" className="flex items-center px-6 py-3 bg-green-500 text-white border-4 border-black rounded-2xl font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                            <Plus size={18} className="mr-2" />
                            Create New Ad
                        </Link>
                    </div>

                    {/* Stats Cards - Ads Specific */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Wallet Balance */}
                        <Link to="/business/wallet" className="bg-blue-500 border-4 border-black rounded-3xl p-6 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all transform hover:translate-y-[4px] hover:translate-x-[4px] cursor-pointer col-span-1 md:col-span-2 lg:col-span-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white font-black uppercase tracking-wider text-sm mb-1">Wallet Balance</p>
                                    <h3 className="text-4xl font-black mt-2 drop-shadow-md">
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
                        <div className="bg-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-black font-black uppercase tracking-wider text-sm">Active Campaigns</p>
                                    <h3 className="text-4xl font-black mt-2 drop-shadow-md text-black mt-2 drop-shadow-md">{statsData.activeAds}</h3>
                                </div>
                                <div className="p-2 bg-green-400 text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Flame size={24} />
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-gray-400">Running normally</p>
                        </div>

                        {/* Total Views */}
                        <div className="bg-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-black font-black uppercase tracking-wider text-sm">Total Views</p>
                                    <h3 className="text-4xl font-black mt-2 drop-shadow-md text-black mt-2 drop-shadow-md">{(statsData?.totalViews || 0).toLocaleString()}</h3>
                                </div>
                                <div className="p-2 bg-indigo-400 text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Eye size={24} />
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-gray-400">Viewability verified (&gt; 1s)</p>
                        </div>

                        {/* Total Clicks */}
                        <div className="bg-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-black font-black uppercase tracking-wider text-sm">Total Clicks</p>
                                    <h3 className="text-4xl font-black mt-2 drop-shadow-md text-black mt-2 drop-shadow-md">{(statsData?.totalClicks || 0).toLocaleString()}</h3>
                                </div>
                                <div className="p-2 bg-orange-400 text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <MousePointer size={24} />
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-gray-400">CTR: {statsData.totalViews > 0 ? ((statsData.totalClicks / statsData.totalViews) * 100).toFixed(2) : 0}%</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-black flex items-center uppercase">
                                    <TrendingUp size={20} className="mr-2 text-blue-500" /> Performance
                                </h2>
                                <select className="text-sm border-gray-200 rounded-md text-gray-500">
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                </select>
                            </div>
                            <div className="h-80 w-full min-h-[320px]">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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

                        <div className="bg-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] transition-all flex flex-col">
                            <h2 className="text-2xl font-black text-black mb-4 uppercase">⚡ Quick Actions</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setIsTopUpModalOpen(true)}
                                    className="w-full text-left px-4 py-4 rounded-2xl border-4 border-black bg-lime-300 hover:bg-lime-400 transition-all flex items-center justify-between group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px]"
                                >
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-full bg-white text-black border-4 border-black flex items-center justify-center mr-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
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
                        <div className="bg-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] transition-all col-span-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-black font-black uppercase tracking-wider text-sm">Followers</p>
                                    <h3 className="text-4xl font-black mt-2 drop-shadow-md text-black mt-2 drop-shadow-md">{statsData.totalFollowers || 0}</h3>
                                </div>
                                <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                                    <Users size={24} />
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-gray-400">Total followers</p>
                        </div>

                        {/* Total Reviews */}
                        <div className="bg-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] transition-all col-span-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-black font-black uppercase tracking-wider text-sm">Total Reviews</p>
                                    <h3 className="text-4xl font-black mt-2 drop-shadow-md text-black mt-2 drop-shadow-md">{statsData.totalReviews || 0}</h3>
                                </div>
                                <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                                    <MessageSquare size={24} />
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-gray-400">Customer feedback</p>
                        </div>

                        {/* Total Page Views */}
                        <div className="bg-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] transition-all col-span-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-black font-black uppercase tracking-wider text-sm">Page Views</p>
                                    <h3 className="text-4xl font-black mt-2 drop-shadow-md text-black mt-2 drop-shadow-md">{statsData.totalPageViews?.toLocaleString() || 0}</h3>
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
                    <div className="bg-yellow-300 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-black uppercase">💰 Add Funds</h3>
                            <button onClick={() => setIsTopUpModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                &times;
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-lg font-black text-black mb-2">Amount (THB)</label>
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    {[100, 500, 1000].map(amt => (
                                        <button
                                            key={amt}
                                            onClick={() => setTopUpAmount(amt)}
                                            className={`py-3 px-3 rounded-xl border-4 font-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none ${topUpAmount === amt
                                                ? 'bg-blue-500 text-white border-black'
                                                : 'bg-white text-black border-black hover:bg-gray-100'
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
                                        className="focus:ring-0 block w-full pl-8 pr-12 text-lg font-bold border-4 border-black rounded-xl py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                        placeholder="0.00"
                                        value={topUpAmount}
                                        onChange={(e) => setTopUpAmount(Number(e.target.value))}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">THB</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start">
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
                                className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-lg border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
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

                            <div className="bg-white border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start">
                                <CreditCard size={20} className="text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Bank Transfer (Manual)</p>
                                    <p className="text-xs text-gray-500 mt-1">Transfer to: Krungthai Bank<br />Account: 981-4-53030-1<br />Ref: BUSINESS-ID</p>
                                </div>
                            </div>

                            {/* Slip Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Transfer Slip</label>
                                <div className="border-4 border-dashed border-black rounded-2xl p-6 text-center hover:bg-white transition-colors bg-white/50 cursor-pointer">
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
                                className={`w-full py-4 bg-green-500 text-white font-black text-xl border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Confirm Top-up'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};

export default BusinessDashboard;
