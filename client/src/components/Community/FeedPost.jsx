import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Share2, Clock, Play, Volume2, VolumeX, MoreVertical, Trash2, Flag, PenSquare, Store, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useInView } from 'react-intersection-observer';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import communityService from '../../services/communityService';
import { useAuth } from '../../context/AuthContext';

import ReadMoreText from '../common/ReadMoreText';

const FeedPost = ({ post }) => {
    const BACKGROUND_STYLES = {
        'c1': 'bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500',
        'c2': 'bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500',
        'c3': 'bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-400',
        'c4': 'bg-gradient-to-br from-green-400 to-emerald-600',
        'c5': 'bg-gradient-to-br from-slate-900 to-slate-700'
    };

    const videoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { ref: inViewRef, inView } = useInView({
        threshold: 0.6, // Trigger when 60% of element is visible
    });

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Merge refs
    const setRefs = (e) => {
        videoRef.current = e;
        inViewRef(e);
    };

    useEffect(() => {
        if (post.image_url && (post.image_url.endsWith('.mp4') || post.image_url.endsWith('.webm'))) {
            if (inView) {
                videoRef.current?.play().catch(e => {
                    if (e.name !== 'AbortError') {
                        console.log("Autoplay prevented:", e);
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

    const isVideo = (url) => {
        return url && (url.endsWith('.mp4') || url.endsWith('.webm'));
    };

    const handleShare = (e) => {
        e.stopPropagation();
        const link = `${window.location.origin}/community?threadId=${post.id}`;
        navigator.clipboard.writeText(link)
            .then(() => toast.success('คัดลอกลิงก์เรียบร้อย!'))
            .catch(() => toast.error('คัดลอกลิงก์ไม่สำเร็จ'));
    };

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: communityService.deleteThread,
        onSuccess: () => {
            toast.success('ลบกระทู้เรียบร้อยแล้ว');
            queryClient.invalidateQueries(['threads']);
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to delete thread');
        }
    });

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm('คุณลดต้องการลบกระทู้นี้ใช่หรือไม่?')) {
            deleteMutation.mutate(post.id);
        }
        setShowMenu(false);
    };

    const handleReport = (e) => {
        e.stopPropagation();
        const reason = prompt('ระบุเหตุผลในการรายงาน:');
        if (reason) {
            communityService.reportContent({
                target_type: 'thread',
                target_id: post.id,
                reason
            }).then(() => toast.success('ขอบคุณสำหรับการรายงาน เราจะตรวจสอบโดยเร็วที่สุด'))
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
                        className="text-indigo-600 hover:underline z-20 relative"
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

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 hover:border-gray-300 transition-colors relative">
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                    {post.User?.avatar ? (
                        <img src={getImageUrl(post.User.avatar)} alt={post.User.display_name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                            {post.User?.display_name ? post.User.display_name[0] : 'U'}
                        </div>
                    )}
                    <div>
                        <div className="font-semibold text-gray-900 text-sm flex items-center gap-1">
                            {post.User?.display_name || 'Unknown User'}
                            {post.User?.MyBusiness && (
                                <Link to={`/learning-center/profile/${post.User.MyBusiness.id}`} onClick={e => e.stopPropagation()} title="Visit Store">
                                    <Store size={14} className="text-indigo-600 cursor-pointer hover:scale-110 transition-transform" />
                                </Link>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(post.created_at).toLocaleString('th-TH')}
                        </div>
                    </div>
                </div>

                {/* More Options Menu */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <MoreVertical size={20} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-30 animate-fade-in">
                            {isOwner ? (
                                <>
                                    {/* <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                                        <PenSquare size={16} className="mr-2" /> แก้ไขกระทู้
                                    </button> */}
                                    <button
                                        onClick={handleDelete}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                    >
                                        <Trash2 size={16} className="mr-2" /> ลบกระทู้
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleReport}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                >
                                    <Flag size={16} className="mr-2" /> รายงานเนื้อหา
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center">
                    {post.Poll && (
                        <div className="mr-2 inline-flex items-center text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                            <BarChart2 size={16} className="mr-1" />
                            <span>Poll</span>
                        </div>
                    )}
                    {post.title}
                </h3>

                {
                    post.background_style && BACKGROUND_STYLES[post.background_style] ? (
                        <div className={`${BACKGROUND_STYLES[post.background_style]} p-8 rounded-lg min-h-[250px] flex items-center justify-center text-center shadow-inner mb-3`}>
                            <p className="text-white text-xl font-bold whitespace-pre-line break-words">{post.content}</p>
                        </div>
                    ) : (
                        <ReadMoreText className="text-gray-700 text-sm mb-3">
                            <p className="whitespace-pre-line break-words">{renderContentWithLinks(post.content)}</p>
                        </ReadMoreText>
                    )
                }

                {/* Image/Video */}
                {
                    post.image_url && (
                        <div className="rounded-lg overflow-hidden bg-black max-h-[500px] flex items-center justify-center mb-3 relative group">
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
                                            if (videoRef.current.paused) {
                                                videoRef.current.play();
                                            } else {
                                                videoRef.current.pause();
                                            }
                                        }}
                                    />
                                    <button
                                        className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-opacity opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsMuted(!isMuted);
                                        }}
                                    >
                                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                    </button>
                                </>
                            ) : (
                                <img
                                    src={getImageUrl(post.image_url)}
                                    alt={post.title}
                                    className="w-full h-full object-contain max-h-[500px]"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Could open lightbox here
                                    }}
                                />
                            )}
                        </div>
                    )
                }
            </div >

            {/* Attached News (if any) */}
            {
                post.SharedNews && (
                    <Link to={`/news/${post.SharedNews.id}`} className="block mb-3 group">
                        <div className="border border-gray-200 rounded-lg overflow-hidden flex bg-gray-50 group-hover:bg-gray-100 transition-colors">
                            {post.SharedNews.image_url && (
                                <div className="w-24 h-24 flex-shrink-0">
                                    <img src={post.SharedNews.image_url} alt="" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="p-3">
                                <div className="text-xs font-bold text-indigo-600 mb-1 uppercase">ข่าวที่เกี่ยวข้อง</div>
                                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{post.SharedNews.title}</h4>
                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{post.SharedNews.summary}</p>
                            </div>
                        </div>
                    </Link>
                )
            }

            {/* Actions */}
            <div className="flex items-center space-x-4 pt-2 border-t border-gray-100">
                <button className="flex items-center text-gray-500 hover:text-primary text-sm transition-colors">
                    <MessageCircle className="w-4 h-4 mr-1.5" />
                    <span>{post.reply_count || 0} ความคิดเห็น</span>
                </button>
                <button
                    onClick={handleShare}
                    className="flex items-center text-gray-500 hover:text-primary text-sm transition-colors"
                >
                    <Share2 className="w-4 h-4 mr-1.5" />
                    <span>แชร์</span>
                </button>
            </div>
        </div >
    );
};

export default FeedPost;
