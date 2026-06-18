import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookmarkService from '../../services/bookmarkService';
import examService from '../../services/examService';
import DOMPurify from 'dompurify';

const ProfileBookmarks = () => {
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [loadingQuestion, setLoadingQuestion] = useState(false);

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
                setBookmarks(res.data || res);
            }
        } catch (error) {
            console.error("Failed to load bookmarks", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewQuestion = async (questionId) => {
        setLoadingQuestion(true);
        setIsQuestionModalOpen(true);
        try {
            const data = await examService.getQuestionById(questionId);
            setSelectedQuestion(data.data || data);
        } catch (error) {
            console.error("Failed to load question", error);
        } finally {
            setLoadingQuestion(false);
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
                                    <div 
                                        style={{ fontWeight: 800, marginBottom: '5px', fontSize: '16px', color: 'var(--text-color)' }}
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(bm.title || 'Bookmarked Item') }}
                                    />
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <span style={{ 
                                            background: bm.target_type === 'thread' ? 'rgba(88, 101, 242, 0.1)' : 'rgba(255, 161, 22, 0.1)',
                                            color: bm.target_type === 'thread' ? '#5865F2' : '#ffa116',
                                            padding: '2px 8px', borderRadius: '4px', fontWeight: 700 
                                        }}>
                                            {bm.target_type === 'thread' ? 'กระทู้' : 'ข้อสอบ'}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)' }}>ID: {bm.target_id}</span>
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
                                    {bm.target_type === 'question' && (
                                        <button 
                                            onClick={() => handleViewQuestion(bm.target_id)}
                                            className="btn-outline" 
                                            style={{ marginTop: '12px', padding: '6px 12px', fontSize: '12px', borderColor: 'rgba(255,255,255,0.1)' }}
                                        >
                                            ▶ ดูข้อสอบ
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
            
            {isQuestionModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                        borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '90vh',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden'
                    }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>
                                รายละเอียดข้อสอบ {selectedQuestion && <span style={{ color: 'var(--text-muted)', fontSize: '14px', marginLeft: '8px', fontWeight: 'normal' }}>(ID: {selectedQuestion.id})</span>}
                            </h3>
                            <button onClick={() => { setIsQuestionModalOpen(false); setSelectedQuestion(null); }} style={{ background: 'none', border: 'none', fontSize: '24px', color: 'var(--text-muted)', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div style={{ padding: '20px', overflowY: 'auto' }}>
                            {loadingQuestion ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>กำลังโหลดข้อสอบ...</div>
                            ) : selectedQuestion ? (
                                <div>
                                    <div style={{ marginBottom: '20px', fontSize: '16px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedQuestion.question_text) }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {[
                                            { text: selectedQuestion.choice_a, key: 'A' },
                                            { text: selectedQuestion.choice_b, key: 'B' },
                                            { text: selectedQuestion.choice_c, key: 'C' },
                                            { text: selectedQuestion.choice_d, key: 'D' }
                                        ].filter(c => c.text).map((c, i) => {
                                            const isCorrect = c.key === selectedQuestion.correct_answer;
                                            return (
                                                <div key={i} style={{
                                                    padding: '12px 16px',
                                                    borderRadius: '8px',
                                                    background: isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)',
                                                    border: `1px solid ${isCorrect ? '#22c55e' : 'var(--card-border)'}`,
                                                    color: isCorrect ? '#22c55e' : 'inherit',
                                                    display: 'flex', gap: '12px'
                                                }}>
                                                    <span style={{ fontWeight: 'bold' }}>{c.key}.</span>
                                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(c.text) }} />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px' }}>ไม่พบข้อสอบนี้ อาจถูกลบไปแล้ว</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .hover-lift:hover { transform: translateY(-3px); }
            `}</style>
        </div>
    );
};

export default ProfileBookmarks;
