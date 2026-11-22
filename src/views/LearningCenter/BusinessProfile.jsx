import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import businessApi from '../../services/businessApi';
import { getImageUrl } from '../../utils/imageUtils';
import {
    User,
    Link as LinkIcon,
    MessageCircle,
    Star,
    Grid,
    ShoppingBag,
    Bookmark,
    BookOpen,
    Share2,
    CornerDownRight,
    BadgeCheck,
    Pin,
    ArrowLeft,
    Users,
    Send,
    Sparkles,
    AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SharePostModal from '../../components/Community/SharePostModal';
import BusinessChatModal from '../../components/business/BusinessChatModal';
import ReadMoreText from '../../components/common/ReadMoreText';

const BusinessProfile = () => {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('knowledge'); // knowledge | shop | reviews
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [sharePost, setSharePost] = useState(null);

    const { data: res, isLoading, refetch } = useQuery({
        queryKey: ['businessProfile', id],
        queryFn: () => businessApi.getBusinessById(id),
    });

    const { data: postsRes, isLoading: isPostsLoading } = useQuery({
        queryKey: ['businessPosts', id],
        queryFn: () => businessApi.getPosts({ business_id: id }),
    });

    const followMutation = useMutation({
        mutationFn: (isFollowing) =>
            isFollowing
                ? businessApi.unfollowBusiness(id)
                : businessApi.followBusiness(id),
        onSuccess: () => {
            toast.success('อัปเดตสถานะการติดตามแล้ว');
            refetch();
        },
        onError: () => toast.error('ไม่สามารถอัปเดตสถานะได้'),
    });

    const business = res?.business;
    const isFollowing = business?.isFollowing || false;

    if (isLoading) {
        return (
            <div
                className="-mt-20 pt-24 min-h-screen bg-[radial-gradient(circle_at_top,#4c1d95_0%,#240b52_48%,#0f0724_100%)] text-white px-4 pb-20"
                style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
            >
                <div className="max-w-5xl mx-auto space-y-6 animate-pulse pt-8">
                    <div className="h-52 rounded-3xl bg-white/10 border border-white/15" />
                    <div className="h-44 rounded-3xl bg-white/10 border border-white/15" />
                    <div className="h-80 rounded-3xl bg-white/10 border border-white/15" />
                </div>
            </div>
        );
    }

    if (!res?.success || !business) {
        return (
            <div
                className="-mt-20 pt-28 min-h-screen bg-[radial-gradient(circle_at_top,#4c1d95_0%,#240b52_48%,#0f0724_100%)] text-white flex items-center justify-center px-4 pb-20"
                style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
            >
                <div className="max-w-md w-full rounded-3xl bg-white/10 backdrop-blur-xl border border-white/18 p-8 text-center shadow-2xl">
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-400/35 text-rose-300 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white mb-2">ไม่พบข้อมูลเพจธุรกิจ</h1>
                    <p className="text-sm text-slate-300 mb-6">
                        ลิงก์อาจไม่ถูกต้อง หรือเพจนี้อาจถูกปิดการมองเห็นแล้ว
                    </p>
                    <Link
                        to="/learning-center"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <ArrowLeft size={16} />
                        <span>กลับสู่ศูนย์การเรียนรู้</span>
                    </Link>
                </div>
            </div>
        );
    }

    const businessData = res.business;
    const posts = postsRes?.posts?.rows || [];
    const knowledgePosts = posts.filter((p) => p.type === 'article');
    const shopPosts = posts.filter((p) => p.type === 'product');
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <div
            className="-mt-20 min-h-screen bg-[radial-gradient(circle_at_top,#4c1d95_0%,#240b52_46%,#0b071c_100%)] text-white overflow-x-hidden relative"
            style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
        >
            {/* Ambient Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-[120px]" />
                <div className="absolute top-1/4 -right-24 w-80 h-80 rounded-full bg-pink-500/15 blur-[120px]" />
            </div>

            <Helmet>
                <title>{business.name} | Learning Center</title>
                <meta name="description" content={business.tagline || business.about || ''} />
                <meta property="og:title" content={business.name} />
                <meta property="og:description" content={business.tagline || business.about || ''} />
                {business.logo_image && <meta property="og:image" content={getImageUrl(business.logo_image)} />}
                <meta property="og:type" content="profile" />
                {currentUrl && <meta property="og:url" content={currentUrl} />}
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
                        if (success) toast.success('แชร์ไปยังชุมชนแล้ว!');
                        setSharePost(null);
                    }}
                />
            )}

            {/* Header / Cover */}
            <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden pt-20">
                {businessData.cover_image ? (
                    <img
                        src={getImageUrl(businessData.cover_image)}
                        alt={businessData.name || 'Cover'}
                        className="absolute inset-0 w-full h-full object-cover opacity-65"
                    />
                ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-800 via-purple-800 to-fuchsia-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#160835] via-[#160835]/35 to-[#160835]/50" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-2">
                    <Link
                        to="/learning-center"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/45 hover:bg-slate-950/70 border border-white/20 text-xs sm:text-sm font-bold text-white backdrop-blur-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <ArrowLeft size={16} />
                        <span>ศูนย์การเรียนรู้</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="relative -mt-20 sm:-mt-28 pb-6 mb-6">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8 bg-white/10 backdrop-blur-2xl border border-white/18 rounded-3xl p-5 sm:p-8 shadow-[0_24px_60px_-15px_rgba(8,3,28,0.65)]">
                        {/* Profile Image */}
                        <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 bg-slate-950/80 rounded-3xl border-2 border-white/25 shadow-2xl overflow-hidden shrink-0 group relative p-1">
                            {businessData.logo_image ? (
                                <img
                                    src={getImageUrl(businessData.logo_image)}
                                    alt={businessData.name}
                                    className="w-full h-full object-cover rounded-[20px] transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-gradient-to-br from-indigo-600/40 to-purple-700/40 rounded-[20px]">
                                    <User size={56} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 text-center md:text-left w-full">
                            <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start gap-4">
                                <div className="min-w-0 max-w-full">
                                    <h1
                                        className="text-2xl sm:text-3xl md:text-4xl font-black text-white flex items-center justify-center md:justify-start gap-2.5 drop-shadow-md break-words"
                                        style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
                                    >
                                        <span className="truncate">{business.name}</span>
                                        {business.is_verified && <CheckBadge />}
                                    </h1>
                                    <span className="inline-flex items-center gap-1.5 mt-2 px-3.5 py-1 bg-white/12 text-amber-200 text-xs sm:text-sm rounded-full font-bold border border-white/18 backdrop-blur-sm tracking-wide">
                                        <Sparkles size={13} className="text-amber-300" />
                                        <span>{business.category || 'Education'}</span>
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    disabled={followMutation.isPending}
                                    onClick={() => followMutation.mutate(isFollowing)}
                                    className={`px-7 py-2.5 sm:py-3 rounded-2xl font-extrabold text-sm shadow-lg transition-all duration-200 inline-flex items-center gap-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60 ${
                                        isFollowing
                                            ? 'bg-white/12 text-white border border-white/25 hover:bg-white/20'
                                            : 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-600 text-white hover:brightness-110 hover:-translate-y-0.5 shadow-pink-500/25'
                                    }`}
                                >
                                    <Users size={16} />
                                    <span>{isFollowing ? 'กำลังติดตาม' : 'ติดตามเพจ'}</span>
                                </button>
                            </div>

                            {business.tagline && (
                                <p className="mt-4 text-slate-200 text-base sm:text-lg max-w-2xl leading-relaxed break-words">
                                    {business.tagline}
                                </p>
                            )}

                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-5 pt-5 border-t border-white/12 text-xs sm:text-sm font-semibold text-slate-100">
                                {business.contact_link && (
                                    <a
                                        href={business.contact_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/18 border border-white/15 px-3.5 py-2 rounded-xl text-slate-100 hover:text-amber-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    >
                                        <LinkIcon size={15} className="text-pink-300" />
                                        <span>ช่องทางติดต่อ</span>
                                    </a>
                                )}
                                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/12 px-3.5 py-2 rounded-xl">
                                    <Users size={15} className="text-sky-300" />
                                    <span>{business.stats?.followers || 0} ผู้ติดตาม</span>
                                </div>
                                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/12 px-3.5 py-2 rounded-xl">
                                    <Star size={15} className="text-amber-400 fill-amber-400" />
                                    <span>
                                        {business.rating_avg ? Number(business.rating_avg).toFixed(1) : '0.0'} ({business.rating_count || 0} รีวิว)
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsChatOpen(true)}
                                    className="inline-flex items-center gap-2 text-white bg-indigo-500/25 hover:bg-indigo-500/40 border border-indigo-400/35 px-3.5 py-2 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    <MessageCircle size={15} className="text-indigo-200" />
                                    <span>ส่งข้อความ</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 relative z-10">
                <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/18 overflow-hidden min-h-[480px] shadow-[0_24px_60px_-15px_rgba(8,3,28,0.65)]">
                    <div
                        className="flex flex-wrap sm:flex-nowrap border-b border-white/12 bg-slate-950/35 p-2 gap-2"
                        role="tablist"
                        aria-label="เนื้อหาเพจธุรกิจ"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'knowledge'}
                            onClick={() => setActiveTab('knowledge')}
                            className={`flex-1 min-w-[110px] py-3 px-3 text-center font-bold text-xs sm:text-sm rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                activeTab === 'knowledge'
                                    ? 'bg-gradient-to-r from-indigo-500/35 to-fuchsia-500/35 text-white border border-white/25 shadow-lg'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <BookOpen size={17} />
                            <span>Knowledge</span>
                            <span className="bg-white/15 px-2 py-0.5 rounded-full text-xs">{knowledgePosts.length}</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'shop'}
                            onClick={() => setActiveTab('shop')}
                            className={`flex-1 min-w-[110px] py-3 px-3 text-center font-bold text-xs sm:text-sm rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                activeTab === 'shop'
                                    ? 'bg-gradient-to-r from-indigo-500/35 to-fuchsia-500/35 text-white border border-white/25 shadow-lg'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <ShoppingBag size={17} />
                            <span>Shop</span>
                            <span className="bg-white/15 px-2 py-0.5 rounded-full text-xs">{shopPosts.length}</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'reviews'}
                            onClick={() => setActiveTab('reviews')}
                            className={`flex-1 min-w-[110px] py-3 px-3 text-center font-bold text-xs sm:text-sm rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                activeTab === 'reviews'
                                    ? 'bg-gradient-to-r from-indigo-500/35 to-fuchsia-500/35 text-white border border-white/25 shadow-lg'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <Star size={17} />
                            <span>Reviews</span>
                            <span className="bg-white/15 px-2 py-0.5 rounded-full text-xs">{business.rating_count || 0}</span>
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 md:p-8">
                        {activeTab === 'reviews' ? (
                            <ReviewsSection businessId={id} ownerUid={business.owner_uid} />
                        ) : isPostsLoading ? (
                            <div className="space-y-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-44 rounded-3xl bg-white/10 border border-white/12 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {(activeTab === 'knowledge' ? knowledgePosts : shopPosts).length === 0 ? (
                                    <div className="text-center py-16 px-6 bg-white/8 rounded-2xl border border-white/15 text-slate-300">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mx-auto mb-4 text-amber-300">
                                            <Grid size={30} />
                                        </div>
                                        <p className="text-xl font-extrabold text-white mb-2">ยังไม่มีเนื้อหาในหมวดนี้</p>
                                        <p className="text-sm text-slate-300">ติดตามอัปเดตใหม่จาก {business.name} ได้เร็วๆ นี้</p>
                                    </div>
                                ) : (
                                    (activeTab === 'knowledge' ? knowledgePosts : shopPosts).map((post) => (
                                        <article
                                            key={post.id}
                                            className="group bg-white/8 backdrop-blur-md rounded-3xl border border-white/15 p-5 sm:p-7 transition-all duration-300 hover:bg-white/12 hover:border-white/25 hover:-translate-y-0.5 hover:shadow-2xl relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                            <div className="relative z-10">
                                                <div className="flex flex-wrap gap-2 mb-3.5">
                                                    {post.is_pinned && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/25 to-pink-500/25 text-amber-200 text-xs rounded-full font-bold border border-amber-400/35 shadow-sm">
                                                            <Pin size={12} className="text-amber-300" />
                                                            <span>ปักหมุด</span>
                                                        </span>
                                                    )}
                                                    {post.tags?.map((tag, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-3 py-1 bg-white/10 text-slate-200 text-xs rounded-full font-medium tracking-wide border border-white/10"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-3 group-hover:text-amber-200 transition-colors leading-snug break-words">
                                                    {post.title}
                                                </h3>
                                                <ReadMoreText
                                                    content={DOMPurify.sanitize(post.content || '')}
                                                    limitLines={4}
                                                    className="text-slate-200 text-sm mb-5 leading-relaxed break-words"
                                                />

                                                {/* Action Bar */}
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-4 border-t border-white/12 text-xs sm:text-sm font-bold text-slate-200">
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            try {
                                                                const likeRes = await businessApi.toggleLike(post.id);
                                                                if (likeRes.success) {
                                                                    toast.success(likeRes.liked ? 'ถูกใจแล้ว!' : 'ยกเลิกถูกใจ');
                                                                    queryClient.invalidateQueries({ queryKey: ['businessPosts', id] });
                                                                }
                                                            } catch (err) {
                                                                if (err.response?.status === 401) return toast.error('กรุณาเข้าสู่ระบบเพื่อกดถูกใจ');
                                                                toast.error('ไม่สามารถกดถูกใจได้');
                                                            }
                                                        }}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                                            post.isLiked
                                                                ? 'bg-pink-500/20 text-pink-300 border border-pink-400/35'
                                                                : 'bg-white/5 hover:bg-white/12 text-slate-200 hover:text-pink-300 border border-white/10'
                                                        }`}
                                                    >
                                                        <Star size={16} fill={post.isLiked ? 'currentColor' : 'none'} />
                                                        <span>{post.likes_count || 0} ถูกใจ</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setSharePost(post)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/12 border border-white/10 text-slate-200 hover:text-sky-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                    >
                                                        <MessageCircle size={16} />
                                                        <span>พูดคุยในชุมชน</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                                                navigator.clipboard.writeText(`${window.location.origin}/business/${id}?post=${post.id}`);
                                                                toast.success('คัดลอกลิงก์แล้ว');
                                                            }
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/12 border border-white/10 text-slate-200 hover:text-emerald-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                    >
                                                        <Share2 size={16} />
                                                        <span>แชร์</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            try {
                                                                const bmRes = await businessApi.toggleBookmark(post.id);
                                                                if (bmRes.success) toast.success(bmRes.bookmarked ? 'บันทึกแล้ว!' : 'นำออกจากรายการบันทึก');
                                                            } catch (err) {
                                                                if (err.response?.status === 401) return toast.error('กรุณาเข้าสู่ระบบเพื่อบันทึก');
                                                                toast.error('ไม่สามารถบันทึกได้');
                                                            }
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/12 border border-white/10 text-slate-200 hover:text-amber-300 transition-colors sm:ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                    >
                                                        <Bookmark size={16} />
                                                        <span>บันทึก</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))
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
    <BadgeCheck
        size={22}
        className="text-sky-400 shrink-0 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
        aria-label="ยืนยันตัวตนแล้ว"
    />
);

const ReviewsSection = ({ businessId, ownerUid }) => {
    const { data: reviewsRes, isLoading, refetch } = useQuery({
        queryKey: ['businessReviews', businessId],
        queryFn: () => businessApi.getReviews(businessId),
    });

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingToId, setReplyingToId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    let currentUser = {};
    if (typeof window !== 'undefined') {
        try {
            currentUser = JSON.parse(localStorage.getItem('user') || '{}') || {};
        } catch {
            currentUser = {};
        }
    }
    const isOwner = Boolean(currentUser?.id && String(currentUser.id) === String(ownerUid));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await businessApi.createReview({ business_id: businessId, rating, comment });
            setComment('');
            setRating(5);
            toast.success('ส่งรีวิวเรียบร้อยแล้ว');
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || 'ไม่สามารถส่งรีวิวได้');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReplySubmit = async (reviewId) => {
        if (!replyText.trim()) return;
        setIsReplying(true);
        try {
            await businessApi.replyToReview(reviewId, replyText.trim());
            toast.success('เพิ่มการตอบกลับแล้ว');
            setReplyingToId(null);
            setReplyText('');
            refetch();
        } catch {
            toast.error('ไม่สามารถตอบกลับได้');
        } finally {
            setIsReplying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-36 rounded-2xl bg-white/10" />
                <div className="h-24 rounded-2xl bg-white/10" />
            </div>
        );
    }

    const reviews = reviewsRes?.reviews || [];

    return (
        <div className="space-y-8">
            {/* Write Review */}
            <div className="bg-white/8 border border-white/15 p-5 sm:p-6 rounded-2xl backdrop-blur-md">
                <h3 className="font-extrabold text-white text-lg mb-3">เขียนรีวิวให้เพจนี้</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center gap-1.5" role="group" aria-label="ให้คะแนนดาว">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                aria-label={`ให้คะแนน ${star} ดาว`}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <Star
                                    size={24}
                                    className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}
                                />
                            </button>
                        ))}
                        <span className="ml-2 text-xs font-bold text-amber-200">{rating} / 5 ดาว</span>
                    </div>

                    <textarea
                        aria-label="ความคิดเห็นรีวิว"
                        className="w-full bg-slate-950/50 border border-white/18 rounded-xl p-3.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus:border-indigo-400 transition-colors"
                        rows={3}
                        placeholder="แบ่งปันประสบการณ์การเรียนรู้ของคุณ..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <Send size={15} />
                        <span>{isSubmitting ? 'กำลังส่ง...' : 'โพสต์รีวิว'}</span>
                    </button>
                </form>
            </div>

            {/* Review List */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        className="bg-white/6 border border-white/12 rounded-2xl p-5 transition-colors hover:bg-white/8"
                    >
                        <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                            <div className="w-9 h-9 bg-white/15 rounded-full overflow-hidden border border-white/20 flex items-center justify-center shrink-0">
                                {review.Reviewer?.avatar ? (
                                    <img
                                        src={getImageUrl(review.Reviewer.avatar)}
                                        alt={review.Reviewer?.display_name || 'Reviewer'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User size={18} className="text-slate-200" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <span className="font-bold text-sm text-white block truncate">
                                    {review.Reviewer?.display_name || 'ผู้ใช้งาน'}
                                </span>
                                <div className="flex items-center gap-0.5 mt-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={13}
                                            className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
                                        />
                                    ))}
                                </div>
                            </div>
                            <span className="text-xs text-slate-300 ml-auto">
                                {new Date(review.createdAt || review.created_at).toLocaleDateString('th-TH')}
                            </span>
                        </div>
                        <p className="text-slate-200 text-sm leading-relaxed break-words">{review.comment}</p>

                        {/* Owner Reply Display */}
                        {review.owner_reply && (
                            <div className="mt-3 ml-2 sm:ml-6 p-3.5 bg-indigo-500/15 border border-indigo-400/25 rounded-xl text-sm">
                                <div className="flex items-center gap-2 font-bold text-indigo-200 mb-1">
                                    <CornerDownRight size={14} />
                                    <span>ตอบกลับจากเจ้าของเพจ</span>
                                </div>
                                <p className="text-slate-200 break-words">{review.owner_reply}</p>
                            </div>
                        )}

                        {/* Owner Reply Action */}
                        {isOwner && !review.owner_reply && (
                            <div className="mt-3">
                                {replyingToId === review.id ? (
                                    <div className="space-y-2 pt-2">
                                        <textarea
                                            aria-label="ข้อความตอบกลับรีวิว"
                                            rows={2}
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="พิมพ์ข้อความตอบกลับ..."
                                            className="w-full bg-slate-950/50 border border-white/18 rounded-xl p-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                        />
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                disabled={isReplying || !replyText.trim()}
                                                onClick={() => handleReplySubmit(review.id)}
                                                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                            >
                                                {isReplying ? 'กำลังบันทึก...' : 'ส่งคำตอบ'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setReplyingToId(null);
                                                    setReplyText('');
                                                }}
                                                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/18 text-slate-200 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                            >
                                                ยกเลิก
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setReplyingToId(review.id);
                                            setReplyText('');
                                        }}
                                        className="text-xs sm:text-sm text-indigo-300 hover:text-indigo-200 font-bold inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg px-2 py-1"
                                    >
                                        <MessageCircle size={14} />
                                        <span>ตอบกลับรีวิว</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {reviews.length === 0 && (
                    <div className="text-center py-10 bg-white/6 rounded-2xl border border-white/12 text-slate-300 text-sm">
                        ยังไม่มีรีวิวในขณะนี้ เป็นคนแรกที่รีวิวเพจนี้เลย!
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusinessProfile;
