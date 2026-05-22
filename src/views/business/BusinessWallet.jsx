import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import adsApi from '../../services/adsApi';
import paymentService from '../../services/paymentService'; // Import payment service
import { Wallet, ArrowUpCircle, Printer, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const BusinessWallet = () => {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [printingTx, setPrintingTx] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [walletData, txData] = await Promise.all([
                adsApi.getWalletBalance(),
                adsApi.getTransactions()
            ]);
            setBalance(walletData.balance);
            setTransactions(txData);
        } catch (error) {
            console.error("Fetch Error", error);
            toast.error("Failed to load wallet data");
        } finally {
            setLoading(false);
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

        const businessInfo = user.business_info || {};

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
                            <h3 className="font-bold text-sm text-black">{user.business_name || user.display_name}</h3>
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
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 print:hidden">Business Wallet</h1>

            {/* Balance Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-center print:hidden">
                <div>
                    <p className="text-blue-100 text-lg mb-1">Current Balance</p>
                    <h2 className="text-4xl font-bold">฿ {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
                </div>


                {/* Top Up Modal or Logic */}
                {/* For simplicity, we can use a prompt or a small modal here. Let's use a simple prompt for now or a hidden modal. 
                Better: A defined Top Up Section or Modal. Let's make a simple prompt for MVP. */}

                <button
                    // onClick={() => toast.success("Please navigate to Dashboard to Top Up for now.")} // Or link to dashboard
                    onClick={async () => {
                        const amountStr = prompt("Enter amount to Top Up (THB):", "500");
                        if (amountStr) {
                            const amount = parseFloat(amountStr);
                            if (isNaN(amount) || amount <= 0) return toast.error("Invalid amount");

                            try {
                                const session = await paymentService.createCheckoutSession({
                                    amount: amount,
                                    type: 'WALLET_TOPUP',
                                    businessId: user.business_id // logic might need verifying if user has business_id directly or via relationship
                                    // Backend paymentController uses req.user.id for user, and businessId from body if AD_PURCHASE.
                                    // For TOPUP, usually user wallet.
                                });
                                if (session.url) window.location.href = session.url;
                            } catch (err) {
                                console.error(err);
                                toast.error("Top Up Failed");
                            }
                        }
                    }}
                    className="mt-4 md:mt-0 px-6 py-3 bg-white text-blue-700 rounded-full font-bold shadow-md hover:bg-gray-100 transition flex items-center gap-2"
                >
                    <ArrowUpCircle size={20} />
                    Top Up
                </button>
            </div>

            {/* Transaction History */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b dark:border-slate-700">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <FileText size={20} className="text-gray-500" />
                        Transaction History
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-600 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Transaction ID</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">Loading transactions...</td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">No transactions found.</td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                                        <td className="p-4 text-gray-700 dark:text-gray-300">
                                            {format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}
                                        </td>
                                        <td className="p-4 text-sm font-mono text-gray-500">
                                            #{tx.id.toString().padStart(6, '0')}
                                        </td>
                                        <td className="p-4 capitalize">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === 'deposit'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className={`p-4 font-bold ${tx.type === 'deposit' ? 'text-green-600 dark:text-green-400' : 'text-gray-800'
                                            }`}>
                                            ฿ {parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {tx.status === 'completed' && (
                                                <button
                                                    onClick={() => handlePrint(tx)}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                                                    title="Print Receipt"
                                                >
                                                    <Printer size={18} />
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
        </div >
    );
};

export default BusinessWallet;
