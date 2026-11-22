import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Search,
    Flame,
    BookOpen,
    User,
    Star,
    MessageCircle,
    ShoppingBag,
    CornerDownRight,
    BadgeCheck,
    Sparkles,
    Compass,
    Users,
    X,
    ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import businessApi from '../../services/businessApi';
import { getImageUrl } from '../../utils/imageUtils';
import '../../assets/css/learning.css';

const LearningCenter = () => {
    const [activeTab, setActiveTab] = useState('discover');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const [shapes, setShapes] = useState([]);
    useEffect(() => {
        const shapeTypes = ['l-circle', 'l-square', 'l-triangle'];
        const newShapes = Array.from({ length: 14 }, (_, i) => ({
            id: i,
            type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
            left: `${Math.random() * 100}vw`,
            size: `${28 + Math.random() * 44}px`,
            delay: `${Math.random() * 10}s`,
            duration: `${16 + Math.random() * 14}s`,
        }));
        setShapes(newShapes);
    }, []);

    const { data: businesses, isLoading } = useQuery({
        queryKey: ['businesses', searchQuery, selectedCategory],
        queryFn: () => businessApi.getAllBusinesses({ search: searchQuery, category: selectedCategory }),
    });

    const categoryChips = ['All', 'Education', 'Tutor', 'Book Store', 'Online Course'];
    const trendingTags = ['#กพ67', '#สอบครู', '#คณิตศาสตร์', '#ภาษาอังกฤษ', '#กฎหมาย'];

    const handleTagClick = (tag) => {
        const cleanTag = tag.replace(/^#/, '');
        setSearchQuery((prev) => (prev === cleanTag ? '' : cleanTag));
        if (activeTab !== 'discover') {
            setActiveTab('discover');
        }
    };

    const businessList = businesses?.businesses || [];

    return (
        <div className="learning-page pb-20">
            {/* Ambient Floating Shapes */}
            {shapes.map((s) => (
                <div
                    key={s.id}
                    aria-hidden="true"
                    className={`l-shape ${s.type}`}
                    style={{
                        left: s.left,
                        width: s.type !== 'l-triangle' ? s.size : undefined,
                        height: s.type !== 'l-triangle' ? s.size : undefined,
                        '--s': s.type === 'l-triangle' ? s.size : undefined,
                        animationDelay: s.delay,
                        animationDuration: s.duration,
                    }}
                />
            ))}

            {/* Header / Search */}
            <div className="relative z-10 pt-6 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto space-y-5">
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-amber-200 backdrop-blur-md shadow-sm">
                            <Sparkles size={14} className="text-amber-300" />
                            <span>PreExam Learning Ecosystem</span>
                        </div>

                        <div className="flex items-center justify-center gap-3.5">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 p-[1px] shadow-[0_10px_28px_rgba(245,158,11,0.38)] shrink-0">
                                <div className="w-full h-full rounded-[15px] bg-slate-950/35 backdrop-blur-md flex items-center justify-center text-amber-200">
                                    <BookOpen size={26} strokeWidth={2.3} />
                                </div>
                            </div>
                            <h1 className="l-header-title text-left sm:text-center">ศูนย์การเรียนรู้</h1>
                        </div>

                        <p className="text-sm sm:text-base text-slate-200/90 max-w-xl mx-auto font-medium leading-relaxed">
                            ค้นพบติวเตอร์คุณภาพ ชีทสรุป และคอร์สเตรียมสอบจากผู้เชี่ยวชาญทั่วประเทศ
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        <div className="l-search-wrap">
                            <Search className="l-search-icon" size={20} aria-hidden="true" />
                            <input
                                type="text"
                                aria-label="ค้นหาติวเตอร์ ชีทสรุป หรือคอร์สเรียน"
                                className="l-search-input focus-visible:ring-2 focus-visible:ring-indigo-500"
                                placeholder="ค้นหาติวเตอร์, ชีทสรุป, หรือคอร์สเรียน..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    aria-label="ล้างคำค้นหา"
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-slate-200 hover:text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2.5 pt-1 justify-center">
                            {trendingTags.map((tag) => {
                                const cleanTag = tag.replace(/^#/, '');
                                const isActive = searchQuery === cleanTag;
                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleTagClick(tag)}
                                        className={`l-tag whitespace-nowrap focus-visible:ring-2 focus-visible:ring-indigo-500 ${isActive ? 'active' : ''}`}
                                    >
                                        <Flame size={14} className="text-amber-400 shrink-0" />
                                        <span>{tag}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tabs */}
                        <div className="l-tabs" role="tablist" aria-label="มุมมองศูนย์การเรียนรู้">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeTab === 'discover'}
                                onClick={() => setActiveTab('discover')}
                                className={`l-tab focus-visible:ring-2 focus-visible:ring-indigo-500 ${activeTab === 'discover' ? 'active' : ''}`}
                            >
                                <Compass size={18} />
                                <span>Discover</span>
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeTab === 'following'}
                                onClick={() => setActiveTab('following')}
                                className={`l-tab focus-visible:ring-2 focus-visible:ring-indigo-500 ${activeTab === 'following' ? 'active' : ''}`}
                            >
                                <Users size={18} />
                                <span>Following</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="learning-page-container py-8">
                {activeTab === 'discover' && (
                    <>
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2.5 mb-8 justify-center">
                            {categoryChips.map((cat) => {
                                const value = cat === 'All' ? '' : cat;
                                const isActive = selectedCategory === value;
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setSelectedCategory(value)}
                                        className={`l-chip whitespace-nowrap focus-visible:ring-2 focus-visible:ring-indigo-500 ${isActive ? 'active' : ''}`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Business Grid */}
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div
                                        key={i}
                                        className="h-80 rounded-3xl bg-white/10 border border-white/15 backdrop-blur-md animate-pulse overflow-hidden"
                                    >
                                        <div className="h-32 bg-white/10" />
                                        <div className="p-6 space-y-3">
                                            <div className="w-16 h-16 -mt-12 rounded-2xl bg-white/15 border border-white/20" />
                                            <div className="h-5 w-2/3 rounded-lg bg-white/15" />
                                            <div className="h-4 w-full rounded-lg bg-white/10" />
                                            <div className="h-4 w-4/5 rounded-lg bg-white/10" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : businessList.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {businessList.map((biz) => (
                                    <Link
                                        key={biz.id}
                                        to={`/learning-center/profile/${biz.id}`}
                                        className="group relative flex flex-col rounded-3xl bg-white/10 border border-white/18 overflow-hidden backdrop-blur-xl shadow-[0_18px_42px_-12px_rgba(8,3,28,0.5)] transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.13] hover:border-indigo-300/45 hover:shadow-[0_24px_54px_-12px_rgba(79,70,229,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                        {/* Cover Banner */}
                                        <div className="h-32 w-full overflow-hidden relative shrink-0">
                                            {biz.cover_image ? (
                                                <img
                                                    src={getImageUrl(biz.cover_image)}
                                                    alt={biz.name || 'Cover'}
                                                    className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-tr from-indigo-700 via-purple-700 to-fuchsia-600" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                                            <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/55 border border-white/15 text-[11px] font-bold text-slate-100 backdrop-blur-md">
                                                <ArrowUpRight size={12} className="text-amber-300" />
                                                <span>ดูโปรไฟล์</span>
                                            </span>
                                        </div>

                                        <div className="px-5 sm:px-6 pb-6 relative -mt-10 flex-1 flex flex-col">
                                            <div className="flex justify-between items-end gap-3 mb-4">
                                                {/* Logo */}
                                                <div className="w-20 h-20 rounded-2xl bg-slate-900/80 p-1 backdrop-blur-md border border-white/25 shadow-xl overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
                                                    {biz.logo_image ? (
                                                        <img
                                                            src={getImageUrl(biz.logo_image)}
                                                            alt={biz.name}
                                                            className="w-full h-full object-cover rounded-xl"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                                                            <User size={30} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Category Badge */}
                                                <span className="px-3.5 py-1 bg-white/12 text-amber-200 text-xs rounded-full font-bold border border-white/20 backdrop-blur-md shadow-sm truncate max-w-[140px]">
                                                    {biz.category || 'Education'}
                                                </span>
                                            </div>

                                            <div className="space-y-2 flex-1 flex flex-col">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <h3 className="font-extrabold text-white text-lg sm:text-xl truncate group-hover:text-amber-200 transition-colors">
                                                        {biz.name}
                                                    </h3>
                                                    {biz.is_verified && <CheckBadge />}
                                                </div>
                                                <p className="text-sm text-slate-200/90 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                                                    {biz.tagline || 'ยังไม่มีคำแนะนำตัว'}
                                                </p>

                                                <div className="flex flex-wrap items-center gap-2.5 mt-auto pt-4 border-t border-white/12 text-xs sm:text-sm text-slate-100 font-semibold">
                                                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/12 px-3 py-1.5 rounded-xl">
                                                        <Star size={15} className="text-amber-400 fill-amber-400/80 shrink-0" />
                                                        <span>{biz.rating_avg ? Number(biz.rating_avg).toFixed(1) : 'New'}</span>
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/12 px-3 py-1.5 rounded-xl">
                                                        <Users size={15} className="text-sky-300 shrink-0" />
                                                        <span>{biz.stats?.followers || 0} Followers</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/18 shadow-2xl max-w-xl mx-auto">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/20 flex items-center justify-center mx-auto mb-4 text-amber-300 shadow-lg">
                                    <Search size={30} />
                                </div>
                                <h2 className="text-xl font-extrabold text-white mb-2">ไม่พบเพจหรือสถาบันที่ค้นหา</h2>
                                <p className="text-sm text-slate-200/85 mb-6">
                                    ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่นเพื่อค้นพบติวเตอร์และคอร์สเรียนเพิ่มเติม
                                </p>
                                {(searchQuery || selectedCategory) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCategory('');
                                        }}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    >
                                        ล้างตัวกรองทั้งหมด
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'following' && (
                    <FollowingFeed onExplore={() => setActiveTab('discover')} />
                )}
            </div>
        </div>
    );
};

const FollowingFeed = ({ onExplore }) => {
    const { data: feedData, isLoading } = useQuery({
        queryKey: ['followingFeed'],
        queryFn: businessApi.getFollowingFeed,
    });

    if (isLoading) {
        return (
            <div className="space-y-5 max-w-3xl mx-auto">
                {[1, 2].map((i) => (
                    <div key={i} className="h-48 bg-white/10 border border-white/15 rounded-3xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (!feedData?.feed?.length) {
        return (
            <div className="text-center py-16 px-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/18 shadow-2xl max-w-xl mx-auto">
                <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500/35 via-purple-500/35 to-pink-500/35 border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                    <Users size={38} className="text-amber-300" />
                </div>
                <p className="text-white font-extrabold text-2xl mb-2 tracking-wide">ฟีดติดตามของคุณยังว่างอยู่</p>
                <p className="text-slate-200/85 text-sm max-w-sm mx-auto leading-relaxed mb-6">
                    กดติดตามติวเตอร์และสถาบันที่คุณสนใจ เพื่ออัปเดตบทความ สรุปความรู้ และคอร์สใหม่ๆ ได้ที่นี่
                </p>
                <button
                    type="button"
                    onClick={onExplore}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-extrabold text-sm shadow-lg transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    <Compass size={18} />
                    <span>ไปสำรวจ Discover</span>
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {feedData.feed.map((post) => (
                <article
                    key={post.id}
                    className="l-post relative group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3.5 sm:gap-4 mb-5">
                            <Link
                                to={`/learning-center/profile/${post.business_id}`}
                                className="block w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 p-0.5 overflow-hidden border border-white/25 shadow-lg shrink-0 group-hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                {post.business_logo ? (
                                    <img
                                        src={getImageUrl(post.business_logo)}
                                        alt={post.business_name || 'Logo'}
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                        <User className="text-white w-6 h-6" />
                                    </div>
                                )}
                            </Link>
                            <div className="min-w-0">
                                <Link
                                    to={`/learning-center/profile/${post.business_id}`}
                                    className="font-bold text-white text-base sm:text-lg hover:text-amber-200 flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
                                >
                                    <span className="truncate">{post.business_name || 'Unknown Business'}</span>
                                    {post.is_verified && <CheckBadge />}
                                </Link>
                                <span className="text-xs text-slate-300 font-medium tracking-wide uppercase">
                                    {new Date(post.created_at || post.createdAt).toLocaleDateString('th-TH', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-3 leading-snug break-words">
                            {post.title}
                        </h3>
                        <div
                            className="text-slate-200 text-sm mb-5 line-clamp-3 leading-relaxed break-words"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content || '') }}
                        />

                        {post.type === 'product' && (
                            <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/35 rounded-xl text-pink-200 text-xs font-bold uppercase tracking-wider">
                                <ShoppingBag size={14} /> Product / Course
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 sm:gap-5 border-t border-white/12 pt-4 text-slate-200 font-bold text-sm">
                            <Link
                                to={`/learning-center/profile/${post.business_id}`}
                                className="inline-flex items-center gap-2 text-slate-200 hover:text-pink-300 transition-colors rounded-xl px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <Star size={17} className="text-amber-300" />
                                <span>ดูบทความ & รีวิว</span>
                            </Link>
                            <Link
                                to={`/learning-center/profile/${post.business_id}`}
                                className="inline-flex items-center gap-2 text-slate-200 hover:text-sky-300 transition-colors rounded-xl px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <MessageCircle size={17} className="text-sky-300" />
                                <span>พูดคุยกับเพจ</span>
                            </Link>
                            <Link
                                to={`/learning-center/profile/${post.business_id}`}
                                className="ml-auto bg-white/12 hover:bg-white/22 text-white px-4 sm:px-5 py-2.5 rounded-xl transition-all border border-white/18 hover:border-white/35 backdrop-blur-sm inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <span>อ่านเพิ่มเติม</span>
                                <CornerDownRight size={16} />
                            </Link>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
};

const CheckBadge = () => (
    <BadgeCheck
        size={18}
        className="text-sky-400 shrink-0 drop-shadow-[0_0_6px_rgba(56,189,248,0.45)]"
        aria-label="ยืนยันตัวตนแล้ว"
    />
);

export default LearningCenter;
