import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    MessageSquare,
    Trash2,
    Search,
    AlertTriangle,
    X,
    Eye,
    Heart,
    ShieldCheck,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const CommunityManager = () => {
    const [activeTab, setActiveTab] = useState('threads'); // 'threads' or 'reports'
    const [threads, setThreads] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (activeTab === 'threads') {
            fetchThreads(1);
        } else {
            fetchReports();
        }
    }, [activeTab]);

    const fetchThreads = async (page = 1) => {
        setLoading(true);
        try {
            const res = await api.get('/admin/threads', {
                params: { page, limit: 20, search: searchTerm }
            });
            setThreads(res.data.threads || []);
            setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
        } catch (error) {
            console.error('Error fetching threads:', error);
            toast.error('Failed to load threads');
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/reports');
            setReports(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteThread = async (id) => {
        if (!window.confirm('Are you sure you want to delete this thread?')) return;
        try {
            await api.delete(`/admin/threads/${id}`);
            toast.success('Thread deleted');
            fetchThreads(pagination.page);
        } catch (error) {
            toast.error('Failed to delete thread');
        }
    };

    const handleResolveReport = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action === 'delete_content' ? 'delete content' : 'dismiss report'}?`)) return;
        try {
            await api.post(`/admin/reports/${id}/resolve`, { action });
            toast.success('Report processed');
            fetchReports();
        } catch (error) {
            toast.error('Failed to process report');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchThreads(1);
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Executive Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur-sm p-5 sm:p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                        <MessageSquare size={24} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                            จัดการชุมชน (Community Management)
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            ตรวจสอบกระทู้สนทนา การมีส่วนร่วม และจัดการเนื้อหาที่ถูกรายงาน
                        </p>
                    </div>
                </div>

                {/* Segmented Pill Tab Bar */}
                <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/90 p-1 border border-slate-200/80" role="tablist">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'threads'}
                        onClick={() => setActiveTab('threads')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            activeTab === 'threads'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <MessageSquare size={15} />
                        <span>Threads</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'reports'}
                        onClick={() => setActiveTab('reports')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                            activeTab === 'reports'
                                ? 'bg-white text-rose-700 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <AlertTriangle size={15} className={activeTab === 'reports' ? 'text-rose-600' : ''} />
                        <span>Reported Content</span>
                    </button>
                </div>
            </div>

            {activeTab === 'threads' && (
                <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" aria-hidden="true" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาหัวข้อกระทู้..."
                                    aria-label="Search threads"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <Search size={15} />
                                <span>Search</span>
                            </button>
                        </form>
                    </div>

                    {loading ? (
                        <div className="p-6 space-y-3 animate-pulse" role="status" aria-label="กำลังโหลดกระทู้">
                            {[...Array(4)].map((_, idx) => (
                                <div key={idx} className="h-12 rounded-xl bg-slate-100" />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left divide-y divide-slate-200/80">
                                <thead className="bg-slate-50/90">
                                    <tr>
                                        <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">ID</th>
                                        <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Topic</th>
                                        <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Author</th>
                                        <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-center">Stats</th>
                                        <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Created</th>
                                        <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {threads.map((thread) => (
                                        <tr key={thread.id} className="hover:bg-indigo-50/30 transition-colors">
                                            <td className="px-5 py-4 text-xs font-mono font-semibold text-slate-600 whitespace-nowrap">
                                                #{thread.id}
                                            </td>
                                            <td className="px-5 py-4 font-bold text-sm text-slate-900 max-w-md">
                                                <div className="line-clamp-2">{thread.title}</div>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                                                {thread.author}
                                            </td>
                                            <td className="px-5 py-4 text-center text-xs font-semibold text-slate-600 whitespace-nowrap">
                                                <div className="inline-flex items-center justify-center gap-3">
                                                    <span title="Views" className="inline-flex items-center gap-1 text-slate-600">
                                                        <Eye className="w-4 h-4 text-indigo-500" />
                                                        {thread.views}
                                                    </span>
                                                    <span title="Likes" className="inline-flex items-center gap-1 text-rose-600">
                                                        <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                                                        {thread.likes}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-600 whitespace-nowrap">
                                                {new Date(thread.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteThread(thread.id)}
                                                    aria-label={`ลบกระทู้ ${thread.title}`}
                                                    title="Delete Thread"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>ลบ</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {threads.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-14 text-center">
                                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                                    <MessageSquare size={22} />
                                                </div>
                                                <p className="text-sm font-semibold text-slate-700">No threads found.</p>
                                                <p className="text-xs text-slate-500 mt-1">ไม่พบกระทู้ที่ตรงกับคำค้นหา</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => fetchThreads(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                aria-label="หน้าก่อนหน้า"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <ChevronLeft size={14} />
                                <span>Prev</span>
                            </button>
                            <span className="px-3 py-1.5 text-xs font-semibold text-slate-600">
                                Page {pagination.page} / {pagination.totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => fetchThreads(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                aria-label="หน้าถัดไป"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <span>Next</span>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-2 mb-5">
                        <h3 className="text-base sm:text-lg font-bold text-rose-700 flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                                <AlertTriangle size={17} />
                            </span>
                            <span>Pending Reports</span>
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {reports.length} รายการ
                        </span>
                    </div>

                    {loading ? (
                        <div className="space-y-3 animate-pulse" role="status" aria-label="กำลังโหลดรายงาน">
                            {[...Array(3)].map((_, idx) => (
                                <div key={idx} className="h-28 rounded-2xl bg-slate-100" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className="border border-rose-200/80 rounded-2xl p-4 sm:p-5 bg-rose-50/40 flex flex-col md:flex-row gap-4 justify-between items-start"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${
                                                    report.type === 'thread'
                                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                }`}
                                            >
                                                {report.type}
                                            </span>
                                            <span className="text-xs text-slate-600">
                                                Reported by <span className="font-bold text-slate-900">{report.reporter}</span>
                                                {' • '}
                                                {new Date(report.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="font-bold text-sm text-slate-900 mb-2">Reason: {report.reason}</p>
                                        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 text-sm text-slate-700 leading-relaxed">
                                            &ldquo;{report.content_preview}&rdquo;
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => handleResolveReport(report.id, 'dismiss')}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                        >
                                            <X className="w-4 h-4" />
                                            <span>Dismiss</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleResolveReport(report.id, 'delete_content')}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete Content</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {reports.length === 0 && (
                                <div className="text-center py-14 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200">
                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-800">No pending reports. Great job!</p>
                                    <p className="text-xs text-slate-500 mt-1">ไม่มีรายการแจ้งปัญหาค้างตรวจสอบ</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommunityManager;
