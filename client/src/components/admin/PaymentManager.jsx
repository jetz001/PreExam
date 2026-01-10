import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

const PaymentManager = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/payments');
            setPayments(response.data);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, type) => {
        if (window.confirm('Confirm approval?')) {
            try {
                await api.post(`/admin/payments/${id}/approve`, { type });
                fetchPayments();
            } catch (error) {
                alert('Failed to approve payment');
            }
        }
    };

    const handleReject = async (id, type) => {
        if (window.confirm('Confirm rejection?')) {
            try {
                await api.post(`/admin/payments/${id}/reject`, { type });
                fetchPayments();
            } catch (error) {
                alert('Failed to reject payment');
            }
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">จัดการการเงิน (แจ้งโอน)</h2>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                        ) : payments.map((payment) => (
                            <tr key={`${payment.type}-${payment.id}`} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.type === 'topup' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                        }`}>
                                        {payment.type === 'topup' ? 'Wallet Top-up' : 'Subscription'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{payment.user_display_name || 'Unknown'}</div>
                                    <div className="text-sm text-gray-500">{payment.user_email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">฿{Number(payment.amount).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(payment.created_at).toLocaleDateString()} {new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(payment.status === 'approved' || payment.status === 'completed') ? 'bg-green-100 text-green-800' :
                                        payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {payment.status === 'completed' ? 'Approved' : payment.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    {payment.slip_url && (
                                        <a href={payment.slip_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 inline-block align-middle" title="View Slip">
                                            <Eye className="h-5 w-5" />
                                        </a>
                                    )}
                                    {payment.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleApprove(payment.id, payment.type)} className="text-green-600 hover:text-green-900 inline-block align-middle" title="Approve">
                                                <CheckCircle className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => handleReject(payment.id, payment.type)} className="text-red-600 hover:text-red-900 inline-block align-middle" title="Reject">
                                                <XCircle className="h-5 w-5" />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentManager;
