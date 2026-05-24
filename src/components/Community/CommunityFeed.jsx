import React, { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { MessageCircle, Heart, Share2, MoreVertical, Store } from 'lucide-react';
import communityService from '../../services/communityService';

const CATEGORY_MAP = {
    all: 'ทั้งหมด',
    general: '💬 พูดคุยทั่วไป',
    exam_news: '📰 ข่าวการสอบ',
    qa_help: '❓ ถาม-ตอบ',
    relax: '🎮 พักผ่อน/รีวิว',
    hot: '🔥 Hot'
};

const CATEGORY_COLORS = {
    general: '#4361ee',
    exam_news: '#f72585',
    qa_help: '#fb8500',
    relax: '#06d6a0',
    hot: '#ffcc00'
};

const PLAYFUL_COLORS = [
    'linear-gradient(135deg, #ff0055 0%, #ff7b00 100%)', // Orange/Red
    'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', // Blue
    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', // Green
    'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', // Purple
    'linear-gradient(135deg, #fc00ff 0%, #00dbde 100%)', // Pink/Cyan
];

const CommunityFeed = ({ onThreadSelect, onBurst }) => {
    const [categoryFilter, setCategoryFilter] = useState('all');

    const { ref, inView } = useInView();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        isLoading
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

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const renderPost = (post) => {
        const catColor = CATEGORY_COLORS[post.category] || '#4361ee';
        const colorIndex = post.id ? String(post.id).charCodeAt(0) % PLAYFUL_COLORS.length : 0;
        const postBg = PLAYFUL_COLORS[colorIndex];
        
        return (
            <div className="post border-4 border-white/20 shadow-lg" key={post.id} onClick={() => onThreadSelect && onThreadSelect(post)} style={{ background: postBg }}>
                <div className="post-accent" style={{ background: catColor }}></div>
                
                <div className="post-top">
                    <div className="post-av">
                        {post.User?.avatar ? (
                            <img src={getImageUrl(post.User.avatar)} alt={post.User.display_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span style={{color: catColor}}>{post.User?.display_name ? post.User.display_name[0] : 'U'}</span>
                        )}
                    </div>
                    <div>
                        <div className="post-nm flex items-center gap-1">
                            {post.User?.display_name || 'Unknown User'}
                            {post.User?.MyBusiness && (
                                <Store size={12} className="text-indigo-400" title="Store" />
                            )}
                        </div>
                        <div className="post-tm">{new Date(post.created_at).toLocaleString('th-TH')}</div>
                    </div>
                    <div className="post-more" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical size={16} />
                    </div>
                </div>

                <div className="post-ttl">
                    {post.title}
                </div>

                <div className="tag-pill" style={{ background: `${catColor}20`, color: catColor }}>
                    {CATEGORY_MAP[post.category] || post.category}
                </div>

                {post.content && !post.Poll && !post.background_style && (
                    <div className="text-sm text-white/90 mb-3 whitespace-pre-line line-clamp-4">
                        {post.content}
                    </div>
                )}
                
                {post.background_style && (
                     <div className={`p-6 rounded-xl min-h-[150px] flex items-center justify-center text-center shadow-inner mb-3`} style={{background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)'}}>
                         <p className="text-white text-lg font-bold whitespace-pre-line break-words">{post.content}</p>
                     </div>
                )}

                {post.image_url && !post.image_url.endsWith('.mp4') && (
                    <div className="rounded-xl overflow-hidden bg-black max-h-[300px] flex items-center justify-center mb-3">
                        <img src={getImageUrl(post.image_url)} alt={post.title} className="w-full h-full object-cover max-h-[300px]" />
                    </div>
                )}

                {(post.Poll || post.poll) && (
                    <div className="qcard" style={{ background: 'rgba(255,255,255,0.03)' }} onClick={(e) => e.stopPropagation()}>
                        <div className="qcard-q">📊 {(post.Poll || post.poll).question || "Poll / Question"}</div>
                        <div className="qgrid">
                            {(post.Poll || post.poll).Options?.map((opt, i) => (
                                <div key={opt.id || i} className="qopt">
                                    <div className="qletter">{String.fromCharCode(65 + i)}</div>
                                    <div className="flex-1">{opt.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="post-foot">
                    <button className="pfb" onClick={(e) => { e.stopPropagation(); onBurst && onBurst(); }}>
                        <Heart size={14} /> <span>{post.Likes?.length || 0}</span>
                    </button>
                    <button className="pfb">
                        <MessageCircle size={14} /> <span>{post.reply_count || 0}</span>
                    </button>
                    <button className="pfb">
                        <Share2 size={14} />
                    </button>
                    
                    <div className="xp-tag">+15 XP</div>
                </div>
            </div>
        );
    };

    return (
        <div className="feed-col">
            {/* filters */}
            <div className="filter-bar">
                {Object.keys(CATEGORY_MAP).map((cat) => (
                    <span 
                        key={cat}
                        className={`ft ${categoryFilter === cat ? 'on' : ''}`} 
                        onClick={() => setCategoryFilter(cat)}
                    >
                        {CATEGORY_MAP[cat]}
                    </span>
                ))}
            </div>

            {/* Posts */}
            {isLoading ? (
                <div className="text-center py-10 text-gray-400">Loading posts...</div>
            ) : status === 'error' ? (
                <div className="text-center py-10 text-red-400">Error loading posts.</div>
            ) : (
                <>
                    {data?.pages.map((page, i) => (
                        <React.Fragment key={i}>
                            {page.threads?.map((post) => renderPost(post))}
                        </React.Fragment>
                    ))}
                    
                    <div ref={ref} className="py-4 text-center text-gray-500 text-sm">
                        {isFetchingNextPage
                            ? 'Loading more...'
                            : hasNextPage
                            ? 'Scroll to load more'
                            : 'No more posts'}
                    </div>
                </>
            )}
        </div>
    );
};

export default CommunityFeed;
