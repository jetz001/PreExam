import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Eye, ZoomIn, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import adminApi from '../../services/adminApi';

const PaymentManager = () => {
    const queryClient = useQueryClient();
    const [selectedSlip, setSelectedSlip] = useState(null);

    // Fetch Pending Payments
    const { data: payments = [], isLoading } = useQuery({
        queryKey: ['pendingPayments'],
        queryFn: adminApi.getPendingPayments
    });

    // Add state for search and filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    // Filter payments
    const filteredPayments = payments.filter(p => {
        // Type Filter
        if (filterType !== 'all') {
            if (p.type !== filterType) return false;
        }

        // Search Filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesName = (p.user_display_name || '').toLowerCase().includes(searchLower);
            const matchesEmail = (p.user_email || '').toLowerCase().includes(searchLower);
            return matchesName || matchesEmail;
        }

        return true;
    });

    const approveMutation = useMutation({
        mutationFn: ({ id, type }) => adminApi.approvePayment(id, type),
        onSuccess: () => {
            queryClient.invalidateQueries(['pendingPayments']);
            toast.success('Payment approved successfully');
        },
        onError: () => toast.error('Failed to approve payment')
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason, type }) => adminApi.rejectPayment(id, reason, type),
        onSuccess: () => {
            queryClient.invalidateQueries(['pendingPayments']);
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
            <h2 className="text-2xl font-bold text-slate-800">ตรวจสอบการชำระเงิน</h2>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative flex-1 max-w-md">
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
                <div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="all">ทั้งหมด</option>
                        <option value="topup">เติมเงิน (Top-up)</option>
                        <option value="subscription">สมัครสมาชิก (Subscription)</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-yellow-50/50">
                    <h3 className="text-sm font-semibold text-yellow-800 flex items-center">
                        รอการตรวจสอบ ({filteredPayments.length})
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">รายการ</th>
                                <th className="px-6 py-4 font-semibold">ผู้ใช้</th>
                                <th className="px-6 py-4 font-semibold">จำนวนเงิน</th>
                                <th className="px-6 py-4 font-semibold">วัน/เวลา</th>
                                <th className="px-6 py-4 font-semibold">หลักฐาน</th>
                                <th className="px-6 py-4 font-semibold text-right">ดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">กำลังโหลดข้อมูล...</td>
                                </tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">ไม่มีรายการที่รอตรวจสอบ</td>
                                </tr>
                            ) : (
                                filteredPayments.map((p) => (
                                    <tr key={`${p.type}-${p.id}`} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${p.type === 'topup' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {p.type === 'topup' ? 'Wallet Top-up' : 'Subscription'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            <div className="text-sm font-medium text-gray-900">{p.user_display_name || 'Unknown'}</div>
                                            <div className="text-sm text-gray-500">{p.user_email}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-royal-blue-600">฿{Number(p.amount).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(p.created_at).toLocaleDateString()} {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {p.slip_url ? (
                                                <button
                                                    onClick={() => setSelectedSlip(p.slip_url)}
                                                    className="group relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 hover:shadow-md transition-all"
                                                >
                                                    <img src={p.slip_url} alt="Slip" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ZoomIn className="text-white" size={20} />
                                                    </div>
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400">No Slip</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button
                                                onClick={() => handleApprove(p.id, p.type)}
                                                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium border border-green-200 text-xs"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(p.id, p.type)}
                                                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium border border-red-200 text-xs"
                                            >
                                                Reject
                                            </button>
                                        </td>
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

            {/* History Section */}
            <PaymentHistory searchTerm={searchTerm} filterType={filterType} />
        </div>
    );
};

const PaymentHistory = ({ searchTerm, filterType }) => {
    const [selectedSlip, setSelectedSlip] = useState(null);
    const { data: history = [], isLoading } = useQuery({
        queryKey: ['paymentHistory'],
        queryFn: adminApi.getPaymentHistory
    });

    // Filter history
    const filteredHistory = history.filter(p => {
        // Type Filter
        if (filterType !== 'all') {
            if (p.type !== filterType) return false;
        }

        // Search Filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesName = (p.user_display_name || '').toLowerCase().includes(searchLower);
            const matchesEmail = (p.user_email || '').toLowerCase().includes(searchLower);
            return matchesName || matchesEmail;
        }

        return true;
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-8">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center">
                    ประวัติการตรวจสอบ ({filteredHistory.length})
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold">รายการ</th>
                            <th className="px-6 py-4 font-semibold">ผู้ใช้</th>
                            <th className="px-6 py-4 font-semibold">จำนวนเงิน</th>
                            <th className="px-6 py-4 font-semibold">วัน/เวลา</th>
                            <th className="px-6 py-4 font-semibold">สถานะ</th>
                            <th className="px-6 py-4 font-semibold">หลักฐาน</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-slate-500">กำลังโหลดประวัติ...</td>
                            </tr>
                        ) : filteredHistory.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-slate-500">ไม่มีประวัติการตรวจสอบ</td>
                            </tr>
                        ) : (
                            filteredHistory.map((p) => (
                                <tr key={`${p.type}-${p.id}`} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${p.type === 'topup' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                            }`}>
                                            {p.type === 'topup' ? 'เติมเงิน' : 'สมัครสมาชิก'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        <div className="text-sm font-medium text-gray-900">{p.user_display_name || 'Unknown'}</div>
                                        <div className="text-sm text-gray-500">{p.user_email}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-royal-blue-600">฿{Number(p.amount).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(p.created_at).toLocaleDateString()} {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(p.status === 'approved' || p.status === 'completed') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {p.status === 'completed' || p.status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.slip_url ? (
                                            <button
                                                onClick={() => setSelectedSlip(p.slip_url)}
                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                                title="View Slip"
                                            >
                                                <Eye size={20} />
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-300">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* History Slip Modal */}
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
