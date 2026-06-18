import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import businessApi from '../../services/businessApi';
import { User, MapPin, Link as LinkIcon, Facebook, MessageCircle, Star, Grid, Search, ShoppingBag, Bookmark, BookOpen, Share2, CornerDownRight } from 'lucide-react';
import toast from 'react-hot-toast';
import SharePostModal from '../../components/Community/SharePostModal';
import BusinessChatModal from '../../components/business/BusinessChatModal';
import ReadMoreText from '../../components/common/ReadMoreText';

// ...

const BusinessProfile = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('knowledge'); // knowledge | shop
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [sharePost, setSharePost] = useState(null); // State for the post being shared

    const { data: res, isLoading, refetch } = useQuery({
        queryKey: ['businessProfile', id],
        queryFn: () => businessApi.getBusinessById(id)
    });

    const { data: postsRes, isLoading: isPostsLoading } = useQuery({
        queryKey: ['businessPosts', id],
        queryFn: () => businessApi.getPosts({ business_id: id })
    });

    const followMutation = useMutation({
        mutationFn: isFollowing =>
            isFollowing
                ? businessApi.unfollowBusiness(id)
                : businessApi.followBusiness(id),
        onSuccess: () => {
            toast.success('Updated follow status');
            refetch(); // Reload to get updated count and status
        },
        onError: () => toast.error('Failed to update status')
    });

    // Derived state from data (data might be stale properly handled by refetch)
    const business = res?.business;
    const isFollowing = business?.isFollowing || false;

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${path.startsWith('/') ? '' : '/'}${path}`;
    };

    if (isLoading) return <div>Loading...</div>;
    if (!res?.success) return <div className="p-8 text-center text-red-500">Business not found</div>;

    // Re-declare business after the error check, as res.business is guaranteed to exist if success is true
    const businessData = res.business;
    const posts = postsRes?.posts?.rows || [];
    const knowledgePosts = posts.filter(p => p.type === 'article');
    const shopPosts = posts.filter(p => p.type === 'product');

    return (
        <div className="bg-[#0f111a] min-h-screen text-white overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/40 to-transparent pointer-events-none" />
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

            <Helmet>
                <title>{business.name} | Learning Center</title>
                <meta name="description" content={business.tagline || business.about} />
                <meta property="og:title" content={business.name} />
                <meta property="og:description" content={business.tagline || business.about} />
                <meta property="og:image" content={getImageUrl(business.logo_image)} />
                <meta property="og:type" content="profile" />
                <meta property="og:url" content={window.location.href} />
            </Helmet>

            {/* Chat Modal */}
            <BusinessChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                businessId={id}
                businessName={business.name}
                businessLogo={getImageUrl(business.logo_image)}
            />

            {/* Share Post Modal */}
            {sharePost && (
                <SharePostModal
                    post={sharePost}
                    businessName={business.name}
                    onClose={(success) => {
                        if (success) toast.success('Shared to community!');
                        setSharePost(null);
                    }}
                />
            )}

            {/* Header / Cover */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                {businessData.cover_image ? (
                    <img src={getImageUrl(businessData.cover_image)} alt="Cover" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] to-transparent" />
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="relative -mt-24 sm:-mt-32 pb-8 mb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
                        {/* Profile Image */}
                        <div className="w-32 h-32 md:w-44 md:h-44 bg-[#0f111a] rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden flex-shrink-0 group relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {businessData.logo_image ? (
                                <img src={getImageUrl(businessData.logo_image)} alt={businessData.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 bg-white/5">
                                    <User size={64} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 text-center md:text-left w-full">
                            <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start gap-4">
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center justify-center md:justify-start gap-3 drop-shadow-md">
                                        {business.name}
                                        {business.is_verified && <CheckBadge />}
                                    </h1>
                                    <span className="inline-block mt-2 px-4 py-1.5 bg-white/10 text-pink-300 text-sm rounded-full font-bold border border-white/10 backdrop-blur-sm tracking-wide">
                                        {business.category}
                                    </span>
                                </div>
                                <button
                                    onClick={() => followMutation.mutate(isFollowing)}
                                    className={`px-8 py-3 rounded-full font-bold shadow-lg transition-all duration-300 flex items-center gap-2 ${isFollowing ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30' : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-105 hover:shadow-[0_0_20px_rgba(236,72,153,0.5)]'}`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            </div>

                            <p className="mt-6 text-gray-300 text-lg max-w-2xl leading-relaxed">{business.tagline}</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6 pt-6 border-t border-white/10 text-sm font-medium text-gray-300">
                                {business.contact_link && (
                                    <a href={business.contact_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-pink-400 transition-colors bg-white/5 px-4 py-2 rounded-xl">
                                        <LinkIcon size={16} /> Contact
                                    </a>
                                )}
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
                                    <User size={16} className="text-blue-400" /> {business.stats?.followers || 0} Followers
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
                                    <Star size={16} className="text-yellow-400" /> {business.rating_avg || '0.0'} ({business.rating_count} reviews)
                                </div>
                                <button onClick={() => setIsChatOpen(true)} className="flex items-center gap-2 text-gray-300 hover:text-indigo-400 transition-colors bg-white/5 px-4 py-2 rounded-xl hover:bg-white/10">
                                    <MessageCircle size={16} /> Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="max-w-5xl mx-auto px-4 pb-20">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden min-h-[500px] shadow-2xl">
                    <div className="flex border-b border-white/10 bg-black/20 p-2 gap-2">
                        <button
                            onClick={() => setActiveTab('knowledge')}
                            className={`flex-1 py-4 text-center font-bold text-sm rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'knowledge' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-white/10 shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                        >
                            <BookOpen size={18} /> Knowledge <span className="bg-white/10 px-2 py-0.5 rounded-md text-xs">{knowledgePosts.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('shop')}
                            className={`flex-1 py-4 text-center font-bold text-sm rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'shop' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-white/10 shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                        >
                            <ShoppingBag size={18} /> Shop <span className="bg-white/10 px-2 py-0.5 rounded-md text-xs">{shopPosts.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`flex-1 py-4 text-center font-bold text-sm rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'reviews' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-white/10 shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                        >
                            <Star size={18} /> Reviews <span className="bg-white/10 px-2 py-0.5 rounded-md text-xs">{business.rating_count}</span>
                        </button>
                    </div>

                    <div className="p-6 md:p-8">
                        {activeTab === 'reviews' ? (
                            <ReviewsSection businessId={id} ownerUid={business.owner_uid} />
                        ) : isPostsLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {(activeTab === 'knowledge' ? knowledgePosts : shopPosts).length === 0 ? (
                                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 text-gray-400">
                                        <Grid size={48} className="mx-auto mb-4 opacity-40 text-pink-400" />
                                        <p className="text-xl font-bold text-white mb-2">No Content Yet</p>
                                        <p className="text-sm">Check back later for updates from {business.name}.</p>
                                    </div>
                                ) : (
                                    (activeTab === 'knowledge' ? knowledgePosts : shopPosts).map(post => (
                                        <div key={post.id} className="group bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            
                                            <div className="relative z-10">
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {post.tags?.map((tag, i) => (
                                                        <span key={i} className="px-3 py-1 bg-white/10 text-gray-300 text-xs rounded-full font-medium tracking-wide">#{tag}</span>
                                                    ))}
                                                    {post.is_pinned && <span className="px-3 py-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 text-xs rounded-full font-bold border border-pink-500/30 shadow-sm">PINNED 📌</span>}
                                                </div>
                                                
                                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-pink-300 transition-colors leading-tight">{post.title}</h3>
                                                <ReadMoreText content={post.content} limit={200} className="text-gray-300 text-sm mb-6 leading-relaxed" />

                                                {/* Action Bar */}
                                                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-5 border-t border-white/10 text-sm font-bold text-gray-400">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const res = await businessApi.toggleLike(post.id);
                                                                if (res.success) {
                                                                    toast.success(res.liked ? 'Liked!' : 'Unliked');
                                                                    queryClient.invalidateQueries(['businessPosts', id]);
                                                                }
                                                            } catch (err) {
                                                                if (err.response?.status === 401) return toast.error('Please login to like');
                                                                toast.error('Failed to like');
                                                            }
                                                        }}
                                                        className={`flex items-center gap-2 transition-colors group/btn ${post.isLiked ? 'text-pink-500' : 'hover:text-pink-400'}`}
                                                    >
                                                        <div className="p-2 rounded-full group-hover/btn:bg-pink-400/10 transition-colors"><Star size={18} fill={post.isLiked ? "currentColor" : "none"} /></div>
                                                        {post.likes_count || 0} Like
                                                    </button>

                                                    <button
                                                        onClick={() => setSharePost(post)}
                                                        className="flex items-center gap-2 hover:text-blue-400 transition-colors group/btn"
                                                    >
                                                        <div className="p-2 rounded-full group-hover/btn:bg-blue-400/10 transition-colors"><MessageCircle size={18} /></div> Discuss
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(`${window.location.origin}/business/${id}?post=${post.id}`);
                                                            toast.success('Link copied to clipboard');
                                                        }}
                                                        className="flex items-center gap-2 hover:text-green-400 transition-colors group/btn"
                                                    >
                                                        <div className="p-2 rounded-full group-hover/btn:bg-green-400/10 transition-colors"><Share2 size={18} /></div> Share
                                                    </button>

                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const res = await businessApi.toggleBookmark(post.id);
                                                        if (res.success) toast.success(res.bookmarked ? 'Saved!' : 'Removed from saved');
                                                    } catch (err) {
                                                        if (err.response?.status === 401) return toast.error('Please login to save');
                                                        toast.error('Failed to save');
                                                    }
                                                }}
                                                className="flex items-center gap-1 hover:text-yellow-500 ml-auto"
                                            >
                                                <Bookmark size={16} /> Save
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {(activeTab === 'knowledge' ? knowledgePosts : shopPosts).length === 0 && (
                                    <div className="text-center py-10 text-gray-400">
                                        <div className="mb-2 opacity-50"><Grid size={40} className="mx-auto" /></div>
                                        No {activeTab} content yet.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckBadge = () => (
    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const ReviewsSection = ({ businessId, ownerUid }) => {
    const { data: reviewsRes, isLoading, refetch } = useQuery({
        queryKey: ['businessReviews', businessId],
        queryFn: () => businessApi.getReviews(businessId)
    });

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isOwner = currentUser?.id && String(currentUser.id) === String(ownerUid);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await businessApi.createReview({ business_id: businessId, rating, comment });
            setComment('');
            setRating(5);
            toast.success('Review submitted');
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReply = async (reviewId) => {
        const reply = prompt('Enter your reply:');
        if (reply) {
            try {
                await businessApi.replyToReview(reviewId, reply);
                toast.success('Reply added');
                refetch();
            } catch (error) {
                toast.error('Failed to reply');
            }
        }
    };

    if (isLoading) return <div>Loading reviews...</div>;

    return (
        <div className="space-y-8">
            {/* Write Review */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-3">Write a Review</h3>
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-2 mb-3">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    <textarea
                        className="w-full border rounded-lg p-2 mb-3 text-gray-900"
                        rows="3"
                        placeholder="Share your experience..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : 'Post Review'}
                    </button>
                </form>
            </div>

            {/* Review List */}
            <div className="space-y-4">
                {reviewsRes?.reviews?.map(review => (
                    <div key={review.id} className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                                {review.Reviewer?.avatar ? (
                                    <img src={getImageUrl(review.Reviewer.avatar)} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="m-1.5 text-gray-500" />
                                )}
                            </div>
                            <span className="font-semibold text-sm">{review.Reviewer?.display_name || 'User'}</span>
                            <div className="flex text-yellow-400 text-xs">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                ))}
                            </div>
                            <span className="text-xs text-gray-400 ml-auto">
                                {new Date(review.createdAt || review.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-gray-700 text-sm">{review.comment}</p>

                        {/* Owner Reply Display */}
                        {review.owner_reply && (
                            <div className="mt-2 ml-4 p-3 bg-gray-100 rounded-lg text-sm">
                                <div className="flex items-center gap-2 font-bold text-indigo-600 mb-1">
                                    <CornerDownRight size={14} /> Owner Response
                                </div>
                                <p className="text-gray-600">{review.owner_reply}</p>
                            </div>
                        )}

                        {/* Owner Reply Action */}
                        {isOwner && !review.owner_reply && (
                            <button
                                onClick={() => handleReply(review.id)}
                                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                            >
                                <MessageCircle size={14} /> Reply
                            </button>
                        )}
                    </div>
                ))}
                {reviewsRes?.reviews?.length === 0 && <p className="text-center text-gray-500">No reviews yet.</p>}
            </div>
        </div>
    );
};

export default BusinessProfile;
