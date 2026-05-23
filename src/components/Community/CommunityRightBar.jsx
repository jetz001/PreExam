import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import communityService from '../../services/communityService';

const CommunityRightBar = () => {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [loadingTrending, setLoadingTrending] = useState(true);

    useEffect(() => {
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

        fetchGroups();
        fetchTrending();
    }, []);

    const onBurst = () => {
        // Navigate to daily challenge
        navigate('/exam/daily');
    };

    return (
        <div>
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

            {/* daily challenge */}
            <div className="daily pcard" style={{ animationDelay: '.13s' }}>
                <div className="pc-head" style={{ color: 'var(--c-yellow)' }}>⚡ Daily Challenge</div>
                <span className="daily-icon">🎯</span>
                <div style={{ fontWeight: 900, fontSize: '14px', marginBottom: '4px' }}>Quiz ประจำวันนี้</div>
                <div style={{ fontSize: '12px', color: 'var(--c-muted)', marginBottom: '4px' }}>ภูมิศาสตร์โลก · 10 ข้อ · 5 นาที</div>
                <div style={{ fontSize: '11px', color: 'var(--c-muted)', marginBottom: '2px' }}>🏅 รางวัล: +200 XP + Badge พิเศษ</div>
                <div style={{ fontSize: '11px', color: 'rgba(247,37,133,.8)', fontWeight: 700, marginBottom: '2px' }}>⏳ หมดเวลาใน 08:24:17</div>
                <button className="play-btn" onClick={onBurst}>▶ เริ่มเลย!</button>
            </div>
        </div>
    );
};

export default CommunityRightBar;
