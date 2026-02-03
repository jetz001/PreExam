import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';
import { TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react';
import adminApi from '../../services/adminApi';

const DashboardOverview = () => {
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['adminStats'],
        queryFn: adminApi.getDashboardStats
    });

    if (isLoading) return <div className="flex items-center justify-center h-64 text-royal-blue-600">Loading Dashboard...</div>;
    if (error) return <div className="text-red-500">Error loading stats</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Overview Indicators</h2>

            {/* Key Metrics Cards */}
            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-slate-800">฿{stats?.revenue?.total.toLocaleString()}</h3>
                        <p className="text-xs text-yellow-600 mt-1">Pending: ฿{stats?.revenue?.pending.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full text-green-600">
                        <DollarSign size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Monthly Revenue</p>
                        <h3 className="text-2xl font-bold text-slate-800">฿{stats?.revenue?.monthly.toLocaleString()}</h3>
                        <p className="text-xs text-slate-400 mt-1">Current Month</p>
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                        <DollarSign size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Yearly Revenue</p>
                        <h3 className="text-2xl font-bold text-slate-800">฿{stats?.revenue?.yearly.toLocaleString()}</h3>
                        <p className="text-xs text-slate-400 mt-1">Current Year</p>
                    </div>
                    <div className="p-3 bg-teal-100 rounded-full text-teal-600">
                        <DollarSign size={24} />
                    </div>
                </div>
            </div>

            {/* Platform Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Conversion Rate</p>
                        <h3 className="text-2xl font-bold text-slate-800">{stats?.conversionRate}%</h3>
                        <p className="text-xs text-green-600 mt-1">Free to Premium</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                        <TrendingUp size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Active Users</p>
                        <h3 className="text-2xl font-bold text-slate-800">{stats?.activeUsers}</h3>
                        <p className="text-xs text-slate-500 mt-1">Online Today</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                        <Users size={24} />
                    </div>
                </div>
            </div>

            {/* Revenue Trend Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Revenue Trends (Last 6 Months)</h3>
                    <div className="text-sm text-green-600 font-medium flex items-center">
                        <TrendingUp size={16} className="mr-1" />
                        Growth
                    </div>
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <AreaChart data={stats?.revenue?.trend}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => value >= 1000 ? `฿${(value / 1000).toFixed(1)}k` : `฿${value}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => [`฿${value.toLocaleString()}`, 'Revenue']}
                            />
                            <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Commercial Viability Score */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Commercial Viability Score</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <LineChart data={stats?.commercialViability}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#eab308" // Gold
                                    strokeWidth={3}
                                    dot={{ fill: '#eab308', strokeWidth: 2 }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-sm text-slate-500 mt-2 text-center">Score = (Search Demand x 0.6) + (Engagement x 0.4)</p>
                </div>

                {/* Pain Points / Weakest Subjects */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Weakest Subjects (Pain Points)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={stats?.painPoints} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="subject" type="category" width={80} stroke="#64748b" />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="score" fill="#1e3a8a" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-start mt-4 p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="text-red-500 mt-0.5 mr-2" size={16} />
                        <p className="text-sm text-red-600">
                            <strong>Action Needed:</strong> Low scores in Math indicate a need for more tutorial content or easier practice questions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Community Health */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Community Health</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Healthy</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-100 rounded-lg">
                        <p className="text-slate-500 text-sm">Recent Reports</p>
                        <p className="text-2xl font-bold text-slate-800">{stats?.communityHealth?.recentReports}</p>
                        <p className="text-xs text-slate-400">In the last 24 hours</p>
                    </div>
                    <div className="p-4 border border-slate-100 rounded-lg">
                        <p className="text-slate-500 text-sm">Monthly Active Users</p>
                        <p className="text-2xl font-bold text-slate-800">{stats?.communityHealth?.mau}</p>
                        <p className="text-xs text-green-500">+5% from last month</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
