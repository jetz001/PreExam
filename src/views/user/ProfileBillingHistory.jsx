import React, { useState, useEffect } from 'react';
import paymentService from '../../services/paymentService';

const ProfileBillingHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                // Call our newly added endpoint
                const res = await paymentService.getMyTransactions();
                if (res.success && res.history) {
                    setHistory(res.history);
                } else if (res.data) {
                    setHistory(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading billing history...</div>;
    }

    return (
        <div id="sec-billing-history">
            <div className="section-title" style={{ marginBottom: '20px', fontSize: '22px' }}><div className="dot"></div>💳 Billing History</div>
            
            {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No payment history found.
                </div>
            ) : (
                <div className="activity-card" style={{ animation: 'fadeSlideIn 0.4s both' }}>
                    {history.map((item, index) => {
                        const dateStr = item.created_at || Date.now();
                        
                        // Status styling
                        let statusColor = '#ccc';
                        let statusIcon = '⏳';
                        let statusText = item.status || 'pending';
                        
                        if (statusText === 'approved' || statusText === 'complete' || statusText === 'paid') {
                            statusColor = 'var(--k-teal, #26890c)';
                            statusIcon = '✅';
                            statusText = 'Completed';
                        } else if (statusText === 'rejected' || statusText === 'failed') {
                            statusColor = 'var(--k-red, #e21b3c)';
                            statusIcon = '❌';
                            statusText = 'Failed';
                        } else {
                            statusColor = 'var(--k-yellow, #ffb020)';
                            statusText = 'Pending';
                        }

                        return (
                            <div className="activity-item" key={item.id || index} style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' }}>
                                <div className="act-icon" style={{ fontSize: '24px', marginRight: '16px' }}>{statusIcon}</div>
                                <div className="act-body" style={{ flex: 1 }}>
                                    <div className="act-title" style={{ fontWeight: 'bold', fontSize: '15px' }}>
                                        {item.metadata?.product_name || item.plan_id || 'Premium Subscription'}
                                    </div>
                                    <div className="act-sub" style={{ fontSize: '13px', color: '#ccc', marginTop: '4px' }}>
                                        Method: <strong style={{color: '#fff', textTransform: 'uppercase'}}>{item.payment_method || 'N/A'}</strong>
                                        {' • '} Transaction ID: {item.id ? item.id.substring(0, 8) + '...' : '-'}
                                    </div>
                                </div>
                                <div className="act-right" style={{ textAlign: 'right', minWidth: '100px' }}>
                                    <div className="act-pts" style={{ fontWeight: 'bold', color: statusColor, marginBottom: '4px' }}>
                                        ฿{item.amount || 0}
                                    </div>
                                    <div className="act-time" style={{ fontSize: '12px', color: '#888' }}>
                                        {new Date(dateStr).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </div>
                                    <div style={{ fontSize: '11px', color: statusColor, marginTop: '2px', fontWeight: 'bold' }}>
                                        {statusText}
                                    </div>
                                    {item.receipt_url && (
                                        <div style={{ marginTop: '8px' }}>
                                            <a href={item.receipt_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', color: '#e0e0e0', textDecoration: 'none', display: 'inline-block' }}>
                                                📄 View Receipt
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProfileBillingHistory;
