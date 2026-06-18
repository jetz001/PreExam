import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import communityService from '../../services/communityService';

const ProfileThreads = () => {
    const { user } = useOutletContext();
    const navigate = useNavigate();
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchThreads = async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await communityService.getUserThreads(user.id);
            setThreads(res?.data || res || []);
        } catch (err) {
            console.error('Error fetching user threads:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThreads();
    }, [user?.id]);

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // prevent navigating to thread
        if (!window.confirm('คุณต้องการลบกระทู้นี้ใช่หรือไม่?')) return;
        try {
            await communityService.deleteThread(id);
            setThreads(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('Failed to delete thread', err);
            alert('ไม่สามารถลบกระทู้ได้');
        }
    };

    return (
        <div id="sec-threads">
            <div className="section-title" style={{ marginBottom: '20px', fontSize: '22px' }}>
                <div className="dot"></div>💬 กระทู้ของฉัน
            </div>
            
            {loading ? (
                <div style={{ color: 'var(--text-muted)' }}>กำลังโหลดกระทู้...</div>
            ) : threads.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeSlideIn 0.4s both' }}>
                    {threads.map((thread, i) => (
                        <div 
                            key={thread.id || i} 
                            onClick={() => navigate(`/community?threadId=${thread.id}`)}
                            className="activity-card hover-lift" 
                            style={{ cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <div style={{ fontSize: '24px', marginTop: '4px' }}>💬</div>
                                <div style={{ flex: 1, paddingRight: '40px' }}>
                                    <div style={{ fontWeight: 800, marginBottom: '5px', fontSize: '16px' }}>{thread.title || 'Untitled Thread'}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {thread.content?.replace(/<[^>]+>/g, '') || 'No content'}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <span>⏱ {new Date(thread.created_at).toLocaleDateString()}</span>
                                        <span>👁 {thread.stats?.views || 0}</span>
                                        <span>❤️ {thread.stats?.likes || 0}</span>
                                        <span>💬 {thread.stats?.comments_count || 0}</span>
                                    </div>
                                </div>
                                
                                {/* Delete Button */}
                                <button 
                                    onClick={(e) => handleDelete(e, thread.id)}
                                    style={{ 
                                        position: 'absolute', top: '15px', right: '15px', 
                                        background: 'rgba(226, 27, 60, 0.1)', color: '#e21b3c', 
                                        border: 'none', width: '32px', height: '32px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', transition: 'background 0.2s'
                                    }}
                                    title="ลบกระทู้"
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(226, 27, 60, 0.2)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(226, 27, 60, 0.1)'}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: '18px', border: '1px dashed var(--card-border)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🌱</div>
                    <div style={{ fontWeight: 800 }}>ยังไม่มีกระทู้</div>
                    <div style={{ fontSize: '13px' }}>กระทู้ที่คุณสร้างจะแสดงที่นี่</div>
                </div>
            )}
            <style>{`
                .hover-lift:hover { transform: translateY(-3px); }
            `}</style>
        </div>
    );
};

export default ProfileThreads;
