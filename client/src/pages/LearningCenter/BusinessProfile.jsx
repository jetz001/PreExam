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
        return `http://localhost:3000${path}`;
    };

    if (isLoading) return <div>Loading...</div>;
    if (!res?.success) return <div className="p-8 text-center text-red-500">Business not found</div>;

    // Re-declare business after the error check, as res.business is guaranteed to exist if success is true
    const businessData = res.business;
    const posts = postsRes?.posts?.rows || [];
    const knowledgePosts = posts.filter(p => p.type === 'article');
    const shopPosts = posts.filter(p => p.type === 'product');

    return (
        <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
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
            <div className="relative h-48 md:h-64 bg-gray-300 dark:bg-slate-800">
                {businessData.cover_image && (
                    <img src={getImageUrl(businessData.cover_image)} alt="Cover" className="w-full h-full object-cover" />
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-16 sm:-mt-24 pb-8 border-b border-gray-200 dark:border-slate-700 mb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                        {/* Profile Image */}
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-slate-800 rounded-full border-4 border-white dark:border-slate-900 shadow-md overflow-hidden flex-shrink-0">
                            {businessData.logo_image ? (
                                <img src={getImageUrl(businessData.logo_image)} alt={businessData.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-slate-800">
                                    <User size={48} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 pt-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        {business.name}
                                        {business.is_verified && <CheckBadge />}
                                    </h1>
                                    <p className="text-gray-500">{business.category}</p>
                                </div>
                                <button
                                    onClick={() => followMutation.mutate(isFollowing)}
                                    className={`px-6 py-2 rounded-full font-medium shadow-sm active:scale-95 transition-all ${isFollowing ? 'bg-gray-200 text-gray-800' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            </div>

                            <p className="mt-3 text-gray-700">{business.tagline}</p>

                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                                {business.contact_link && (
                                    <a href={business.contact_link} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-indigo-600">
                                        <LinkIcon size={16} className="mr-1" /> Contact
                                    </a>
                                )}
                                <div className="flex items-center gap-1">
                                    <User size={16} /> {business.stats?.followers || 0} Followers
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star size={16} className="text-yellow-400" /> {business.rating_avg || '0.0'} ({business.rating_count} reviews)
                                </div>
                                <button onClick={() => setIsChatOpen(true)} className="flex items-center gap-1 hover:text-indigo-600 cursor-pointer text-gray-400 hover:text-blue-500 transition-colors">
                                    <MessageCircle size={16} /> Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('knowledge')}
                            className={`flex-1 py-4 text-center font-bold text-sm border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'knowledge' ? 'border-primary text-primary bg-indigo-50/50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                        >
                            <BookOpen size={18} /> Knowledge ({knowledgePosts.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('shop')}
                            className={`flex-1 py-4 text-center font-bold text-sm border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'shop' ? 'border-primary text-primary bg-indigo-50/50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                        >
                            <ShoppingBag size={18} /> Shop ({shopPosts.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`flex-1 py-4 text-center font-bold text-sm border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'reviews' ? 'border-primary text-primary bg-indigo-50/50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Star size={18} /> Reviews ({business.rating_count})
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === 'reviews' ? (
                            <ReviewsSection businessId={id} ownerUid={business.owner_uid} />
                        ) : isPostsLoading ? (
                            <div className="text-center py-10">Loading Content...</div>
                        ) : (
                            <div className="space-y-6">
                                {(activeTab === 'knowledge' ? knowledgePosts : shopPosts).map(post => (
                                    <div key={post.id} className="border-b last:border-0 pb-6 last:pb-0">
                                        <div className="flex gap-2 mb-2">
                                            {post.tags.map((tag, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">#{tag}</span>
                                            ))}
                                            {post.is_pinned && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-bold">PINNED</span>}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                                        <ReadMoreText content={post.content} limit={200} className="text-gray-600 text-sm mb-4" />

                                        {/* Action Bar */}
                                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                                            <button className="flex items-center gap-1 hover:text-red-500"><Star size={16} /> Like</button>
                                            <button className="flex items-center gap-1 hover:text-blue-500"><MessageCircle size={16} /> Comment</button>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(window.location.href);
                                                    toast.success('Link copied');
                                                }}
                                                className="flex items-center gap-1 hover:text-green-500"
                                            >
                                                <Share2 size={16} /> Share
                                            </button>
                                            <button
                                                onClick={() => setSharePost(post)}
                                                className="flex items-center gap-1 hover:text-indigo-500 text-indigo-400"
                                            >
                                                <MessageCircle size={16} /> Discuss
                                            </button>
                                            <button
                                                onClick={() => businessApi.toggleBookmark(post.id).then(() => toast.success('Saved!'))}
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
        return `http://localhost:3000${path}`;
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
