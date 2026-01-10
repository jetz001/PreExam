import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Flame, Crown, BookOpen, User, Star, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import businessApi from '../../services/businessApi';
import { getImageUrl } from '../../utils/imageUtils';

const LearningCenter = () => {
    const [activeTab, setActiveTab] = useState('discover');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const { data: businesses, isLoading } = useQuery({
        queryKey: ['businesses', searchQuery, selectedCategory],
        queryFn: () => businessApi.getAllBusinesses({ search: searchQuery, category: selectedCategory })
    });

    const categoryChips = ['All', 'Education', 'Tutor', 'Book Store', 'Online Course'];
    const trendingTags = ['#กพ67', '#สอบครู', '#คณิตศาสตร์', '#ภาษาอังกฤษ', '#กฎหมาย'];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Search */}
            <div className="bg-white sticky top-16 z-10 shadow-sm border-b pb-4 pt-6 px-4">
                <div className="max-w-4xl mx-auto space-y-4">
                    <h1 className="text-2xl font-bold text-gray-800">ศูนย์การเรียนรู้ 📚</h1>

                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                            placeholder="Find tutors, sheets, or courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {trendingTags.map(tag => (
                            <button key={tag} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-medium whitespace-nowrap flex items-center hover:bg-orange-100">
                                <Flame size={12} className="mr-1" /> {tag}
                            </button>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('discover')}
                            className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition-colors ${activeTab === 'discover' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
                        >
                            Discover
                        </button>
                        <button
                            onClick={() => setActiveTab('following')}
                            className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition-colors ${activeTab === 'following' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
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
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                            {categoryChips.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
                                    className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${selectedCategory === (cat === 'All' ? '' : cat)
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Zone B: Highlights (Pinned/Boosted - Mock for now) */}
                        {isLoading ? (
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {businesses?.businesses?.map((biz) => (
                                    <Link key={biz.id} to={`/learning-center/profile/${biz.id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group">
                                        {/* Cover Banner */}
                                        <div className="h-24 bg-gray-100 relative">
                                            {biz.cover_image ? (
                                                <img src={getImageUrl(biz.cover_image)} alt="Cover" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-r from-blue-50 to-indigo-50" />
                                            )}
                                        </div>

                                        <div className="px-4 pb-4">
                                            <div className="flex justify-between items-start">
                                                {/* Logo (Overlapping) */}
                                                <div className="-mt-8 mb-2 relative">
                                                    <div className="w-16 h-16 rounded-xl bg-white p-1 shadow-md overflow-hidden">
                                                        {biz.logo_image ? (
                                                            <img src={getImageUrl(biz.logo_image)} alt={biz.name} className="w-full h-full object-cover rounded-lg" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400"><User /></div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Category Badge */}
                                                <span className="mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                                                    {biz.category}
                                                </span>
                                            </div>

                                            <div className="mt-1">
                                                <div className="flex items-center gap-1">
                                                    <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-indigo-600 transition-colors">{biz.name}</h3>
                                                    {biz.is_verified && <CheckBadge />}
                                                </div>
                                                <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">{biz.tagline || 'No tagline'}</p>

                                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                                                    <span className="flex items-center"><Star size={14} className="mr-1 text-yellow-400" /> {biz.rating_avg ? Number(biz.rating_avg).toFixed(1) : 'New'}</span>
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
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-400">
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

    if (isLoading) return <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}</div>;

    if (!feedData?.posts?.length) {
        return (
            <div className="text-center py-20 bg-white rounded-xl border text-gray-400">
                <User size={48} className="mx-auto mb-4 opacity-20" />
                <p>Your feed is empty.</p>
                <p className="text-sm">Follow businesses to see their latest updates here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {feedData.posts.map(post => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <Link to={`/learning-center/profile/${post.business_id}`} className="block w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                            {post.Business?.logo_image ? (
                                <img src={getImageUrl(post.Business.logo_image)} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-6 h-6 m-2 text-gray-400" />
                            )}
                        </Link>
                        <div>
                            <Link to={`/learning-center/profile/${post.business_id}`} className="font-bold text-gray-900 hover:text-indigo-600 flex items-center gap-1">
                                {post.Business?.name || 'Unknown Business'}
                                {post.Business?.is_verified && <CheckBadge />}
                            </Link>
                            <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-2">{post.title}</h3>
                    <div className="text-gray-600 text-sm mb-4 line-clamp-3" dangerouslySetInnerHTML={{ __html: post.content }} />

                    {post.type === 'product' && (
                        <div className="mt-2 mb-4">
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                Product / Course
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-4 border-t pt-3 mt-2 text-gray-400 text-sm">
                        <button className="flex items-center gap-1 hover:text-red-500 transition-colors"><Star size={18} /> Like</button>
                        <button className="flex items-center gap-1 hover:text-blue-500 transition-colors"><MessageCircle size={18} /> Comment</button>
                        <Link to={`/learning-center/profile/${post.business_id}`} className="ml-auto text-indigo-600 font-medium text-xs hover:underline">
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
