import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import communityService from '../../services/communityService';

const ProfileThreads = () => {
    const { user } = useOutletContext();
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchThreads = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }
            try {
                const res = await communityService.getUserThreads(user.id);
                setThreads(res?.data || res || []);
            } catch (err) {
                console.error('Error fetching user threads:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchThreads();
    }, [user?.id]);

    return (
        <div id="sec-threads">
            <div className="section-title" style={{ marginBottom: '20px', fontSize: '22px' }}>
                <div className="dot"></div>💬 My Threads
            </div>
            
            {loading ? (
                <div style={{ color: 'var(--text-muted)' }}>Loading threads...</div>
            ) : threads.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeSlideIn 0.4s both' }}>
                    {threads.map((thread, i) => (
                        <div key={thread.id || i} className="activity-card hover-lift" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '24px' }}>💬</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, marginBottom: '3px' }}>{thread.title || 'Untitled Thread'}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                        {thread.commentCount || 0} ความเห็น · แชร์ {thread.shareCount || 0} ครั้ง
                                    </div>
                                </div>
                                {thread.isHot && (
                                    <div style={{ background: 'rgba(255,204,0,0.18)', borderRadius: '99px', padding: '4px 12px', fontSize: '12px', fontWeight: 800, color: 'var(--k-yellow)' }}>
                                        🔥 Hot
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: '18px', border: '1px dashed var(--card-border)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🌱</div>
                    <div style={{ fontWeight: 800 }}>ยังไม่มีกระทู้</div>
                    <div style={{ fontSize: '13px' }}>กระทู้ที่คุณสร้างจะแสดงที่นี่</div>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--k-teal)' }}>ระบบแสดงกระทู้อัตโนมัติ (Coming Soon / No Data)</div>
                </div>
            )}
            <style>{`
                .hover-lift:hover { transform: translateY(-3px); }
            `}</style>
        </div>
    );
};

export default ProfileThreads;
