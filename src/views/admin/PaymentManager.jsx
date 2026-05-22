import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Eye, ZoomIn, Search, Crown, Megaphone, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import adminApi from '../../services/adminApi';

const PaymentManager = () => {
    const queryClient = useQueryClient();
    const [selectedSlip, setSelectedSlip] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('premium_history'); // premium_history, ads_history, pending

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
        } else if (activeTab === 'premium_history') {
            data = history.filter(p => p.type === 'subscription');
        } else if (activeTab === 'ads_history') {
            data = history.filter(p => p.type === 'topup');
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            data = data.filter(p =>
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

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">ตรวจสอบประวัติการชำระเงิน</h2>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 flex flex-col md:flex-row gap-2">
                <button
                    onClick={() => setActiveTab('premium_history')}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'premium_history' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                >
                    <Crown size={18} />
                    ประวัติ Premium ({history.filter(p => p.type === 'subscription').length})
                </button>
                <button
                    onClick={() => setActiveTab('ads_history')}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'ads_history' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                >
                    <Megaphone size={18} />
                    ประวัติ เติมเงิน Ads ({history.filter(p => p.type === 'topup').length})
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'pending' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                >
                    <Clock size={18} />
                    รอตรวจสอบ Slip ({pendingPayments.length})
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="ค้นหาผู้ใช้ หรือ อีเมล..."
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 transition duration-150 ease-in-out"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">รายการ</th>
                                <th className="px-6 py-4 font-semibold">ผู้ใช้</th>
                                <th className="px-6 py-4 font-semibold">จำนวนเงิน</th>
                                <th className="px-6 py-4 font-semibold">ช่องทาง/หลักฐาน</th>
                                <th className="px-6 py-4 font-semibold">วัน/เวลา</th>
                                <th className="px-6 py-4 font-semibold">สถานะ</th>
                                {activeTab === 'pending' && (
                                    <th className="px-6 py-4 font-semibold text-right">ดำเนินการ</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoadingPending || isLoadingHistory ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">กำลังโหลดข้อมูล...</td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">ไม่พบรายการ</td>
                                </tr>
                            ) : (
                                filteredData.map((p) => (
                                    <tr key={`${p.type}-${p.id}`} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${p.type === 'topup' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                                                }`}>
                                                {p.type === 'topup' ? 'Wallet Top-up' : 'Premium Plan'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            <div className="text-sm font-medium text-gray-900">{p.user_display_name || 'Unknown'}</div>
                                            <div className="text-sm text-gray-500">{p.user_email}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-royal-blue-600">฿{Number(p.amount).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            {p.is_stripe ? (
                                                <span className="text-indigo-600 font-medium text-xs bg-indigo-50 px-2 py-1 rounded">Stripe / Card</span>
                                            ) : p.slip_url ? (
                                                <button
                                                    onClick={() => setSelectedSlip(p.slip_url)}
                                                    className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
                                                >
                                                    <Eye size={14} className="mr-1" />
                                                    View Slip
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400">System / Unknown</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(p.created_at).toLocaleDateString()} <br />
                                            <span className="text-xs">{new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'approved' || p.status === 'completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : p.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        {activeTab === 'pending' && (
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleApprove(p.id, p.type)}
                                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(p.id, p.type)}
                                                    className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 text-xs font-medium"
                                                >
                                                    Reject
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

            {/* Slip Modal */}
            {selectedSlip && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
                    onClick={() => setSelectedSlip(null)}
                >
                    <div className="relative max-w-2xl w-full">
                        <img src={selectedSlip} alt="Full Slip" className="w-full h-auto rounded-lg shadow-2xl" />
                        <button
                            className="absolute -top-12 right-0 text-white hover:text-slate-200"
                            onClick={() => setSelectedSlip(null)}
                        >
                            <X size={32} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentManager;
