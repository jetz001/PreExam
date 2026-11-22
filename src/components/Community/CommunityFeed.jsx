import React, { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import {
    MessageCircle,
    Heart,
    Share2,
    MoreVertical,
    Store,
    Layers,
    MessageSquare,
    Newspaper,
    HelpCircle,
    Gamepad2,
    Flame,
    UserPlus,
    X,
    BarChart2,
    Sparkles,
    AlertCircle,
    Inbox,
    Video,
} from 'lucide-react';
import toast from 'react-hot-toast';
import communityService from '../../services/communityService';
import friendService from '../../services/friendService';
import { useAuth } from '../../context/AuthContext';

const CATEGORY_CONFIG = {
    all: { label: 'ทั้งหมด', Icon: Layers, color: '#ffcc00' },
    general: { label: 'พูดคุยทั่วไป', Icon: MessageSquare, color: '#60a5fa' },
    exam_news: { label: 'ข่าวการสอบ', Icon: Newspaper, color: '#f472b6' },
    qa_help: { label: 'ถาม-ตอบ', Icon: HelpCircle, color: '#fbbf24' },
    relax: { label: 'พักผ่อน/รีวิว', Icon: Gamepad2, color: '#34d399' },
    hot: { label: 'Hot', Icon: Flame, color: '#fb7185' },
};

const BACKGROUND_STYLE_MAP = {
    c1: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 52%, #6366f1 100%)',
    c2: 'linear-gradient(135deg, #ef4444 0%, #f97316 55%, #eab308 100%)',
    c3: 'linear-gradient(135deg, #38bdf8 0%, #06b6d4 55%, #14b8a6 100%)',
    c4: 'linear-gradient(135deg, #4ade80 0%, #10b981 100%)',
    c5: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
};

const PLAYFUL_COLORS = [
    'linear-gradient(135deg, rgba(75, 29, 82, 0.85) 0%, rgba(125, 38, 74, 0.85) 100%)',
    'linear-gradient(135deg, rgba(27, 56, 107, 0.85) 0%, rgba(30, 92, 112, 0.85) 100%)',
    'linear-gradient(135deg, rgba(28, 77, 68, 0.85) 0%, rgba(32, 109, 72, 0.85) 100%)',
    'linear-gradient(135deg, rgba(63, 34, 117, 0.85) 0%, rgba(90, 46, 157, 0.85) 100%)',
    'linear-gradient(135deg, rgba(92, 32, 107, 0.85) 0%, rgba(41, 56, 122, 0.85) 100%)',
];

const CommunityFeed = ({ onThreadSelect, onBurst }) => {
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const { user } = useAuth();

    const { ref, inView } = useInView();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        isLoading,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['threads', categoryFilter],
        queryFn: ({ pageParam = null }) => communityService.getThreads({ pageParam, category: categoryFilter }),
        getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
        staleTime: 60000,
    });

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    useEffect(() => {
        const handleCloseDropdown = () => setActiveDropdown(null);
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setActiveDropdown(null);
        };
        document.addEventListener('click', handleCloseDropdown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('click', handleCloseDropdown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const isVideo = (url) => Boolean(url && (url.endsWith('.mp4') || url.endsWith('.webm')));

    const handleAddFriend = async (e, friendId) => {
        e.stopPropagation();
        setActiveDropdown(null);
        try {
            await friendService.sendRequest(friendId);
            toast.success('ส่งคำขอเป็นเพื่อนเรียบร้อยแล้ว');
        } catch (err) {
            console.error(err);
            toast.error('ไม่สามารถส่งคำขอได้ หรือส่งคำขอไปแล้ว');
        }
    };

    const handleSharePost = (e, postId) => {
        e.stopPropagation();
        const shareUrl = `${window.location.origin}/community?threadId=${postId}`;
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(shareUrl)
                .then(() => toast.success('คัดลอกลิงก์โพสต์เรียบร้อยแล้ว'))
                .catch(() => toast.error('ไม่สามารถคัดลอกลิงก์ได้'));
        }
    };

    const renderPost = (post) => {
        const catMeta = CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG.general;
        const CatIcon = catMeta.Icon;
        const catColor = catMeta.color;
        const colorIndex = post.id ? String(post.id).charCodeAt(0) % PLAYFUL_COLORS.length : 0;
        const postBg = PLAYFUL_COLORS[colorIndex];
        const pollObj = post.Poll || post.poll;
        const authorName = post.User?.display_name || 'ผู้ใช้งาน';
        const authorInitial = authorName[0] || 'U';
        const bgGradient = BACKGROUND_STYLE_MAP[post.background_style] || 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)';

        return (
            <article
                className="post focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                key={post.id}
                onClick={() => onThreadSelect && onThreadSelect(post)}
                style={{ background: postBg }}
            >
                <div className="post-accent" style={{ background: catColor }} />

                <div className="post-top">
                    <div className="post-av">
                        {post.User?.avatar ? (
                            <img
                                src={getImageUrl(post.User.avatar)}
                                alt={authorName}
                                className="w-full h-full rounded-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            <span style={{ color: catColor }}>{authorInitial}</span>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="post-nm flex items-center gap-1.5 flex-wrap">
                            <span className="truncate">{authorName}</span>
                            {post.User?.MyBusiness && (
                                <span
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-400/20 border border-indigo-300/35 text-indigo-200 text-[10px] font-bold"
                                    title="ร้านค้า / สถาบัน"
                                >
                                    <Store size={11} />
                                    <span>สถาบัน</span>
                                </span>
                            )}
                        </div>
                        <div className="post-tm">
                            {post.created_at && !isNaN(new Date(post.created_at).getTime())
                                ? new Date(post.created_at).toLocaleString('th-TH', {
                                      dateStyle: 'medium',
                                      timeStyle: 'short',
                                  })
                                : 'เมื่อสักครู่'}
                        </div>
                    </div>
                    <div className="relative flex-shrink-0">
                        <button
                            type="button"
                            className="post-more focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                            aria-label="ตัวเลือกเพิ่มเติม"
                            aria-expanded={activeDropdown === post.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(activeDropdown === post.id ? null : post.id);
                            }}
                        >
                            <MoreVertical size={17} />
                        </button>
                        {activeDropdown === post.id && (
                            <div
                                className="absolute right-0 top-9 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden min-w-[168px] py-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {user && user.id !== post.user_id && (
                                    <button
                                        type="button"
                                        className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm font-semibold text-white flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:bg-white/15"
                                        onClick={(e) => handleAddFriend(e, post.user_id)}
                                    >
                                        <UserPlus size={15} className="text-emerald-300" />
                                        <span>เพิ่มเพื่อน</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm font-semibold text-white/75 flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:bg-white/15"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveDropdown(null);
                                    }}
                                >
                                    <X size={15} />
                                    <span>ปิดเมนู</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <h2 className="post-ttl">{post.title}</h2>

                <div
                    className="tag-pill"
                    style={{
                        background: `${catColor}26`,
                        color: catColor,
                        borderColor: `${catColor}55`,
                    }}
                >
                    <CatIcon size={12} />
                    <span>{catMeta.label || post.category}</span>
                </div>

                {post.content && !pollObj && !post.background_style && (
                    <div className="text-sm text-white/90 mb-3 whitespace-pre-line break-words line-clamp-4 leading-relaxed">
                        {post.content}
                    </div>
                )}

                {post.background_style && (
                    <div
                        className="p-6 rounded-2xl min-h-[140px] flex items-center justify-center text-center shadow-inner mb-3 border border-white/20"
                        style={{ background: bgGradient }}
                    >
                        <p className="text-white text-lg font-extrabold whitespace-pre-line break-words drop-shadow">
                            {post.content}
                        </p>
                    </div>
                )}

                {post.image_url && !isVideo(post.image_url) && (
                    <div className="rounded-2xl overflow-hidden bg-black/40 border border-white/15 max-h-[320px] flex items-center justify-center mb-3">
                        <img
                            src={getImageUrl(post.image_url)}
                            alt={post.title}
                            className="w-full h-full object-cover max-h-[320px]"
                            loading="lazy"
                            onError={(e) => {
                                e.currentTarget.parentElement.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {post.image_url && isVideo(post.image_url) && (
                    <div
                        className="rounded-2xl overflow-hidden bg-black/50 border border-white/15 max-h-[320px] mb-3 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <video
                            src={getImageUrl(post.image_url)}
                            controls
                            preload="metadata"
                            className="w-full max-h-[320px] object-contain"
                        />
                        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-[11px] font-bold text-white border border-white/15 pointer-events-none">
                            <Video size={12} />
                            <span>วิดีโอ</span>
                        </span>
                    </div>
                )}

                {post.SharedNews && (
                    <div className="mb-3 p-3 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-pink-500/25 border border-pink-300/35 text-pink-200 flex items-center justify-center flex-shrink-0">
                            <Newspaper size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-bold text-amber-300">ข่าวสารที่แชร์</div>
                            <div className="text-xs font-bold text-white truncate">{post.SharedNews.title}</div>
                        </div>
                    </div>
                )}

                {pollObj && (
                    <div className="qcard" onClick={(e) => e.stopPropagation()}>
                        <div className="qcard-q">
                            <span className="w-7 h-7 rounded-lg bg-emerald-400/20 border border-emerald-300/35 text-emerald-300 inline-flex items-center justify-center flex-shrink-0">
                                <BarChart2 size={15} />
                            </span>
                            <span className="break-words">{pollObj.question || 'โพลความคิดเห็น'}</span>
                        </div>
                        <div className="qgrid">
                            {pollObj.Options?.map((opt, i) => (
                                <div key={opt.id || i} className="qopt">
                                    <div className="qletter">{String.fromCharCode(65 + i)}</div>
                                    <div className="flex-1 min-w-0 break-words text-white/95">
                                        {opt.option_text || opt.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="post-foot">
                    <button
                        type="button"
                        className="pfb"
                        aria-label={`ถูกใจโพสต์ ${post.title}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onBurst && onBurst();
                        }}
                    >
                        <Heart size={15} className="text-rose-300" />
                        <span>{post.Likes?.length ?? post.likes ?? 0}</span>
                    </button>
                    <button
                        type="button"
                        className="pfb"
                        aria-label={`ความคิดเห็น ${post.reply_count || 0} รายการ`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onThreadSelect && onThreadSelect(post);
                        }}
                    >
                        <MessageCircle size={15} className="text-sky-300" />
                        <span>{post.reply_count || 0}</span>
                    </button>
                    <button
                        type="button"
                        className="pfb"
                        aria-label="แชร์โพสต์"
                        onClick={(e) => handleSharePost(e, post.id)}
                    >
                        <Share2 size={15} className="text-emerald-300" />
                        <span className="hidden sm:inline text-xs">แชร์</span>
                    </button>

                    <div className="xp-tag">
                        <Sparkles size={11} />
                        <span>+15 XP</span>
                    </div>
                </div>
            </article>
        );
    };

    const allThreads = data?.pages?.flatMap((page) => page.threads || []) || [];

    return (
        <div className="feed-col">
            {/* Filter Bar */}
            <div className="filter-bar" role="tablist" aria-label="หมวดหมู่กระทู้">
                {Object.entries(CATEGORY_CONFIG).map(([cat, { label, Icon }]) => (
                    <button
                        key={cat}
                        type="button"
                        role="tab"
                        aria-selected={categoryFilter === cat}
                        className={`ft ${categoryFilter === cat ? 'on' : ''}`}
                        onClick={() => setCategoryFilter(cat)}
                    >
                        <Icon size={14} />
                        <span>{label}</span>
                    </button>
                ))}
            </div>

            {/* Posts */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((idx) => (
                        <div
                            key={idx}
                            className="pcard animate-pulse space-y-3"
                            aria-hidden="true"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/15" />
                                <div className="space-y-1.5 flex-1">
                                    <div className="h-3.5 bg-white/15 rounded w-1/3" />
                                    <div className="h-2.5 bg-white/10 rounded w-1/4" />
                                </div>
                            </div>
                            <div className="h-4 bg-white/15 rounded w-3/4" />
                            <div className="h-20 bg-white/10 rounded-2xl w-full" />
                        </div>
                    ))}
                </div>
            ) : status === 'error' ? (
                <div className="pcard text-center py-10">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/35 text-rose-200 flex items-center justify-center mx-auto mb-3">
                        <AlertCircle size={24} />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">ไม่สามารถโหลดโพสต์ได้</h3>
                    <p className="text-xs text-white/75 mb-4">กรุณาลองใหม่อีกครั้ง</p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                    >
                        ลองใหม่
                    </button>
                </div>
            ) : allThreads.length === 0 ? (
                <div className="pcard text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-[#fde047] flex items-center justify-center mx-auto mb-3">
                        <Inbox size={26} />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">ยังไม่มีกระทู้ในหมวดนี้</h3>
                    <p className="text-xs text-white/75">เริ่มต้นตั้งคำถามหรือแชร์ความรู้เป็นคนแรกได้เลย</p>
                </div>
            ) : (
                <>
                    {data?.pages.map((page, i) => (
                        <React.Fragment key={i}>
                            {page.threads?.map((post) => renderPost(post))}
                        </React.Fragment>
                    ))}

                    <div ref={ref} className="py-5 text-center text-white/70 text-xs font-semibold">
                        {isFetchingNextPage
                            ? 'กำลังโหลดโพสต์เพิ่มเติม...'
                            : hasNextPage
                            ? 'เลื่อนลงเพื่อโหลดเพิ่มเติม'
                            : 'แสดงโพสต์ทั้งหมดแล้ว'}
                    </div>
                </>
            )}
        </div>
    );
};

export default CommunityFeed;
