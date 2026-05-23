import React, { useState, useEffect } from 'react';
import bookmarkService from '../../services/bookmarkService';

const ProfileBookmarks = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookmarks = async () => {
            setLoading(true);
            try {
                // Use getUserBookmarks if available, else fallback to getBookmarks
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
        fetchBookmarks();
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading bookmarks...</div>;
    }

    return (
        <div id="sec-bookmarks">
            <div className="section-title" style={{ marginBottom: '20px', fontSize: '22px' }}><div className="dot"></div>🔖 Bookmarks</div>
            
            {bookmarks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No bookmarks found.
                </div>
            ) : (
                <div className="grid-2" style={{ animation: 'fadeSlideIn 0.4s both' }}>
                    {bookmarks.map((bm, index) => (
                        <div key={bm.id || bm._id || index} className="stat-card blue" style={{ cursor: 'pointer' }}>
                            <span className="sc-icon">🔖</span>
                            <div className="sc-value" style={{ color: '#5a9eff', fontSize: '18px', marginBottom: '6px' }}>{bm.title || bm.exam?.title || 'Bookmarked Item'}</div>
                            <div className="sc-label">{bm.category || 'หมวดหมู่'} · {bm.questionCount || 0} ข้อ</div>
                            <button className="btn-play" style={{ marginTop: '12px', fontSize: '12px' }}>▶ เล่นเลย</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProfileBookmarks;
