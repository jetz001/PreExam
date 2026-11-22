import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Check, X, CreditCard, Clock, CheckCircle2, Eye, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentVerifier = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTx, setSelectedTx] = useState(null);

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        if (!selectedTx) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setSelectedTx(null);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedTx]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payments/pending');
            if (res.data.success) {
                setTransactions(res.data.transactions || []);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('ไม่สามารถโหลดรายการรอตรวจสอบได้');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id, status, note = '') => {
        if (!window.confirm(`Are you sure you want to ${status} this transaction?`)) return;

        try {
            const res = await api.post('/payments/review', {
                transaction_id: id,
                status,
                admin_note: note
            });
            if (res.data.success) {
                toast.success(`Transaction ${status}`);
                fetchTransactions();
                setSelectedTx(null);
            }
        } catch (error) {
            console.error('Review failed:', error);
            toast.error('Operation failed');
        }
    };

    const getSlipSrc = (slipUrl) => {
        if (!slipUrl) return '';
        return slipUrl.startsWith('http') ? slipUrl : `${api.defaults.baseURL}${slipUrl}`;
    };

    return (
        <div className="space-y-6">
            {/* Executive Page Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            ตรวจสอบสลิปการโอนเงิน (Payment Verification)
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Review pending bank transfer slips and approve subscription upgrades
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1.5 rounded-full text-xs font-bold">
                        <Clock size={14} />
                        Pending: {transactions.length}
                    </span>
                    <button
                        type="button"
                        onClick={fetchTransactions}
                        disabled={loading}
                        aria-label="รีเฟรชรายการรอตรวจสอบ"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        <span>รีเฟรช</span>
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 p-12 text-center text-slate-500 flex flex-col items-center gap-3 shadow-sm">
                    <Loader2 size={28} className="animate-spin text-indigo-600" />
                    <span className="text-sm font-medium">กำลังโหลดรายการรอตรวจสอบ...</span>
                </div>
            ) : transactions.length === 0 ? (
                <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 p-12 text-center shadow-sm">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <CheckCircle2 size={24} />
                    </div>
                    <p className="text-base font-bold text-slate-800">ไม่มีรายการค้างตรวจสอบ</p>
                    <p className="text-sm text-slate-500 mt-1">No pending transactions at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {transactions.map((tx) => (
                        <div
                            key={tx.id}
                            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-all"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    <div className="font-bold text-lg text-slate-900">
                                        {tx.user?.display_name || `User #${tx.user_id}`}
                                    </div>
                                    {tx.user?.email && (
                                        <div className="text-sm text-slate-500">{tx.user.email}</div>
                                    )}
                                </div>
                                <div className="text-sm text-slate-600 flex flex-wrap items-center gap-2">
                                    <span>
                                        Plan:{' '}
                                        <span className="font-semibold text-indigo-600">
                                            {tx.plan?.name || '-'}
                                        </span>
                                    </span>
                                    <span className="text-slate-400">•</span>
                                    <span>
                                        Amount:{' '}
                                        <span className="font-extrabold text-emerald-600">
                                            ฿{Number(tx.amount ?? 0).toLocaleString()}
                                        </span>{' '}
                                        THB
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 mt-1.5">
                                    Submitted: {tx.created_at ? new Date(tx.created_at).toLocaleString() : '-'}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                {tx.slip_url && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTx(tx)}
                                        aria-label={`ดูสลิปของ ${tx.user?.display_name || tx.user_id}`}
                                        className="relative group rounded-xl overflow-hidden border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    >
                                        <img
                                            src={getSlipSrc(tx.slip_url)}
                                            alt="Payment Slip Thumbnail"
                                            className="w-16 h-16 object-cover group-hover:opacity-80 transition-opacity"
                                        />
                                        <span className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 group-hover:opacity-100 text-white transition-opacity">
                                            <Eye size={16} />
                                        </span>
                                    </button>
                                )}

                                <div className="flex flex-row md:flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleReview(tx.id, 'approved')}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                    >
                                        <Check size={15} /> Approve
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleReview(tx.id, 'rejected')}
                                        className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 hover:bg-rose-100 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                    >
                                        <X size={15} /> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Slip Preview Modal */}
            {selectedTx && (
                <div
                    className="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedTx(null)}
                >
                    <div
                        className="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-2xl p-2 shadow-2xl border border-slate-200/80"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedTx(null)}
                            aria-label="ปิดหน้าต่างสลิป"
                            className="absolute -top-11 right-0 p-2 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                            <X size={24} />
                        </button>
                        <img
                            src={getSlipSrc(selectedTx.slip_url)}
                            alt="Slip Full Preview"
                            className="w-full max-h-[82vh] object-contain rounded-xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentVerifier;
