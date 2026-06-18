import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import communityService from '../../services/communityService';
import userService from '../../services/userService';
import friendService from '../../services/friendService';

const CommunityRightBar = ({ onBurst, user }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [friends, setFriends] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);

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
            }
        };

        fetchUserData();
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



        </div>
    );
};

export default CommunityRightBar;
