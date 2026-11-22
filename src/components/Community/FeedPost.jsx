import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    MessageCircle,
    Share2,
    Clock,
    Volume2,
    VolumeX,
    MoreVertical,
    Trash2,
    Flag,
    Store,
    BarChart2,
    Newspaper,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useInView } from 'react-intersection-observer';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import communityService from '../../services/communityService';
import { useAuth } from '../../context/AuthContext';
import ReadMoreText from '../common/ReadMoreText';

const BACKGROUND_STYLES = {
    c1: 'bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500',
    c2: 'bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500',
    c3: 'bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-400',
    c4: 'bg-gradient-to-br from-green-400 to-emerald-600',
    c5: 'bg-gradient-to-br from-slate-900 to-slate-700',
};

const FeedPost = ({ post }) => {
    const videoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { ref: inViewRef, inView } = useInView({
        threshold: 0.6,
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setShowMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const setRefs = (e) => {
        videoRef.current = e;
        inViewRef(e);
    };

    useEffect(() => {
        if (post.image_url && (post.image_url.endsWith('.mp4') || post.image_url.endsWith('.webm'))) {
            if (inView) {
                videoRef.current?.play().catch((e) => {
                    if (e.name !== 'AbortError') {
                        console.log('Autoplay prevented:', e);
                    }
                });
            } else {
                videoRef.current?.pause();
            }
        }
    }, [inView, post.image_url]);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const isVideo = (url) => url && (url.endsWith('.mp4') || url.endsWith('.webm'));

    const handleShare = (e) => {
        e.stopPropagation();
        const link = `${window.location.origin}/community?threadId=${post.id}`;
        navigator.clipboard
            .writeText(link)
            .then(() => toast.success('คัดลอกลิงก์เรียบร้อย!'))
            .catch(() => toast.error('คัดลอกลิงก์ไม่สำเร็จ'));
    };

    const deleteMutation = useMutation({
        mutationFn: communityService.deleteThread,
        onSuccess: () => {
            toast.success('ลบกระทู้เรียบร้อยแล้ว');
            queryClient.invalidateQueries(['threads']);
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'ไม่สามารถลบกระทู้ได้');
        },
    });

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm('คุณต้องการลบกระทู้นี้ใช่หรือไม่?')) {
            deleteMutation.mutate(post.id);
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
                    target_id: post.id,
                    reason,
                })
                .then(() => toast.success('ขอบคุณสำหรับการรายงาน เราจะตรวจสอบโดยเร็วที่สุด'))
                .catch(() => toast.error('เกิดข้อผิดพลาดในการส่งรายงาน'));
        }
        setShowMenu(false);
    };

    const renderContentWithLinks = (text) => {
        if (!text) return null;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex).map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={index}
                        href={`/safety?target=${encodeURIComponent(part)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline z-20 relative break-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    const isOwner = user && post.user_id === user.id;
    const authorName = post.User?.display_name || 'ผู้ใช้งาน';

    return (
        <article className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-slate-200/80 dark:border-white/15 mb-4 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-md transition-all relative min-w-0">
            {/* Header */}
            <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    {post.User?.avatar ? (
                        <img
                            src={getImageUrl(post.User.avatar)}
                            alt={authorName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm flex-shrink-0">
                            {authorName[0]}
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 flex-wrap">
                            <span className="truncate">{authorName}</span>
                            {post.User?.MyBusiness && (
                                <Link
                                    to={`/learning-center/profile/${post.User.MyBusiness.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    title="เยี่ยมชมสถาบัน"
                                    aria-label="เยี่ยมชมสถาบัน"
                                    className="inline-flex items-center p-1 rounded-md bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    <Store size={13} />
                                </Link>
                            )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>
                                {post.created_at && !isNaN(new Date(post.created_at).getTime())
                                    ? new Date(post.created_at).toLocaleString('th-TH')
                                    : 'เมื่อสักครู่'}
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
                        className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-9 w-44 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 dark:border-white/15 py-1.5 z-30">
                            {isOwner ? (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="w-full text-left px-4 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2 focus-visible:outline-none"
                                >
                                    <Trash2 size={15} />
                                    <span>ลบกระทู้</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleReport}
                                    className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 focus-visible:outline-none"
                                >
                                    <Flag size={15} />
                                    <span>รายงานเนื้อหา</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="mb-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2 flex-wrap break-words">
                    {post.Poll && (
                        <span className="inline-flex items-center gap-1 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold">
                            <BarChart2 size={13} />
                            <span>โพล</span>
                        </span>
                    )}
                    <span>{post.title}</span>
                </h3>

                {post.background_style && BACKGROUND_STYLES[post.background_style] ? (
                    <div
                        className={`${BACKGROUND_STYLES[post.background_style]} p-7 rounded-2xl min-h-[220px] flex items-center justify-center text-center shadow-inner mb-3`}
                    >
                        <p className="text-white text-xl font-bold whitespace-pre-line break-words">{post.content}</p>
                    </div>
                ) : (
                    <ReadMoreText className="text-slate-700 dark:text-slate-300 text-sm mb-3">
                        <p className="whitespace-pre-line break-words leading-relaxed">
                            {renderContentWithLinks(post.content)}
                        </p>
                    </ReadMoreText>
                )}

                {post.image_url && (
                    <div className="rounded-2xl overflow-hidden bg-slate-950 max-h-[500px] flex items-center justify-center mb-3 relative group border border-slate-200/50 dark:border-white/10">
                        {isVideo(post.image_url) ? (
                            <>
                                <video
                                    ref={setRefs}
                                    src={getImageUrl(post.image_url)}
                                    className="w-full h-full max-h-[500px] object-contain"
                                    loop
                                    muted={isMuted}
                                    playsInline
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (videoRef.current?.paused) {
                                            videoRef.current.play();
                                        } else {
                                            videoRef.current?.pause();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    aria-label={isMuted ? 'เปิดเสียงวิดีโอ' : 'ปิดเสียงวิดีโอ'}
                                    className="absolute bottom-3 right-3 bg-black/65 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/80 transition-opacity opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMuted(!isMuted);
                                    }}
                                >
                                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                </button>
                            </>
                        ) : (
                            <img
                                src={getImageUrl(post.image_url)}
                                alt={post.title}
                                className="w-full h-full object-contain max-h-[500px]"
                                loading="lazy"
                                onClick={(e) => e.stopPropagation()}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Attached News */}
            {post.SharedNews && (
                <Link
                    to={`/news/${post.SharedNews.id}`}
                    className="block mb-3 group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    <div className="border border-slate-200 dark:border-white/15 rounded-2xl overflow-hidden flex bg-slate-50 dark:bg-slate-800/70 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                        {post.SharedNews.image_url && (
                            <div className="w-24 h-24 flex-shrink-0">
                                <img
                                    src={post.SharedNews.image_url}
                                    alt={post.SharedNews.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="p-3 min-w-0 flex-1">
                            <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                                <Newspaper size={12} />
                                <span>ข่าวที่เกี่ยวข้อง</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                                {post.SharedNews.title}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                                {post.SharedNews.summary}
                            </p>
                        </div>
                    </div>
                </Link>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-semibold px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.reply_count || 0} ความคิดเห็น</span>
                </button>
                <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-semibold px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    <Share2 className="w-4 h-4" />
                    <span>แชร์</span>
                </button>
            </div>
        </article>
    );
};

export default FeedPost;
