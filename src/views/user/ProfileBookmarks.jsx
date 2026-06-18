import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookmarkService from '../../services/bookmarkService';

const ProfileBookmarks = () => {
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookmarks = async () => {
        setLoading(true);
        try {
            const fetchFn = bookmarkService.getUserBookmarks || bookmarkService.getBookmarks;
            const res = await fetchFn();
            
            if (res.success && res.data) {
                setBookmarks(res.data);
            } else if (Array.isArray(res)) {
                setBookmarks(res);
            } else if (res.data) {
                setBookmarks(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) return;
        try {
            await bookmarkService.removeBookmark(id);
            setBookmarks(prev => prev.filter(b => b.id !== id));
        } catch (err) {
            console.error('Failed to delete bookmark', err);
            alert('ไม่สามารถลบได้');
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>กำลังโหลด...</div>;
    }

    return (
        <div id="sec-bookmarks">
            <div className="section-title" style={{ marginBottom: '20px', fontSize: '22px' }}>
                <div className="dot"></div>🔖 รายการที่บันทึกไว้
            </div>
            
            {bookmarks.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: '18px', border: '1px dashed var(--card-border)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📁</div>
                    <div style={{ fontWeight: 800 }}>ยังไม่มีรายการโปรด</div>
                    <div style={{ fontSize: '13px' }}>คุณสามารถกดบันทึกกระทู้หรือข้อสอบที่สนใจเก็บไว้ดูภายหลังได้</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeSlideIn 0.4s both' }}>
                    {bookmarks.map((bm, index) => (
                        <div 
                            key={bm.id || bm._id || index} 
                            className="activity-card hover-lift" 
                            style={{ position: 'relative', transition: 'transform 0.2s', padding: '16px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <div style={{ fontSize: '24px', marginTop: '2px' }}>
                                    {bm.target_type === 'thread' ? '💬' : '📝'}
                                </div>
                                <div style={{ flex: 1, paddingRight: '40px' }}>
                                    <div style={{ fontWeight: 800, marginBottom: '5px', fontSize: '16px', color: 'var(--text-color)' }}>
                                        {bm.title || 'Bookmarked Item'}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <span style={{ 
                                            background: bm.target_type === 'thread' ? 'rgba(88, 101, 242, 0.1)' : 'rgba(255, 161, 22, 0.1)',
                                            color: bm.target_type === 'thread' ? '#5865F2' : '#ffa116',
                                            padding: '2px 8px', borderRadius: '4px', fontWeight: 700 
                                        }}>
                                            {bm.target_type === 'thread' ? 'กระทู้' : 'ข้อสอบ'}
                                        </span>
                                        {bm.created_at && (
                                            <span>บันทึกเมื่อ: {new Date(bm.created_at).toLocaleDateString()}</span>
                                        )}
                                    </div>

                                    {bm.target_type === 'thread' && (
                                        <button 
                                            onClick={() => navigate(`/community?threadId=${bm.target_id}`)}
                                            className="btn-outline" 
                                            style={{ marginTop: '12px', padding: '6px 12px', fontSize: '12px', borderColor: 'rgba(255,255,255,0.1)' }}
                                        >
                                            ▶ ดูโพสต์
                                        </button>
                                    )}
                                </div>

                                <button 
                                    onClick={(e) => handleDelete(e, bm.id)}
                                    style={{ 
                                        position: 'absolute', top: '15px', right: '15px', 
                                        background: 'rgba(226, 27, 60, 0.1)', color: '#e21b3c', 
                                        border: 'none', width: '32px', height: '32px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', transition: 'background 0.2s'
                                    }}
                                    title="ลบรายการ"
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(226, 27, 60, 0.2)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(226, 27, 60, 0.1)'}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <style>{`
                .hover-lift:hover { transform: translateY(-3px); }
            `}</style>
        </div>
    );
};

export default ProfileBookmarks;
