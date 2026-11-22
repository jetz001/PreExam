import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import {
    MessageCircle,
    Heart,
    Share2,
    MoreVertical,
    Trash2,
    Flag,
    Bookmark,
    Crown,
    BarChart2,
    Newspaper,
    Store,
    ExternalLink,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import communityService from '../../services/communityService';
import ReadMoreText from '../common/ReadMoreText';
import bookmarkService from '../../services/bookmarkService';
import { useAuth } from '../../context/AuthContext';
import RichText from './RichText';
import FriendButton from './FriendButton';
import toast from 'react-hot-toast';
import { isPremiumUser } from '../../utils/userAccess';

const BACKGROUND_STYLES = {
    c1: 'bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500',
    c2: 'bg-gradient-to-br from-orange-400 to-rose-500',
    c3: 'bg-gradient-to-br from-emerald-400 to-cyan-500',
    c4: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    c5: 'bg-gradient-to-br from-slate-900 to-slate-700',
};

const CATEGORY_LABELS = {
    general: 'พูดคุยทั่วไป',
    exam_news: 'ข่าวการสอบ',
    qa_help: 'ถาม-ตอบ',
    relax: 'พักผ่อน/รีวิว',
    hot: 'Hot',
};

const PostCard = ({ thread, onCommentClick, isDetail = false }) => {
    const [likes, setLikes] = useState(thread.likes || 0);
    const [isLiked, setIsLiked] = useState(thread.isLiked || false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        setLikes(thread.likes || 0);
    }, [thread.likes]);

    useEffect(() => {
        setIsLiked(Boolean(thread.isLiked));
    }, [thread.isLiked]);

    const getImageUrl = (path) => {
        if (!path) return `https://ui-avatars.com/api/?name=User&background=random`;
        if (typeof path === 'string' && path.includes('localhost:3000')) {
            path = path.replace('http://localhost:3000', '').replace('https://localhost:3000', '');
        }
        if (path.startsWith('http') || path.startsWith('blob:')) return path;
        return path.startsWith('/') ? path : `/${path}`;
    };

    const likeMutation = useMutation({
        mutationFn: async () => {
            return api.post(`/community/threads/${thread.id}/like`);
        },
        onSuccess: (data) => {
            setLikes(data.data.likes);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: communityService.deleteThread,
        onSuccess: () => {
            toast.success('ลบกระทู้เรียบร้อยแล้ว');
            queryClient.invalidateQueries(['threads']);
            window.location.href = '/community';
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'ไม่สามารถลบกระทู้ได้');
        },
    });

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm('คุณต้องการลบกระทู้นี้ใช่หรือไม่?')) {
            deleteMutation.mutate(thread.id);
        }
        setShowMenu(false);
    };

    const handleReport = (e) => {
        e.stopPropagation();
        const reason = prompt('ระบุเหตุผลในการรายงาน:');
        if (reason) {
            communityService
                .reportContent({
                    target_type: 'thread',
                    target_id: thread.id,
                    reason,
                })
                .then(() => toast.success('ขอบคุณสำหรับการรายงาน เราจะตรวจสอบโดยเร็วที่สุด'))
                .catch(() => toast.error('เกิดข้อผิดพลาดในการส่งรายงาน'));
        }
        setShowMenu(false);
    };

    const handleBookmark = async () => {
        try {
            await bookmarkService.addBookmark({
                target_type: 'thread',
                target_id: thread.id,
                title: thread.title,
            });
            toast.success('บันทึกรายการแล้ว');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                toast.error('คุณบันทึกรายการนี้ไปแล้ว');
            } else {
                toast.error('บันทึกรายการล้มเหลว');
            }
        }
    };

    const handleLike = () => {
        const nextLiked = !isLiked;
        setIsLiked(nextLiked);
        setLikes((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

        likeMutation.mutate(null, {
            onSuccess: (data) => {
                setLikes(data.data.likes);
                setIsLiked(data.data.liked);
            },
            onError: () => {
                setIsLiked(!nextLiked);
                setLikes((prev) => (nextLiked ? Math.max(0, prev - 1) : prev + 1));
            },
        });
    };

    const handleVote = async (optionId) => {
        try {
            await api.post('/community/poll/vote', {
                pollId: thread.Poll.id,
                optionId,
            });
            queryClient.invalidateQueries(['thread', thread.id]);
            toast.success('บันทึกคะแนนโหวตแล้ว');
        } catch (error) {
            console.error('Vote failed', error);
            if (error.response?.data?.error) toast.error(error.response.data.error);
        }
    };

    const totalVotes = thread.Poll?.Options
        ? thread.Poll.Options.reduce((acc, opt) => acc + (opt.vote_count || 0), 0)
        : 0;

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/community?threadId=${thread.id}`;
        navigator.clipboard
            .writeText(shareUrl)
            .then(() => toast.success('คัดลอกลิงก์เรียบร้อยแล้ว'))
            .catch(() => toast.error('คัดลอกลิงก์ไม่สำเร็จ'));
    };

    const handleFacebookShare = (e) => {
        e.stopPropagation();
        const shareUrl = `https://preexam.online/community?threadId=${thread.id}`;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
        setShowMenu(false);
    };

    const isOwner = user && thread.user_id === user.id;
    const authorName = thread.User?.display_name || 'ผู้ใช้งาน';
    const isAuthorPremium = isPremiumUser(thread.User);
    const hasValidDate = thread.created_at && !isNaN(new Date(thread.created_at).getTime());

    return (
        <article className="rounded-3xl bg-gradient-to-br from-emerald-950/90 via-teal-950/85 to-slate-900/95 backdrop-blur-xl border border-white/15 shadow-2xl mb-5 overflow-hidden text-white">
            {/* Header */}
            <div className="p-4 sm:p-5 flex justify-between items-start gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className={`relative flex-shrink-0 ${
                            isAuthorPremium
                                ? 'p-0.5 rounded-full bg-gradient-to-tr from-amber-300 via-yellow-400 to-orange-500'
                                : ''
                        }`}
                    >
                        <img
                            src={getImageUrl(thread.User?.avatar)}
                            alt={authorName}
                            className="w-11 h-11 rounded-full object-cover border-2 border-white/30"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=4f46e5&color=fff`;
                            }}
                        />
                        {isAuthorPremium && (
                            <div
                                className="absolute -bottom-1 -right-1 bg-gradient-to-br from-amber-300 to-amber-500 text-[#1a0533] w-5 h-5 rounded-full flex items-center justify-center shadow border border-slate-900"
                                title="สมาชิกพรีเมียม"
                            >
                                <Crown size={11} />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-white leading-tight truncate">{authorName}</h3>
                            {thread.User && <FriendButton targetUserId={thread.User.id} variant="glass" />}
                        </div>
                        <div className="text-xs text-white/70 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>
                                {hasValidDate
                                    ? formatDistanceToNow(new Date(thread.created_at), { addSuffix: true, locale: th })
                                    : 'เมื่อสักครู่'}
                            </span>
                            <span aria-hidden="true">•</span>
                            <span className="text-[#fde047] font-semibold">
                                {CATEGORY_LABELS[thread.category] || thread.category || 'ทั่วไป'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* More Options Menu */}
                <div className="relative flex-shrink-0" ref={menuRef}>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        aria-label="ตัวเลือกเพิ่มเติม"
                        aria-expanded={showMenu}
                        className="p-2 rounded-xl hover:bg-white/15 text-white/75 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-10 w-48 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/15 py-1.5 z-30">
                            {isOwner ? (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-300 hover:bg-white/10 flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:bg-white/15"
                                >
                                    <Trash2 size={15} />
                                    <span>ลบกระทู้</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleReport}
                                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/10 flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:bg-white/15"
                                >
                                    <Flag size={15} className="text-amber-300" />
                                    <span>รายงานเนื้อหา</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleFacebookShare}
                                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-sky-300 hover:bg-white/10 flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:bg-white/15"
                            >
                                <ExternalLink size={15} />
                                <span>แชร์ไปยัง Facebook</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-5 pb-3">
                <h2 className="text-lg sm:text-xl font-extrabold text-white mb-2.5 break-words leading-snug">
                    {thread.title}
                </h2>

                {thread.background_style && BACKGROUND_STYLES[thread.background_style] ? (
                    <div
                        className={`${BACKGROUND_STYLES[thread.background_style]} p-6 sm:p-8 rounded-2xl min-h-[200px] flex items-center justify-center text-center shadow-inner mb-3 border border-white/20`}
                    >
                        <p className="text-white text-lg sm:text-xl font-extrabold whitespace-pre-line break-words">
                            {thread.content}
                        </p>
                    </div>
                ) : (
                    <ReadMoreText content={thread.content} forceExpanded={isDetail} className="text-white/90 leading-relaxed text-sm sm:text-base break-words">
                        <RichText content={thread.content} />
                    </ReadMoreText>
                )}
            </div>

            {/* Image / Video */}
            {thread.image_url && (
                <div className="mx-4 sm:mx-5 mb-3 rounded-2xl overflow-hidden bg-black/40 border border-white/15 max-h-80">
                    {thread.image_url.endsWith('.mp4') || thread.image_url.endsWith('.webm') ? (
                        <video
                            src={getImageUrl(thread.image_url)}
                            controls
                            className="w-full h-64 sm:h-80 object-contain bg-black"
                        />
                    ) : (
                        <img
                            src={getImageUrl(thread.image_url)}
                            alt={thread.title || 'Post Content'}
                            className="w-full h-64 sm:h-80 object-cover"
                            loading="lazy"
                            onError={(e) => {
                                e.currentTarget.parentElement.style.display = 'none';
                            }}
                        />
                    )}
                </div>
            )}

            {/* Shared Business Post */}
            {thread.SharedBusinessPost && (
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/learning-center/profile/${thread.SharedBusinessPost.business_id}`)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/learning-center/profile/${thread.SharedBusinessPost.business_id}`);
                        }
                    }}
                    className="mx-4 sm:mx-5 mb-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl overflow-hidden cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                >
                    {(() => {
                        let images = [];
                        try {
                            images =
                                typeof thread.SharedBusinessPost.images === 'string'
                                    ? JSON.parse(thread.SharedBusinessPost.images)
                                    : thread.SharedBusinessPost.images || [];
                        } catch {
                            images = [];
                        }
                        return (
                            images.length > 0 && (
                                <div className="h-44 w-full bg-black/30">
                                    <img
                                        src={getImageUrl(images[0])}
                                        className="w-full h-full object-cover"
                                        alt={thread.SharedBusinessPost.title}
                                    />
                                </div>
                            )
                        );
                    })()}
                    <div className="p-3.5">
                        <div className="flex items-center gap-2 mb-1.5 text-xs text-white/75">
                            {thread.SharedBusinessPost.Business?.logo_image ? (
                                <img
                                    src={getImageUrl(thread.SharedBusinessPost.Business.logo_image)}
                                    alt={thread.SharedBusinessPost.Business?.name || 'Business'}
                                    className="w-5 h-5 rounded-full object-cover"
                                />
                            ) : (
                                <Store size={14} className="text-[#fde047]" />
                            )}
                            <span className="font-bold text-white">{thread.SharedBusinessPost.Business?.name}</span>
                            <span>•</span>
                            <span>{new Date(thread.SharedBusinessPost.created_at).toLocaleDateString('th-TH')}</span>
                        </div>
                        <h4 className="font-bold text-white mb-1">{thread.SharedBusinessPost.title}</h4>
                        <div className="text-white/80 text-xs sm:text-sm">
                            <ReadMoreText content={thread.SharedBusinessPost.content} forceExpanded={isDetail} />
                        </div>
                    </div>
                </div>
            )}

            {/* Shared News */}
            {thread.SharedNews && (
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/news/${thread.SharedNews.id}`)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/news/${thread.SharedNews.id}`);
                        }
                    }}
                    className="mx-4 sm:mx-5 mb-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl overflow-hidden cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                >
                    {thread.SharedNews.image_url && (
                        <div className="h-44 w-full bg-black/30">
                            <img
                                src={thread.SharedNews.image_url}
                                className="w-full h-full object-cover"
                                alt={thread.SharedNews.title}
                            />
                        </div>
                    )}
                    <div className="p-3.5">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-pink-500/25 border border-pink-300/35 text-pink-200 rounded-full text-[11px] font-bold">
                                <Newspaper size={11} />
                                <span>{thread.SharedNews.category || 'ข่าวสาร'}</span>
                            </span>
                            {thread.SharedNews.published_at && (
                                <span className="text-xs text-white/70">
                                    • {new Date(thread.SharedNews.published_at).toLocaleDateString('th-TH')}
                                </span>
                            )}
                        </div>
                        <h4 className="font-bold text-white mb-1">{thread.SharedNews.title}</h4>
                        <p className="text-xs sm:text-sm text-white/75 line-clamp-2">{thread.SharedNews.summary}</p>
                    </div>
                </div>
            )}

            {/* Poll */}
            {thread.Poll && (() => {
                const isPollExpired = new Date(thread.Poll.expires_at) < new Date();
                const hasVoted = thread.Poll.isVoted;
                const showResults = hasVoted || isPollExpired || isOwner;

                return (
                    <div className="px-4 sm:px-5 py-3">
                        <div className="bg-black/25 rounded-2xl p-4 border border-white/15">
                            <h4 className="font-bold text-white mb-3 text-sm flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-emerald-400/20 border border-emerald-300/35 text-emerald-300 inline-flex items-center justify-center flex-shrink-0">
                                    <BarChart2 size={15} />
                                </span>
                                <span>{thread.Poll.question}</span>
                            </h4>
                            <div className="space-y-2">
                                {thread.Poll.Options?.map((opt) => {
                                    const percent = totalVotes > 0 ? Math.round(((opt.vote_count || 0) / totalVotes) * 100) : 0;
                                    return (
                                        <button
                                            type="button"
                                            key={opt.id}
                                            onClick={() => !showResults && handleVote(opt.id)}
                                            disabled={showResults}
                                            className={`relative w-full text-left py-2.5 px-3.5 rounded-xl border transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00] ${
                                                showResults
                                                    ? 'border-white/15 bg-white/5 cursor-default'
                                                    : 'border-white/25 bg-white/10 hover:border-[#fde047] hover:bg-white/15 cursor-pointer'
                                            }`}
                                        >
                                            {showResults && (
                                                <div
                                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400/30 to-amber-300/25 transition-all duration-500"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            )}
                                            <div className="relative flex justify-between items-center gap-2 z-10">
                                                <span className="text-sm font-semibold text-white break-words">
                                                    {opt.option_text || opt.text}
                                                </span>
                                                {showResults && (
                                                    <span className="text-xs text-[#fde047] font-bold flex-shrink-0">
                                                        {percent}% ({opt.vote_count || 0})
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-3 text-xs text-white/70 text-right">
                                {totalVotes} โหวต • ปิดรับ {new Date(thread.Poll.expires_at).toLocaleDateString('th-TH')}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Stats */}
            <div className="px-4 sm:px-5 py-2.5 flex justify-between text-xs sm:text-sm text-white/75 border-y border-white/10">
                <span>{likes} ถูกใจ</span>
                <span>
                    {thread.Comments?.length || 0} ความคิดเห็น • {thread.views || 0} ครั้งอ่าน
                </span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-4 gap-1 px-2 py-2">
                <button
                    type="button"
                    onClick={handleLike}
                    aria-label="ถูกใจ"
                    aria-pressed={isLiked}
                    className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl hover:bg-white/10 text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00] ${
                        isLiked ? 'text-rose-300 bg-rose-500/15' : 'text-white/85 hover:text-white'
                    }`}
                >
                    <Heart size={17} className={isLiked ? 'fill-current' : ''} />
                    <span className="hidden sm:inline">ถูกใจ</span>
                </button>
                <button
                    type="button"
                    onClick={() => onCommentClick(thread.id)}
                    aria-label="แสดงความคิดเห็น"
                    className="flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl hover:bg-white/10 text-white/85 hover:text-white text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                >
                    <MessageCircle size={17} />
                    <span className="hidden sm:inline">ตอบกลับ</span>
                </button>
                <button
                    type="button"
                    onClick={handleBookmark}
                    aria-label="บันทึกโพสต์"
                    className="flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl hover:bg-white/10 text-white/85 hover:text-white text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                >
                    <Bookmark size={17} />
                    <span className="hidden sm:inline">บันทึก</span>
                </button>
                <button
                    type="button"
                    onClick={handleShare}
                    aria-label="แชร์โพสต์"
                    className="flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl hover:bg-white/10 text-white/85 hover:text-white text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                >
                    <Share2 size={17} />
                    <span className="hidden sm:inline">แชร์</span>
                </button>
            </div>
        </article>
    );
};

export default PostCard;
