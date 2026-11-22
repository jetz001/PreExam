import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Check,
    X,
    Eye,
    Search,
    Crown,
    Megaphone,
    Clock,
    CreditCard,
    Layers,
    AlertCircle,
    CheckCircle2,
    Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';
import PaymentPlanManager from './PaymentPlanManager';

const PaymentManager = () => {
    const queryClient = useQueryClient();
    const [selectedSlip, setSelectedSlip] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('premium_history'); // premium_history, ads_history, all_history, pending, plans

    useEffect(() => {
        if (!selectedSlip) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setSelectedSlip(null);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedSlip]);

    // Fetch Lists
    const { data: pendingPayments = [], isLoading: isLoadingPending } = useQuery({
        queryKey: ['pendingPayments'],
        queryFn: adminApi.getPendingPayments
    });

    const { data: history = [], isLoading: isLoadingHistory } = useQuery({
        queryKey: ['paymentHistory'],
        queryFn: adminApi.getPaymentHistory
    });

    // Filtering Logic
    const getFilteredData = () => {
        let data = [];
        if (activeTab === 'pending') {
            data = pendingPayments;
        } else if (activeTab === 'all_history') {
            data = history;
        } else if (activeTab === 'premium_history') {
            data = history.filter((p) => p.type === 'subscription' || p.type === 'PLAN_PURCHASE');
        } else if (activeTab === 'ads_history') {
            data = history.filter((p) => p.type === 'topup');
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            data = data.filter(
                (p) =>
                    (p.user_display_name || '').toLowerCase().includes(lowerTerm) ||
                    (p.user_email || '').toLowerCase().includes(lowerTerm)
            );
        }
        return data;
    };

    const filteredData = getFilteredData();

    // Mutations
    const approveMutation = useMutation({
        mutationFn: ({ id, type }) => adminApi.approvePayment(id, type),
        onSuccess: () => {
            queryClient.invalidateQueries(['pendingPayments']);
            queryClient.invalidateQueries(['paymentHistory']);
            toast.success('Payment approved successfully');
        },
        onError: () => toast.error('Failed to approve payment')
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason, type }) => adminApi.rejectPayment(id, reason, type),
        onSuccess: () => {
            queryClient.invalidateQueries(['pendingPayments']);
            queryClient.invalidateQueries(['paymentHistory']);
            toast.success('Payment rejected');
        },
        onError: () => toast.error('Failed to reject payment')
    });

    const handleApprove = (id, type) => {
        if (window.confirm('Approve this payment?')) {
            approveMutation.mutate({ id, type });
        }
    };

    const handleReject = (id, type) => {
        const reason = window.prompt('Enter rejection reason:');
        if (reason) {
            rejectMutation.mutate({ id, reason, type });
        }
    };

    const premiumCount = history.filter((p) => p.type === 'subscription' || p.type === 'PLAN_PURCHASE').length;
    const adsCount = history.filter((p) => p.type === 'topup').length;
    const isMutating = approveMutation.isPending || approveMutation.isLoading || rejectMutation.isPending || rejectMutation.isLoading;

    const tabs = [
        {
            id: 'premium_history',
            label: `ประวัติ Premium (${premiumCount})`,
            icon: Crown,
            activeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/25'
        },
        {
            id: 'ads_history',
            label: `ประวัติเติมเงิน Ads (${adsCount})`,
            icon: Megaphone,
            activeClass: 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm shadow-sky-500/25'
        },
        {
            id: 'all_history',
            label: `ประวัติทั้งหมด (${history.length})`,
            icon: Clock,
            activeClass: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/25'
        },
        {
            id: 'pending',
            label: `รอตรวจสอบ (${pendingPayments.length})`,
            icon: AlertCircle,
            activeClass: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-500/25'
        },
        {
            id: 'plans',
            label: 'จัดการแพ็กเกจ (Plans)',
            icon: Layers,
            activeClass: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/25'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Executive Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            ตรวจสอบประวัติการชำระเงิน
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Payment History, Slip Verification &amp; Subscription Plans
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-700">
                        <Clock size={14} />
                        รอตรวจ {pendingPayments.length} รายการ
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        <CheckCircle2 size={14} />
                        ประวัติ {history.length} รายการ
                    </span>
                </div>
            </div>

            {/* Segmented Pill Tabs */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/80 p-1.5 flex flex-wrap gap-1.5">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-[155px] py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                active
                                    ? tab.activeClass
                                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                            }`}
                        >
                            <Icon size={17} />
                            <span className="truncate">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {activeTab === 'plans' ? (
                <PaymentPlanManager />
            ) : (
                <div className="space-y-5">
                    {/* Search Bar */}
                    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="ค้นหาผู้ใช้ หรือ อีเมล..."
                                aria-label="ค้นหาผู้ใช้หรืออีเมล"
                                className="block w-full pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl bg-slate-50/70 placeholder:text-slate-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm text-slate-900 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    aria-label="ล้างคำค้นหา"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                            แสดง {filteredData.length} รายการ
                        </span>
                    </div>

                    {/* Table */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50/90 text-slate-700 border-b border-slate-200/80 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">รายการ</th>
                                        <th className="px-6 py-4 font-bold">ผู้ใช้</th>
                                        <th className="px-6 py-4 font-bold">จำนวนเงิน</th>
                                        <th className="px-6 py-4 font-bold">ช่องทาง/หลักฐาน</th>
                                        <th className="px-6 py-4 font-bold">วัน/เวลา</th>
                                        <th className="px-6 py-4 font-bold">สถานะ</th>
                                        {activeTab === 'pending' && (
                                            <th className="px-6 py-4 font-bold text-right">ดำเนินการ</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoadingPending || isLoadingHistory ? (
                                        <tr>
                                            <td
                                                colSpan={activeTab === 'pending' ? 7 : 6}
                                                className="px-6 py-12 text-center text-slate-500 font-medium"
                                            >
                                                กำลังโหลดข้อมูลการชำระเงิน...
                                            </td>
                                        </tr>
                                    ) : filteredData.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={activeTab === 'pending' ? 7 : 6}
                                                className="px-6 py-12 text-center text-slate-500 font-medium"
                                            >
                                                ไม่พบรายการชำระเงินในหมวดนี้
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredData.map((p) => (
                                            <tr key={`${p.type}-${p.id}`} className="hover:bg-indigo-50/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2.5 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${
                                                            p.type === 'topup'
                                                                ? 'bg-sky-50 text-sky-700 border-sky-200/80'
                                                                : 'bg-amber-50 text-amber-700 border-amber-200/80'
                                                        }`}
                                                    >
                                                        {p.type === 'topup' ? (
                                                            <>
                                                                <Megaphone size={12} /> Wallet Top-up
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Sparkles size={12} /> Premium Plan
                                                            </>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-800">
                                                    <div className="text-sm font-bold text-slate-900">
                                                        {p.user_display_name || 'Unknown'}
                                                    </div>
                                                    <div className="text-xs text-slate-500">{p.user_email}</div>
                                                </td>
                                                <td className="px-6 py-4 font-extrabold text-indigo-600 whitespace-nowrap">
                                                    ฿{Number(p.amount ?? 0).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {p.is_stripe ? (
                                                        <span className="text-indigo-700 font-semibold text-xs bg-indigo-50 border border-indigo-200/70 px-2.5 py-1 rounded-full">
                                                            Stripe / Card
                                                        </span>
                                                    ) : p.slip_url ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedSlip(p.slip_url)}
                                                            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/70 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                        >
                                                            <Eye size={14} />
                                                            ดูสลิป (View Slip)
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-slate-500 font-medium">
                                                            System / Unknown
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                                    <div className="font-medium text-slate-700">
                                                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {p.created_at
                                                            ? new Date(p.created_at).toLocaleTimeString([], {
                                                                  hour: '2-digit',
                                                                  minute: '2-digit'
                                                              })
                                                            : ''}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full border uppercase tracking-wide ${
                                                            p.status === 'approved' || p.status === 'completed' || p.status === 'success'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : p.status === 'pending'
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                : 'bg-rose-50 text-rose-700 border-rose-200'
                                                        }`}
                                                    >
                                                        {p.status}
                                                    </span>
                                                </td>
                                                {activeTab === 'pending' && (
                                                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            disabled={isMutating}
                                                            onClick={() => handleApprove(p.id, p.type)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                                        >
                                                            <Check size={14} /> Approve
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={isMutating}
                                                            onClick={() => handleReject(p.id, p.type)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-100 text-xs font-semibold transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                                        >
                                                            <X size={14} /> Reject
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Slip Preview Modal */}
                    {selectedSlip && (
                        <div
                            className="fixed inset-0 bg-slate-900/75 z-50 flex items-center justify-center p-4 backdrop-blur-md cursor-zoom-out"
                            onClick={() => setSelectedSlip(null)}
                        >
                            <div
                                className="relative max-w-2xl w-full bg-white rounded-2xl p-2 shadow-2xl border border-slate-200/80 cursor-default"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    aria-label="ปิดตัวอย่างสลิป"
                                    onClick={() => setSelectedSlip(null)}
                                    className="absolute -top-11 right-0 p-2 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    <X size={24} />
                                </button>
                                <img
                                    src={selectedSlip}
                                    alt="หลักฐานการโอนเงิน (Payment Slip)"
                                    className="w-full max-h-[82vh] object-contain rounded-xl"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PaymentManager;
