import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Flame,
    Trophy,
    Target,
    Users,
    Zap,
    ArrowRight,
    TrendingUp,
    Hash,
    ChevronRight,
    Sparkles,
} from 'lucide-react';
import communityService from '../../services/communityService';
import userService from '../../services/userService';
import friendService from '../../services/friendService';

const DEFAULT_TAGS = ['กพ69', 'ท้องถิ่น', 'ครูผู้ช่วย', 'แนวข้อสอบ', 'สรุปย่อ'];

const CommunityRightBar = ({ onBurst, user }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [friends, setFriends] = useState([]);
    const [trendingTags, setTrendingTags] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

        const fetchUserData = async () => {
            try {
                const tagRes = await communityService.getTrendingTags?.();
                const normalizedTags = Array.isArray(tagRes)
                    ? tagRes
                    : Array.isArray(tagRes?.tags)
                    ? tagRes.tags
                    : Array.isArray(tagRes?.data)
                    ? tagRes.data
                    : [];
                setTrendingTags(normalizedTags);
            } catch {
                setTrendingTags([]);
            }

            if (!user && !hasToken) {
                setStats({ streak: 0, wins: 0, accuracy: 0, totalExams: 0, averageScore: 0 });
                setFriends([]);
                setLoadingStats(false);
                return;
            }

            try {
                const fetchedStats = await userService.getStats();
                setStats(fetchedStats?.data || fetchedStats || { streak: 0, wins: 0, accuracy: 0 });
            } catch (err) {
                console.error('Error fetching stats:', err);
                setStats({ streak: 0, wins: 0, accuracy: 0, badges: 0 });
            } finally {
                setLoadingStats(false);
            }

            try {
                const fetchedFriends = await friendService.getFriends();
                const list = Array.isArray(fetchedFriends)
                    ? fetchedFriends
                    : Array.isArray(fetchedFriends?.data)
                    ? fetchedFriends.data
                    : [];
                setFriends(list);
            } catch (err) {
                console.error('Error fetching friends:', err);
                setFriends([]);
            }
        };

        fetchUserData();
    }, [user]);

    const handleDailyChallenge = () => {
        onBurst?.();
        navigate('/exam');
    };

    const totalExams = stats?.totalExams ?? stats?.wins ?? 0;
    const avgScore = Math.round(Number(stats?.averageScore ?? stats?.accuracy ?? 0));
    const streak = stats?.streak ?? 0;

    return (
        <aside className="hidden lg:block space-y-4" aria-label="สถิติและข้อมูลเพิ่มเติม">
            {/* Daily Exam Quest */}
            <div className="daily">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300/30 to-orange-500/30 border border-amber-300/45 text-[#fde047] flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Zap size={24} strokeWidth={2.3} />
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold text-amber-200 mb-2">
                    <Sparkles size={11} />
                    <span>ภารกิจประจำวัน</span>
                </div>
                <h2 className="font-extrabold text-base text-white leading-snug">
                    ท้าประลองทำข้อสอบวันนี้
                </h2>
                <p className="text-xs text-white/75 mt-1 leading-relaxed">
                    สะสม XP และรักษาสถิติต่อเนื่องพร้อมอัปอันดับในชุมชน
                </p>
                <button
                    type="button"
                    className="play-btn"
                    onClick={handleDailyChallenge}
                >
                    <span>เริ่มฝึกทำข้อสอบ</span>
                    <ArrowRight size={16} />
                </button>
            </div>

            {/* User Mini Stats */}
            <div className="pcard">
                <div className="pc-head">
                    <span className="w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-300/35 text-amber-200 inline-flex items-center justify-center">
                        <Trophy size={14} />
                    </span>
                    <span>สถิติของคุณ</span>
                </div>

                {loadingStats ? (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-14 rounded-2xl bg-white/10" />
                        <div className="grid grid-cols-2 gap-2">
                            <div className="h-14 rounded-xl bg-white/10" />
                            <div className="h-14 rounded-xl bg-white/10" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="streak-box">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400/30 to-rose-500/30 border border-orange-300/40 text-orange-300 flex items-center justify-center flex-shrink-0">
                                <Flame size={22} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-2xl font-black text-amber-300 leading-none">
                                    {streak} วัน
                                </div>
                                <div className="text-xs text-white/75 font-semibold mt-0.5">
                                    สถิติฝึกสอบต่อเนื่อง
                                </div>
                            </div>
                        </div>

                        <div className="mstats">
                            <div className="ms">
                                <div className="ms-n text-emerald-300">{totalExams}</div>
                                <div className="ms-l flex items-center justify-center gap-1">
                                    <Trophy size={11} className="text-emerald-300" />
                                    <span>ชุดข้อสอบ</span>
                                </div>
                            </div>
                            <div className="ms">
                                <div className="ms-n text-sky-300">{avgScore}%</div>
                                <div className="ms-l flex items-center justify-center gap-1">
                                    <Target size={11} className="text-sky-300" />
                                    <span>ความแม่นยำ</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Trending Topics */}
            <div className="pcard">
                <div className="pc-head">
                    <span className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-400/35 text-pink-200 inline-flex items-center justify-center">
                        <TrendingUp size={14} />
                    </span>
                    <span>หัวข้อยอดนิยม</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {(trendingTags.length > 0 ? trendingTags.slice(0, 8) : DEFAULT_TAGS).map((tagItem, idx) => {
                        const tagLabel = typeof tagItem === 'string' ? tagItem : (tagItem?.tag || tagItem?.name || '');
                        if (!tagLabel) return null;
                        return (
                            <span
                                key={`${tagLabel}-${idx}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-white/90"
                            >
                                <Hash size={11} className="text-[#fde047]" />
                                <span>{tagLabel.replace(/^#/, '')}</span>
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* Friends Quick List */}
            <div className="pcard">
                <div className="flex items-center justify-between mb-3">
                    <div className="pc-head !mb-0">
                        <span className="w-6 h-6 rounded-lg bg-teal-400/20 border border-teal-300/35 text-teal-200 inline-flex items-center justify-center">
                            <Users size={14} />
                        </span>
                        <span>เพื่อนติวสอบ</span>
                    </div>
                    <Link
                        to="/profile/friends"
                        className="text-xs font-bold text-[#fde047] hover:text-white inline-flex items-center gap-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00] rounded-md px-1"
                    >
                        <span>ทั้งหมด</span>
                        <ChevronRight size={13} />
                    </Link>
                </div>

                {friends.length === 0 ? (
                    <div className="text-center py-4 px-2 rounded-2xl bg-black/15 border border-white/10">
                        <Users size={22} className="mx-auto text-white/60 mb-1.5" />
                        <p className="text-xs text-white/75">
                            {user ? 'ยังไม่มีรายชื่อเพื่อนในตอนนี้' : 'เข้าสู่ระบบเพื่อเชื่อมต่อกับเพื่อน'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {friends.slice(0, 5).map((friend) => {
                            const name = friend.display_name || friend.username || 'เพื่อน';
                            const avatar = friend.avatar || friend.avatar_url;
                            return (
                                <Link
                                    key={friend.id}
                                    to="/profile/friends"
                                    className="fr focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                                >
                                    <div className="fr-av online overflow-hidden">
                                        {avatar ? (
                                            <img
                                                src={avatar.startsWith('http') || avatar.startsWith('/') ? avatar : `/${avatar}`}
                                                alt={name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span>{name[0]}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="fr-name text-white">{name}</div>
                                        <div className="fr-sub">พร้อมร่วมติวสอบ</div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default CommunityRightBar;
