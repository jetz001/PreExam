import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Mail,
    Flag,
    MessageSquare,
    Trash2,
    Ban,
    CheckCircle,
    Inbox,
    ShieldCheck
} from 'lucide-react';
import adminApi from '../../services/adminApi';

const InboxManager = () => {
    const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' or 'reports'

    const { data: messages = [], isLoading: loadingMessages } = useQuery({
        queryKey: ['messages'],
        queryFn: adminApi.getMessages,
        enabled: activeTab === 'inbox'
    });

    const { data: reports = [], isLoading: loadingReports } = useQuery({
        queryKey: ['reports'],
        queryFn: adminApi.getReports,
        enabled: activeTab === 'reports'
    });

    const isLoading = activeTab === 'inbox' ? loadingMessages : loadingReports;

    return (
        <div className="space-y-6 pb-8">
            {/* Executive Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur-sm p-5 sm:p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                        <Inbox size={24} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                            กล่องข้อความ &amp; รายงาน (Inbox &amp; Reports)
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            ติดตามข้อความจากสปอนเซอร์ ผู้ใช้งาน และรายการแจ้งปัญหาเนื้อหา
                        </p>
                    </div>
                </div>

                {/* Segmented Pill Tab Bar */}
                <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/90 p-1 border border-slate-200/80" role="tablist">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'inbox'}
                        onClick={() => setActiveTab('inbox')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            activeTab === 'inbox'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Mail size={15} />
                        <span>Inbox</span>
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
                        <Flag size={15} />
                        <span>Reported Content</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm min-h-[400px] overflow-hidden">
                {isLoading ? (
                    <div className="p-6 space-y-4 animate-pulse" role="status" aria-label="กำลังโหลดข้อมูล">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-20 rounded-xl bg-slate-100" />
                        ))}
                    </div>
                ) : activeTab === 'inbox' ? (
                    <div className="divide-y divide-slate-100">
                        {messages.length === 0 ? (
                            <div className="py-16 px-6 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                    <Mail size={24} />
                                </div>
                                <p className="text-sm font-bold text-slate-800">No new messages.</p>
                                <p className="text-xs text-slate-500 mt-1">ยังไม่มีข้อความใหม่ในกล่องข้อความ</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className="p-5 sm:p-6 hover:bg-indigo-50/30 transition-colors flex flex-col md:flex-row gap-4 items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                            <span
                                                className={`px-2.5 py-0.5 text-xs rounded-full font-semibold border ${
                                                    msg.type === 'Sponsor'
                                                        ? 'bg-violet-50 text-violet-700 border-violet-200'
                                                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                }`}
                                            >
                                                {msg.type}
                                            </span>
                                            <span className="text-sm font-bold text-slate-900">{msg.subject}</span>
                                            <span className="text-xs font-medium text-slate-500 ml-auto md:hidden">{msg.from}</span>
                                        </div>
                                        <p className="text-slate-700 text-sm mb-2 leading-relaxed">{msg.content}</p>
                                        <p className="text-xs font-medium text-slate-500">From: {msg.from}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <button
                                            type="button"
                                            aria-label={`ตอบกลับ ${msg.subject || 'ข้อความ'}`}
                                            title="Reply"
                                            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                        >
                                            <MessageSquare size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            aria-label={`ลบ ${msg.subject || 'ข้อความ'}`}
                                            title="Delete"
                                            className="p-2 hover:bg-rose-50 rounded-xl text-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {reports.length === 0 ? (
                            <div className="py-16 px-6 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                                    <ShieldCheck size={24} />
                                </div>
                                <p className="text-sm font-bold text-slate-800">No reports requiring attention.</p>
                                <p className="text-xs text-slate-500 mt-1">ไม่มีรายการแจ้งปัญหาที่รอตรวจสอบ</p>
                            </div>
                        ) : (
                            reports.map((report) => (
                                <div key={report.id} className="p-5 sm:p-6 hover:bg-rose-50/30 transition-colors flex flex-col md:flex-row gap-4 items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="px-2.5 py-0.5 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-semibold">
                                                Reported {report.type}
                                            </span>
                                            <span className="text-xs font-medium text-slate-500">
                                                Reported by: <strong className="text-slate-700">{report.reporter}</strong>
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 mb-2">
                                            <p className="text-slate-700 text-sm italic">&ldquo;{report.content}&rdquo;</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                                        <button
                                            type="button"
                                            className="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                        >
                                            <CheckCircle size={14} />
                                            <span>Keep</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-100 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                        >
                                            <Trash2 size={14} />
                                            <span>Remove</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="px-3.5 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                        >
                                            <Ban size={14} />
                                            <span>Ban User</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InboxManager;
