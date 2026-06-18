import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import friendService from '../../services/friendService';

const ProfileFriends = () => {
    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFriendsData = async () => {
            try {
                const [friendsRes, pendingRes] = await Promise.all([
                    friendService.getFriends(),
                    friendService.getPendingRequests()
                ]);
                setFriends(friendsRes?.data || friendsRes || []);
                setPending(pendingRes?.data || pendingRes || []);
            } catch (err) {
                console.error('Error fetching friends:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFriendsData();
    }, []);

    const handleAccept = async (id) => {
        try {
            await friendService.acceptRequest(id);
            const acceptedUser = pending.find(req => req.id === id);
            if (acceptedUser) {
                setFriends(prev => [...prev, acceptedUser]);
            }
            setPending(prev => prev.filter(req => req.id !== id));
        } catch (err) {
            console.error('Error accepting friend:', err);
        }
    };

    const handleRemove = async (id) => {
        try {
            await friendService.removeFriend(id);
            setFriends(prev => prev.filter(f => f.id !== id));
            setPending(prev => prev.filter(req => req.id !== id));
        } catch (err) {
            console.error('Error removing friend:', err);
        }
    };

    return (
        <div id="sec-friends">
            <div className="section-title" style={{ marginBottom: '20px', fontSize: '22px' }}><div className="dot"></div>👥 Friends</div>
            
            {loading ? (
                <div style={{ color: 'var(--text-muted)' }}>Loading friends...</div>
            ) : (
                <div className="grid-2" style={{ animation: 'fadeSlideIn 0.4s both' }}>
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '18px', padding: '20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--k-yellow)' }}></span>
                            เพื่อนของคุณ ({friends.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {friends.length > 0 ? friends.map((friend, i) => (
                                <div key={friend.id || i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '10px', transition: 'background 0.2s', cursor: 'pointer' }} className="hover-bg">
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#ff7700,#e21b3c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', overflow: 'hidden' }}>
                                            {friend.avatar ? <img src={friend.avatar.startsWith('http') ? friend.avatar : `https://preexam.online${friend.avatar}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '😎'}
                                        </div>
                                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: friend.isOnline ? 'var(--k-teal)' : 'var(--k-orange)', border: '2px solid var(--k-bg)', borderRadius: '50%' }}></div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: '14px' }}>{friend.display_name || friend.username || 'User'}</div>
                                        <div style={{ fontSize: '11px', color: friend.isOnline ? 'var(--k-teal)' : 'var(--text-muted)' }}>
                                            {friend.isOnline ? 'Online' : 'Offline'}
                                        </div>
                                    </div>
                                    <button onClick={() => navigate('/profile/messages')} className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'rgba(255,255,255,0.1)' }}>ทักทาย</button>
                                </div>
                            )) : (
                                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '10px' }}>
                                    ยังไม่มีเพื่อน 
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '18px', padding: '20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--k-yellow)' }}></span>
                            คำขอเป็นเพื่อน ({pending.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {pending.length > 0 ? pending.map((req, i) => (
                                <div key={req.id || i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '10px', transition: 'background 0.2s' }} className="hover-bg">
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,119,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', overflow: 'hidden' }}>
                                        {req.avatar ? <img src={req.avatar.startsWith('http') ? req.avatar : `https://preexam.online${req.avatar}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🐉'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: '14px' }}>{req.display_name || 'User'}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ต้องการเป็นเพื่อนกับคุณ</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={() => handleAccept(req.id)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--k-yellow)', border: 'none', color: '#1a0533', fontWeight: 'bold', cursor: 'pointer' }}>✓</button>
                                        <button onClick={() => handleRemove(req.id)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '10px' }}>
                                    ไม่มีคำขอเป็นเพื่อน
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                .hover-bg:hover { background: rgba(255,255,255,0.05); }
            `}</style>
        </div>
    );
};

export default ProfileFriends;
