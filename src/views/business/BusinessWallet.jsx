import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import adsApi from '../../services/adsApi';
import paymentService from '../../services/paymentService'; // Import payment service
import {
    Wallet,
    ArrowUpCircle,
    Printer,
    FileText,
    Sparkles,
    X,
    Loader2,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TOP_UP_PRESETS = [500, 1000, 2500, 5000];

const BusinessWallet = () => {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [printingTx, setPrintingTx] = useState(null);
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('500');
    const [isSubmittingTopUp, setIsSubmittingTopUp] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!isTopUpOpen) return undefined;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsTopUpOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isTopUpOpen]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [walletData, txData] = await Promise.all([
                adsApi.getWalletBalance(),
                adsApi.getTransactions()
            ]);
            setBalance(walletData?.balance ?? 0);
            setTransactions(Array.isArray(txData) ? txData : []);
        } catch (error) {
            console.error("Fetch Error", error);
            toast.error("Failed to load wallet data");
        } finally {
            setLoading(false);
        }
    };

    const handleTopUpSubmit = async (e) => {
        e.preventDefault();
        const amount = parseFloat(topUpAmount);
        if (isNaN(amount) || amount <= 0) {
            return toast.error("Invalid amount");
        }

        setIsSubmittingTopUp(true);
        try {
            const session = await paymentService.createCheckoutSession({
                amount: amount,
                type: 'WALLET_TOPUP',
                businessId: user?.business_id // logic might need verifying if user has business_id directly or via relationship
                // Backend paymentController uses req.user.id for user, and businessId from body if AD_PURCHASE.
                // For TOPUP, usually user wallet.
            });
            if (session?.url) {
                window.location.href = session.url;
            } else {
                toast.error("Top Up Failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("Top Up Failed");
        } finally {
            setIsSubmittingTopUp(false);
        }
    };

    const handlePrint = (tx) => {
        setPrintingTx(tx);
        // Delay slightly to allow modal to render before print
        setTimeout(() => {
            window.print();
        }, 100);
    };

    // This component is only visible when printing
    const ReceiptView = ({ tx, user }) => {
        if (!tx) return null;

        const businessInfo = user?.business_info || {};

        return (
            <div id="receipt-container" className="hidden print:block fixed inset-0 bg-white z-[9999] p-0 text-black leading-tight">
                <div className="w-[80mm] mx-auto p-2 bg-white flex flex-col font-mono text-sm text-black">
                    {/* Header */}
                    <div className="text-center mb-6 pt-2">
                        <h1 className="text-xl font-bold mb-1 uppercase text-black">Receipt</h1>
                        <p className="text-xs text-gray-600">PreExam Platform</p>
                    </div>

                    <div className="mb-4 border-b border-black pb-4 border-dashed">
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1">Received From</p>
                            <h3 className="font-bold text-sm text-black">{user?.business_name || user?.display_name}</h3>
                            {businessInfo.billing_address && <p className="text-xs mt-1 text-gray-800 whitespace-pre-wrap leading-tight">{businessInfo.billing_address}</p>}
                        </div>
                        <div className="">
                            <div className="flex justify-between mb-1">
                                <span className="text-xs text-gray-500">Receipt No.</span>
                                <span className="font-bold text-black">#{tx.id.toString().padStart(6, '0')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-500">Date</span>
                                <span className="text-black">{format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <table className="w-full mb-4">
                        <thead>
                            <tr className="border-b border-black border-dashed">
                                <th className="text-left py-2 text-xs font-bold uppercase text-black">Description</th>
                                <th className="text-right py-2 text-xs font-bold uppercase text-black">Amt</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="">
                                <td className="py-2 text-sm text-black">Wallet Top Up</td>
                                <td className="text-right py-2 font-bold text-sm text-black">฿{parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-black border-dashed">
                                <td className="font-bold text-right py-3 pt-4 text-sm text-black">Total</td>
                                <td className="font-bold text-right py-3 pt-4 text-lg text-black">฿{parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Footer */}
                    <div className="mt-4 text-center border-t border-black border-dashed pt-4 pb-8">
                        <p className="font-bold text-xs text-black">PreExam Platform</p>
                        <p className="text-[10px] text-gray-500 mt-2">Computer generated receipt.</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 print:hidden">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                        Sponsor Billing & Credits
                    </p>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Business Wallet
                    </h1>
                </div>
            </div>

            {/* Balance Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-6 sm:p-8 text-white shadow-xl border border-indigo-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
                <div className="pointer-events-none absolute -top-20 -right-16 h-60 w-60 rounded-full bg-indigo-500/25 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />

                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg shrink-0">
                        <Wallet size={28} className="text-indigo-200" />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-1">
                            <Sparkles size={12} className="text-amber-300" />
                            <span>Available Sponsor Balance</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                            ฿ {Number(balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </h2>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsTopUpOpen(true)}
                    className="relative z-10 w-full md:w-auto px-6 py-3 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm shadow-lg transition-all inline-flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    <ArrowUpCircle size={18} />
                    <span>Top Up</span>
                </button>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden print:hidden">
                <div className="p-5 sm:p-6 border-b border-slate-200/80 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 flex items-center justify-center shrink-0">
                            <FileText size={18} />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900">
                                Transaction History
                            </h3>
                            <p className="text-xs text-slate-500">
                                View deposits, campaign spend, and printable receipts
                            </p>
                        </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200/80 px-3 py-1 text-xs font-semibold text-slate-700">
                        {transactions.length} records
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left divide-y divide-slate-200">
                        <thead className="bg-slate-50/90 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-5 py-3.5">Date</th>
                                <th className="px-5 py-3.5">Transaction ID</th>
                                <th className="px-5 py-3.5">Type</th>
                                <th className="px-5 py-3.5">Amount</th>
                                <th className="px-5 py-3.5">Status</th>
                                <th className="px-5 py-3.5 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-sm font-medium text-slate-600">
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-sm font-medium text-slate-600">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-5 py-4 text-sm text-slate-700 whitespace-nowrap">
                                            {format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}
                                        </td>
                                        <td className="px-5 py-4 text-sm font-mono font-semibold text-slate-600 whitespace-nowrap">
                                            #{tx.id.toString().padStart(6, '0')}
                                        </td>
                                        <td className="px-5 py-4 capitalize whitespace-nowrap">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                                    tx.type === 'deposit'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                                }`}
                                            >
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td
                                            className={`px-5 py-4 text-sm font-bold whitespace-nowrap ${
                                                tx.type === 'deposit' ? 'text-emerald-700' : 'text-slate-900'
                                            }`}
                                        >
                                            ฿ {parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${
                                                    tx.status === 'completed'
                                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                                                        : tx.status === 'pending'
                                                            ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                                                            : 'bg-rose-50 text-rose-700 border-rose-200/80'
                                                }`}
                                            >
                                                {tx.status === 'completed' && <CheckCircle2 size={12} />}
                                                {tx.status === 'pending' && <Clock size={12} />}
                                                {tx.status !== 'completed' && tx.status !== 'pending' && <AlertCircle size={12} />}
                                                <span>{tx.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center whitespace-nowrap">
                                            {tx.status === 'completed' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handlePrint(tx)}
                                                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                    title="Print Receipt"
                                                    aria-label="Print Receipt"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Up Modal */}
            {isTopUpOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 print:hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="topup-modal-title"
                >
                    <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50/80">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-sm">
                                    <ArrowUpCircle size={18} />
                                </div>
                                <div>
                                    <h3 id="topup-modal-title" className="text-base font-extrabold text-slate-900">
                                        Top Up Wallet
                                    </h3>
                                    <p className="text-xs text-slate-500">Add sponsor ad credits (THB)</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsTopUpOpen(false)}
                                aria-label="Close modal"
                                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleTopUpSubmit} className="p-6 space-y-5">
                            <div>
                                <label htmlFor="topup-amount" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Amount (THB)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-600">
                                        ฿
                                    </span>
                                    <input
                                        id="topup-amount"
                                        type="number"
                                        min="1"
                                        step="any"
                                        required
                                        value={topUpAmount}
                                        onChange={(e) => setTopUpAmount(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-lg font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                                        placeholder="500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {TOP_UP_PRESETS.map((preset) => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => setTopUpAmount(String(preset))}
                                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                            Number(topUpAmount) === preset
                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                        }`}
                                    >
                                        ฿{preset.toLocaleString()}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsTopUpOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingTopUp}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                                >
                                    {isSubmittingTopUp && <Loader2 size={16} className="animate-spin" />}
                                    <span>{isSubmittingTopUp ? 'Redirecting...' : 'Proceed to Checkout'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Hidden Receipt Component for Printing */}
            <ReceiptView tx={printingTx} user={user} />

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #receipt-container, #receipt-container * {
                        visibility: visible;
                    }
                    #receipt-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 80mm;
                        padding: 0;
                        margin: 0;
                        background: white;
                        display: block !important;
                        z-index: 9999;
                    }
                }
            `}</style>
        </div>
    );
};

export default BusinessWallet;
