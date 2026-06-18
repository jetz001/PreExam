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
                    {history.map((item, index) => {
                        const modeLabel = item.mode === 'classroom' ? 'Multiplayer Class' 
                                        : item.mode === 'simulation' ? 'Simulation Exam' 
                                        : item.mode === 'practice' ? 'Practice Mode' 
                                        : 'General Exam';
                        
                        const dateStr = item.taken_at || item.createdAt || Date.now();
                        const timeStr = item.time_taken ? ` • เวลา: ${Math.floor(item.time_taken/60)}m ${item.time_taken%60}s` : '';
                        const xpEarned = (item.score || 0) * 10; // Simple XP calc

                        return (
                            <div className="activity-item" key={item.id || item._id || index} style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' }}>
                                <div className="act-icon y" style={{ fontSize: '24px', marginRight: '16px' }}>🏆</div>
                                <div className="act-body" style={{ flex: 1 }}>
                                    <div className="act-title" style={{ fontWeight: 'bold', fontSize: '15px' }}>{modeLabel}</div>
                                    <div className="act-sub" style={{ fontSize: '13px', color: '#ccc', marginTop: '4px' }}>
                                        คะแนน: <strong style={{color: '#fff'}}>{item.score || 0}</strong> / {item.total_score || 0}
                                        {timeStr}
                                    </div>
                                    {item.subject_scores && Object.keys(item.subject_scores).length > 0 && (
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                                            {Object.entries(item.subject_scores).map(([subj, subjData]) => (
                                                <span key={subj} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', color: '#e0e0e0' }}>
                                                    {subj} {subjData.score}/{subjData.total}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="act-right" style={{ textAlign: 'right', minWidth: '100px' }}>
                                    <div className="act-pts y" style={{ fontWeight: 'bold', color: '#ffd700', marginBottom: '4px' }}>+{xpEarned} XP</div>
                                    <div className="act-time" style={{ fontSize: '12px', color: '#888' }}>
                                        {new Date(dateStr).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProfileHistory;
