import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import communityService from '../../services/communityService';
import userService from '../../services/userService';
import friendService from '../../services/friendService';

const CommunityRightBar = ({ onBurst, user }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [friends, setFriends] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
    const [groups, setGroups] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [loadingTrending, setLoadingTrending] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
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

        const fetchGroups = async () => {
            try {
                const data = await communityService.getGroups();
                setGroups(data || []);
            } catch (error) {
                console.error("Failed to fetch groups", error);
            } finally {
                setLoadingGroups(false);
            }
        };

        const fetchTrending = async () => {
            try {
                const data = await communityService.getTrendingTags();
                setTrending(data || []);
            } catch (error) {
                console.error("Failed to fetch trending tags", error);
            } finally {
                setLoadingTrending(false);
            }
        };

        fetchUserData();
        fetchGroups();
        fetchTrending();
    }, []);


    return (
        <div>
            {/* profile mini */}
            <div className="pcard" style={{ textAlign: 'center', animationDelay: '.04s' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--c-orange), var(--c-red))', border: '3px solid var(--c-yellow)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', boxShadow: '0 0 0 4px rgba(255,204,0,.15)' }}>
                    {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : '🦊'}
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
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-lighter)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {f.avatar ? <img src={f.avatar.startsWith('http') ? f.avatar : `https://preexam.online${f.avatar}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                                </div>
                                <div style={{ fontSize: '13px' }}>{f.display_name || f.username || 'Friend'}</div>
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

            {/* groups */}
            <div className="pcard" style={{ animationDelay: '.05s' }}>
                <div className="pc-head">กลุ่มติวหนังสือ
                    <button style={{ marginLeft: 'auto', background: 'var(--c-yellow)', border: 'none', borderRadius: '8px', color: '#1a0533', fontFamily: '"Nunito", sans-serif', fontWeight: 900, fontSize: '10px', padding: '3px 9px', cursor: 'pointer' }}>+ สร้าง</button>
                </div>
                {loadingGroups ? (
                    <div className="text-center py-4 text-xs text-gray-500">Loading groups...</div>
                ) : groups.length > 0 ? (
                    <div className="flex flex-col gap-2 mt-2">
                        {groups.map(group => (
                            <div key={group.id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors" onClick={() => navigate(`/groups/${group.id}`)}>
                                <div>
                                    <div className="font-bold text-[#1a0533]">{group.name}</div>
                                    <div className="text-xs text-gray-500">{group.members?.length || 0} members</div>
                                </div>
                                <button className="text-xs bg-gray-200 px-2 py-1 rounded text-[#1a0533] font-semibold hover:bg-gray-300">Join</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-xs text-gray-500">ยังไม่มีกลุ่มติว</div>
                )}
            </div>

            {/* trending */}
            <div className="pcard" style={{ animationDelay: '.09s' }}>
                <div className="pc-head">🔥 Trending</div>
                {loadingTrending ? (
                    <div className="text-center py-4 text-xs text-gray-500">Loading trending...</div>
                ) : trending.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {trending.map((tag, idx) => (
                            <span key={idx} className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors">
                                #{tag.keyword} ({tag.count})
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-xs text-gray-500">No trending tags</div>
                )}
            </div>

        </div>
    );
};

export default CommunityRightBar;
