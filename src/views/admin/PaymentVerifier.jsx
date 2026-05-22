import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import { Check, X, Users, CreditCard } from 'lucide-react';

const PaymentVerifier = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTx, setSelectedTx] = useState(null); // For modal view

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/payments/pending');
            if (res.data.success) {
                setTransactions(res.data.transactions);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id, status, note = '') => {
        if (!confirm(`Are you sure you want to ${status} this transaction?`)) return;

        try {
            const res = await api.post('/payments/review', {
                transaction_id: id,
                status,
                admin_note: note
            });
            if (res.data.success) {
                alert(`Transaction ${status}`);
                fetchTransactions(); // Refresh
                setSelectedTx(null);
            }
        } catch (error) {
            console.error('Review failed:', error);
            alert('Operation failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <CreditCard className="mr-3" /> Payment Verification
                    </h1>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Pending: {transactions.length}
                    </span>
                </header>

                {loading ? (
                    <div>Loading...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No pending transactions.</div>
                ) : (
                    <div className="grid gap-6">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <div className="font-bold text-lg mr-3">{tx.user?.display_name || 'User #' + tx.user_id}</div>
                                        <div className="text-sm text-gray-500">{tx.user?.email}</div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Plan: <span className="font-medium text-primary">{tx.plan?.name}</span> •
                                        Amount: <span className="font-bold">{tx.amount}</span> THB
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        Submitted: {new Date(tx.created_at).toLocaleString()}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Thumbnail */}
                                    {tx.slip_url && (
                                        <img
                                            src={tx.slip_url.startsWith('http') ? tx.slip_url : `${api.defaults.baseURL}${tx.slip_url}`}
                                            alt="Slip"
                                            className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-75"
                                            onClick={() => setSelectedTx(tx)}
                                        />
                                    )}

                                    <div className="flex flex-col space-y-2">
                                        <button
                                            onClick={() => handleReview(tx.id, 'approved')}
                                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center text-sm"
                                        >
                                            <Check size={16} className="mr-1" /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleReview(tx.id, 'rejected')}
                                            className="px-4 py-2 bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100 flex items-center justify-center text-sm"
                                        >
                                            <X size={16} className="mr-1" /> Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Slip Preview Modal */}
            {selectedTx && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTx(null)}>
                    <div className="relative max-w-3xl w-full max-h-[90vh]">
                        <img
                            src={selectedTx.slip_url.startsWith('http') ? selectedTx.slip_url : `${api.defaults.baseURL}${selectedTx.slip_url}`}
                            alt="Slip Full"
                            className="w-full h-full object-contain rounded"
                        />
                        <button className="absolute top-4 right-4 text-white hover:text-gray-300">
                            <X size={32} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentVerifier;
