import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import friendService from '../../services/friendService';

const CommunityLeftBar = ({ user }) => {
    const [friends, setFriends] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedFriends = await friendService.getFriends();
                setFriends(fetchedFriends || []);
            } catch (err) {
                console.error('Error fetching friends:', err);
            } finally {
                setLoadingFriends(false);
            }

            try {
                const fetchedLeaderboard = await userService.getLeaderboard();
                setLeaderboard(fetchedLeaderboard || []);
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
            } finally {
                setLoadingLeaderboard(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div>            {/* friends */}
            <div className="pcard" style={{ animationDelay: '.08s' }}>
                <div className="pc-head">My Friends <span style={{ background: 'rgba(255,255,255,.1)', borderRadius: '99px', padding: '1px 7px', fontSize: '10px', marginLeft: '4px' }}>{friends.length}</span></div>
                {loadingFriends ? (
                    <div className="text-center py-4 text-xs text-gray-500">Loading friends...</div>
                ) : friends.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {friends.slice(0, 5).map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-lighter)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.avatar || '👤'}</div>
                                <div style={{ fontSize: '13px' }}>{f.username || f.display_name || 'Friend'}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-xs text-gray-500">No friends yet</div>
                )}
            </div>

            {/* top week */}
            <div className="pcard" style={{ animationDelay: '.12s' }}>
                <div className="pc-head">🏆 Top ชุมชน สัปดาห์นี้</div>
                {loadingLeaderboard ? (
                    <div className="text-center py-4 text-xs text-gray-500">Loading leaderboard...</div>
                ) : leaderboard.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {leaderboard.slice(0, 3).map((l, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--c-muted)', width: '12px' }}>{i + 1}</span>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-lighter)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{l.avatar || '👤'}</div>
                                    <div style={{ fontSize: '13px' }}>{l.username || 'User'}</div>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--c-yellow)', fontWeight: 'bold' }}>{l.points || 0}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-xs text-gray-500">No leaderboard data</div>
                )}
            </div>
        </div>
    );
};

export default CommunityLeftBar;
