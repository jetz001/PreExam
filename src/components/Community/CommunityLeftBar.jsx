import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import friendService from '../../services/friendService';

const CommunityLeftBar = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [friends, setFriends] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedStats = await userService.getStats();
                setStats(fetchedStats);
            } catch (err) {
                console.error('Error fetching stats:', err);
                setStats({ streak: 0, wins: 0, accuracy: 0, badges: 0 }); // Fallback
            } finally {
                setLoadingStats(false);
            }

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
        <div>
            {/* profile mini */}
            <div className="pcard" style={{ textAlign: 'center', animationDelay: '.04s' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--c-orange), var(--c-red))', border: '3px solid var(--c-yellow)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', boxShadow: '0 0 0 4px rgba(255,204,0,.15)' }}>
                    🦊
                </div>
                <div style={{ fontFamily: '"Lilita One", cursive', fontSize: '15px' }}>{user?.display_name || 'NinjaFox9000'}</div>
                <div style={{ fontSize: '11px', color: 'var(--c-muted)', marginBottom: '10px' }}>@{user?.username || 'ninjafox'} · LVL 42</div>
                
                {loadingStats ? (
                    <div className="text-center py-4 text-xs text-gray-500">Loading stats...</div>
                ) : (
                    <>
                        <div className="streak-box">
                            <div className="s-fire">🔥</div>
                            <div><div className="s-num">{stats?.streak || 0}</div><div className="s-lbl">Day Streak</div></div>
                        </div>
                        
                        <div className="mstats">
                            <div className="ms"><div className="ms-n" style={{ color: 'var(--c-yellow)' }}>{stats?.wins || 0}</div><div className="ms-l">Wins</div></div>
                            <div className="ms"><div className="ms-n" style={{ color: 'var(--c-teal)' }}>{stats?.accuracy || 0}%</div><div className="ms-l">Accuracy</div></div>
                            <div className="ms"><div className="ms-n" style={{ color: 'var(--c-orange)' }}>{stats?.badges || 0}</div><div className="ms-l">Badges</div></div>
                            <div className="ms"><div className="ms-n" style={{ color: '#a78bfa' }}>{friends.length}</div><div className="ms-l">Friends</div></div>
                        </div>
                    </>
                )}
            </div>

            {/* friends */}
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
