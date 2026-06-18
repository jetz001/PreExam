import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Flame, Crown, BookOpen, User, Star, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
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
        const newShapes = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
            left: `${Math.random() * 100}vw`,
            size: `${30 + Math.random() * 50}px`,
            delay: `${Math.random() * 10}s`,
            duration: `${15 + Math.random() * 15}s`,
        }));
        setShapes(newShapes);
    }, []);

    const { data: businesses, isLoading } = useQuery({
        queryKey: ['businesses', searchQuery, selectedCategory],
        queryFn: () => businessApi.getAllBusinesses({ search: searchQuery, category: selectedCategory })
    });

    const categoryChips = ['All', 'Education', 'Tutor', 'Book Store', 'Online Course'];
    const trendingTags = ['#กพ67', '#สอบครู', '#คณิตศาสตร์', '#ภาษาอังกฤษ', '#กฎหมาย'];

    return (
        <div className="learning-page pb-20">
            {/* Kahoot-style Background Shapes */}
            {shapes.map(s => (
                <div 
                    key={s.id} 
                    className={`l-shape ${s.type}`} 
                    style={{ 
                        left: s.left, 
                        width: s.type !== 'l-triangle' ? s.size : undefined, 
                        height: s.type !== 'l-triangle' ? s.size : undefined,
                        '--s': s.type === 'l-triangle' ? s.size : undefined,
                        animationDelay: s.delay,
                        animationDuration: s.duration
                    }} 
                />
            ))}

            {/* Header / Search */}
            <div className="relative z-10 pt-6 px-4">
                <div className="max-w-4xl mx-auto space-y-4">
                    <h1 className="l-header-title text-center mb-6">ศูนย์การเรียนรู้ 📚</h1>

                    <div className="l-search-wrap">
                        <Search className="l-search-icon" size={24} />
                        <input
                            type="text"
                            className="l-search-input"
                            placeholder="ค้นหาติวเตอร์, ชีทสรุป, หรือคอร์สเรียน..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2 pt-2 scrollbar-hide justify-center">
                        {trendingTags.map(tag => (
                            <button key={tag} className="l-tag whitespace-nowrap">
                                <Flame size={14} className="text-orange-400" /> {tag}
                            </button>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="l-tabs">
                        <button
                            onClick={() => setActiveTab('discover')}
                            className={`l-tab ${activeTab === 'discover' ? 'active' : ''}`}
                        >
                            Discover
                        </button>
                        <button
                            onClick={() => setActiveTab('following')}
                            className={`l-tab ${activeTab === 'following' ? 'active' : ''}`}
                        >
                            Following
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {activeTab === 'discover' && (
                    <>
                        {/* Categories */}
                        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 justify-center">
                            {categoryChips.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
                                    className={`l-chip whitespace-nowrap ${selectedCategory === (cat === 'All' ? '' : cat) ? 'active' : ''}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Zone B: Highlights (Pinned/Boosted - Mock for now) */}
                        {isLoading ? (
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-[rgba(255,255,255,0.1)] rounded-2xl"></div>)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {businesses?.businesses?.map((biz) => (
                                    <Link key={biz.id} to={`/learning-center/profile/${biz.id}`} className="group relative block rounded-3xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-white/20">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        
                                        {/* Cover Banner */}
                                        <div className="h-32 w-full overflow-hidden relative">
                                            {biz.cover_image ? (
                                                <img src={getImageUrl(biz.cover_image)} alt="Cover" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-tr from-indigo-900 to-purple-800" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
                                        </div>

                                        <div className="px-6 pb-6 relative -mt-10">
                                            <div className="flex justify-between items-end mb-4">
                                                {/* Logo */}
                                                <div className="w-20 h-20 rounded-2xl bg-white/10 p-1 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                                    {biz.logo_image ? (
                                                        <img src={getImageUrl(biz.logo_image)} alt={biz.name} className="w-full h-full object-cover rounded-xl" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white"><User size={32} /></div>
                                                    )}
                                                </div>
                                                
                                                {/* Category Badge */}
                                                <span className="px-4 py-1.5 bg-white/10 text-white text-xs rounded-full font-bold border border-white/10 backdrop-blur-md shadow-sm">
                                                    {biz.category}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-extrabold text-white text-xl truncate group-hover:text-pink-300 transition-colors">{biz.name}</h3>
                                                    {biz.is_verified && <CheckBadge />}
                                                </div>
                                                <p className="text-sm text-gray-300 line-clamp-2 min-h-[2.5rem] leading-relaxed">{biz.tagline || 'No description available.'}</p>

                                                <div className="flex items-center gap-4 mt-6 pt-5 border-t border-white/10 text-sm text-gray-300 font-medium">
                                                    <span className="flex items-center bg-white/5 px-3 py-1.5 rounded-lg"><Star size={16} className="mr-1.5 text-yellow-400 drop-shadow-md" /> {biz.rating_avg ? Number(biz.rating_avg).toFixed(1) : 'New'}</span>
                                                    <span className="flex items-center bg-white/5 px-3 py-1.5 rounded-lg"><User size={16} className="mr-1.5 text-blue-400 drop-shadow-md" /> {biz.stats?.followers || 0} Followers</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {!isLoading && businesses?.businesses?.length === 0 && (
                            <div className="text-center py-20 bg-[rgba(255,255,255,0.05)] rounded-2xl border-2 border-[rgba(255,255,255,0.1)] text-gray-400">
                                No businesses found.
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'following' && (
                    <FollowingFeed />
                )}
            </div>
        </div>
    );
};

const FollowingFeed = () => {
    const { data: feedData, isLoading } = useQuery({
        queryKey: ['followingFeed'],
        queryFn: businessApi.getFollowingFeed
    });

    if (isLoading) return <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-40 bg-[rgba(255,255,255,0.1)] rounded-2xl animate-pulse" />)}</div>;

    if (!feedData?.feed?.length) {
        return (
            <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl transition-all hover:bg-white/10">
                <div className="w-24 h-24 bg-gradient-to-tr from-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User size={48} className="text-pink-300 opacity-80" />
                </div>
                <p className="text-white font-bold text-2xl mb-2 tracking-wide">Your feed is empty</p>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">Follow businesses and creators to see their latest updates, articles, and products here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            {feedData.feed.map(post => (
                <div key={post.id} className="relative group bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <Link to={`/learning-center/profile/${post.business_id}`} className="block w-14 h-14 rounded-2xl bg-white/10 p-0.5 overflow-hidden border border-white/20 shadow-lg group-hover:scale-105 transition-transform">
                                {post.business_logo ? (
                                    <img src={getImageUrl(post.business_logo)} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                        <User className="text-white/80 w-6 h-6" />
                                    </div>
                                )}
                            </Link>
                            <div>
                                <Link to={`/learning-center/profile/${post.business_id}`} className="font-bold text-white text-lg hover:text-pink-300 flex items-center gap-1.5 transition-colors">
                                    {post.business_name || 'Unknown Business'}
                                    {post.is_verified && <CheckBadge />}
                                </Link>
                                <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">{new Date(post.created_at || post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-3 leading-tight">{post.title}</h3>
                        <div className="text-gray-300 text-sm mb-6 line-clamp-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />

                        {post.type === 'product' && (
                            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-xl text-pink-300 text-xs font-bold uppercase tracking-wider">
                                <ShoppingBag size={14} /> Product / Course
                            </div>
                        )}

                        <div className="flex items-center gap-6 border-t border-white/10 pt-5 text-white font-bold text-sm">
                            <button className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors group/btn">
                                <div className="p-2 rounded-full group-hover/btn:bg-pink-400/10 transition-colors"><Star size={18} /></div> Like
                            </button>
                            <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors group/btn">
                                <div className="p-2 rounded-full group-hover/btn:bg-blue-400/10 transition-colors"><MessageCircle size={18} /></div> Comment
                            </button>
                            <Link to={`/learning-center/profile/${post.business_id}`} className="ml-auto bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl transition-all border border-white/10 hover:border-white/30 backdrop-blur-sm flex items-center gap-2">
                                Read More <CornerDownRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};


const CheckBadge = () => (
    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

export default LearningCenter;
