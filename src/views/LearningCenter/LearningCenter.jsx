import React, { useState } from 'react';
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {businesses?.businesses?.map((biz) => (
                                    <Link key={biz.id} to={`/learning-center/profile/${biz.id}`} className="l-card group block">
                                        {/* Cover Banner */}
                                        <div className="l-card-cover">
                                            {biz.cover_image && (
                                                <img src={getImageUrl(biz.cover_image)} alt="Cover" className="w-full h-full object-cover opacity-80" />
                                            )}
                                        </div>

                                        <div className="px-5 pb-5 relative">
                                            <div className="flex justify-between items-start">
                                                {/* Logo (Overlapping) */}
                                                <div className="l-card-logo-wrap">
                                                    {biz.logo_image ? (
                                                        <img src={getImageUrl(biz.logo_image)} alt={biz.name} className="l-card-logo" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"><User size={32} /></div>
                                                    )}
                                                </div>

                                                {/* Category Badge */}
                                                <span className="mt-4 px-3 py-1 bg-[rgba(255,255,255,0.1)] text-white text-xs rounded-full font-bold border border-[rgba(255,255,255,0.2)]">
                                                    {biz.category}
                                                </span>
                                            </div>

                                            <div className="mt-1">
                                                <div className="flex items-center gap-1">
                                                    <h3 className="font-bold text-white truncate text-xl group-hover:text-yellow-300 transition-colors">{biz.name}</h3>
                                                    {biz.is_verified && <CheckBadge />}
                                                </div>
                                                <p className="text-sm text-gray-300 mt-2 line-clamp-2 min-h-[2.5rem]">{biz.tagline || 'No tagline'}</p>

                                                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[rgba(255,255,255,0.1)] text-sm text-gray-200 font-bold">
                                                    <span className="flex items-center"><Star size={16} className="mr-1 text-yellow-400" /> {biz.rating_avg ? Number(biz.rating_avg).toFixed(1) : 'New'}</span>
                                                    <span>•</span>
                                                    <span>{biz.stats?.followers || 0} Followers</span>
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

    if (!feedData?.posts?.length) {
        return (
            <div className="text-center py-20 bg-[rgba(255,255,255,0.05)] rounded-2xl border-2 border-[rgba(255,255,255,0.1)] text-gray-400">
                <User size={48} className="mx-auto mb-4 opacity-40 text-yellow-400" />
                <p className="text-white font-bold text-lg mb-1">Your feed is empty.</p>
                <p className="text-sm">Follow businesses to see their latest updates here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {feedData.posts.map(post => (
                <div key={post.id} className="l-post">
                    <div className="flex items-center gap-4 mb-4">
                        <Link to={`/learning-center/profile/${post.business_id}`} className="block w-12 h-12 rounded-xl bg-white p-1 overflow-hidden border-2 border-[rgba(255,255,255,0.3)] shadow-sm">
                            {post.Business?.logo_image ? (
                                <img src={getImageUrl(post.Business.logo_image)} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <User className="w-full h-full text-gray-400 p-1" />
                            )}
                        </Link>
                        <div>
                            <Link to={`/learning-center/profile/${post.business_id}`} className="font-bold text-white text-lg hover:text-yellow-300 flex items-center gap-1 transition-colors">
                                {post.Business?.name || 'Unknown Business'}
                                {post.Business?.is_verified && <CheckBadge />}
                            </Link>
                            <span className="text-xs text-gray-300 font-medium">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                    <div className="text-gray-200 text-sm mb-4 line-clamp-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />

                    {post.type === 'product' && (
                        <div className="mt-3 mb-5">
                            <span className="l-post-badge">
                                🌟 Product / Course
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-6 border-t border-[rgba(255,255,255,0.1)] pt-4 mt-2 text-white font-bold text-sm">
                        <button className="flex items-center gap-2 hover:text-pink-400 transition-colors"><Star size={20} /> Like</button>
                        <button className="flex items-center gap-2 hover:text-blue-400 transition-colors"><MessageCircle size={20} /> Comment</button>
                        <Link to={`/learning-center/profile/${post.business_id}`} className="ml-auto bg-yellow-400 text-purple-900 px-4 py-2 rounded-full hover:bg-yellow-300 transition-colors">
                            Read More
                        </Link>
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
