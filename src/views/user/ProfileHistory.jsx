import React, { useState, useEffect } from 'react';
import examService from '../../services/examService';

const ProfileHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const res = await examService.getHistory();
                if (res.success && res.data) {
                    setHistory(res.data);
                } else if (Array.isArray(res)) {
                    setHistory(res);
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
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading history...</div>;
    }

    return (
        <div id="sec-history">
            <div className="section-title" style={{ marginBottom: '20px', fontSize: '22px' }}><div className="dot"></div>🕐 History</div>
            
            {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No exam history found.
                </div>
            ) : (
                <div className="activity-card" style={{ animation: 'fadeSlideIn 0.4s both' }}>
                    {history.map((item, index) => (
                        <div className="activity-item" key={item.id || item._id || index}>
                            <div className="act-icon y">🏆</div>
                            <div className="act-body">
                                <div className="act-title">{item.exam?.title || item.title || 'Exam'}</div>
                                <div className="act-sub">Score: {item.score || 0} / {item.totalQuestions || 0}</div>
                            </div>
                            <div className="act-right">
                                <div className="act-pts y">+{item.xpEarned || 0} XP</div>
                                <div className="act-time">{new Date(item.createdAt || Date.now()).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProfileHistory;
