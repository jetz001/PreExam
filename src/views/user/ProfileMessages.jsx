import React, { useEffect, useState } from 'react';
import chatApi from '../../services/chatApi';

const ProfileMessages = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const data = await chatApi.getInboxConversations();
                setConversations(data || []);
            } catch (err) {
                console.error('Error fetching messages:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, []);

    return (
        <div id="sec-messages">
            <div className="section-title" style={{ marginBottom: '20px', fontSize: '22px' }}><div className="dot"></div>📩 กล่องข้อความ</div>
            
            {loading ? (
                <div style={{ color: 'var(--text-muted)' }}>Loading messages...</div>
            ) : conversations.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'fadeSlideIn 0.4s both' }}>
                    {conversations.map((conv, i) => (
                        <div key={conv.id || i} className="activity-card hover-slide" style={{ cursor: 'pointer', borderLeft: !conv.isRead ? '3px solid var(--k-yellow)' : 'none', transition: 'transform 0.2s' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#ff7700,#e21b3c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                                    {conv.friend?.avatar ? <img src={conv.friend.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '😎'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                        <span style={{ fontWeight: 800 }}>{conv.friend?.display_name || 'User'}</span>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                            {conv.lastMessage?.created_at ? new Date(conv.lastMessage.created_at).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: !conv.isRead ? '#fff' : 'var(--text-muted)' }}>
                                        "{conv.lastMessage?.content || 'Sent an attachment'}"
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: '18px', border: '1px dashed var(--card-border)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📬</div>
                    <div style={{ fontWeight: 800 }}>ยังไม่มีข้อความ</div>
                    <div style={{ fontSize: '13px' }}>ข้อความของคุณจะแสดงที่นี่</div>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--k-yellow)' }}>ระบบแชทกำลังจะมาในเร็วๆ นี้ (Coming Soon)</div>
                </div>
            )}
            <style>{`
                .hover-slide:hover { transform: translateX(4px); }
            `}</style>
        </div>
    );
};

export default ProfileMessages;
