import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { MessageCircle, Heart, Share2, MoreVertical, Trash2, Flag, PenSquare, Bookmark } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import communityService from '../../services/communityService';
import ReadMoreText from '../common/ReadMoreText';
import bookmarkService from '../../services/bookmarkService';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import RichText from './RichText';
import FriendButton from './FriendButton';
import toast from 'react-hot-toast';

const PostCard = ({ thread, onCommentClick, isDetail = false }) => {
    const [likes, setLikes] = useState(thread.likes);
    const [isLiked, setIsLiked] = useState(thread.isLiked || false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const socket = useSocket();

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

    const getImageUrl = (path) => {
        if (!path) return `https://ui-avatars.com/api/?name=User&background=random`;
        if (path.startsWith('http') || path.startsWith('blob:')) return path;

        // Use relative path which works for both dev (proxy) and prod
        return path.startsWith('/') ? path : `/${path}`;
    };

    const handleImageError = (e) => {
        e.target.onerror = null; // Prevent infinite loop
        e.target.src = 'https://ui-avatars.com/api/?name=Error&background=E5E7EB&color=6B7280&size=128';
    };

    const likeMutation = useMutation({
        mutationFn: async () => {
            return api.post(`/community/threads/${thread.id}/like`);
        },
        onSuccess: (data) => {
            setLikes(data.data.likes);
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: communityService.deleteThread,
        onSuccess: () => {
            toast.success('ลบกระทู้เรียบร้อยแล้ว');
            queryClient.invalidateQueries(['threads']);
            // Optionally close modal or redirect if needed, but invalidating queries handles list update
            // If in modal, might need to close it. But PostCard doesn't control modal. 
            // Ideally parent should handle closure, but let's stick to core logic.
            // Actually if deleted, the modal viewing it might break or show empty.
            // For now, let's assume user closes it or we reload.
            window.location.href = '/community'; // Force redirect to avoid stuck empty modal
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to delete thread');
        }
    });

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm('คุณลดต้องการลบกระทู้นี้ใช่หรือไม่?')) {
            deleteMutation.mutate(thread.id);
        }
        setShowMenu(false);
    };

    const handleReport = (e) => {
        e.stopPropagation();
        const reason = prompt('ระบุเหตุผลในการรายงาน:');
        if (reason) {
            communityService.reportContent({
                target_type: 'thread',
                target_id: thread.id,
                reason
            }).then(() => toast.success('ขอบคุณสำหรับการรายงาน เราจะตรวจสอบโดยเร็วที่สุด'))
                .catch(() => toast.error('เกิดข้อผิดพลาดในการส่งรายงาน'));
        }
        setShowMenu(false);
    };

    const handleBookmark = async () => {
        try {
            await bookmarkService.addBookmark({
                target_type: 'thread',
                target_id: thread.id,
                title: thread.title
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

    // Sync state with props when they change (e.g. from socket or refetch)
    useEffect(() => {
        setLikes(thread.likes);
    }, [thread.likes]);

    const handleLike = () => {
        // Optimistic toggle
        setIsLiked(prev => !prev);
        setLikes(prev => isLiked ? prev - 1 : prev + 1);

        likeMutation.mutate(null, {
            onSuccess: (data) => {
                // Sync with server truth
                setLikes(data.data.likes);
                setIsLiked(data.data.liked);
            },
            onError: () => {
                // Revert on error
                setIsLiked(prev => !prev);
                setLikes(prev => isLiked ? prev + 1 : prev - 1);
            }
        });
    };

    const handleVote = async (optionId) => {
        try {
            await api.post('/community/poll/vote', {
                pollId: thread.Poll.id,
                optionId
            });
            // Optimistic update handled by socket listener in parent or here if we listened
            // For now, rely on parent refresh or socket
        } catch (error) {
            console.error("Vote failed", error);
            if (error.response?.data?.error) alert(error.response.data.error);
        }
    };

    const totalVotes = thread.Poll ? thread.Poll.Options.reduce((acc, opt) => acc + opt.vote_count, 0) : 0;

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/community?threadId=${thread.id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            toast.success('คัดลอกลิงก์เรียบร้อยแล้ว');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            toast.error('Failed to copy link');
        });
    };

    const isOwner = user && thread.user_id === user.id;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 overflow-hidden hover:shadow-md transition-shadow relative">
            {/* Header */}
            <div className="p-4 flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    <div className={`relative ${thread.User?.plan_type === 'premium' ? 'p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-orange-300 to-yellow-600' : ''}`}>
                        <img
                            src={getImageUrl(thread.User?.avatar)}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${thread.User?.display_name || 'User'}&background=random`;
                            }}
                        />
                        {thread.User?.plan_type === 'premium' && (
                            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white text-[10px] px-1 rounded-full font-bold shadow-sm">PRO</div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-gray-900 leading-tight">{thread.User?.display_name || 'Anonymous'}</h3>
                            {thread.User && <FriendButton targetUserId={thread.User.id} />}
                        </div>
                        <span className="text-xs text-gray-500">
                            {thread.created_at && !isNaN(new Date(thread.created_at).getTime())
                                ? formatDistanceToNow(new Date(thread.created_at), { addSuffix: true, locale: th })
                                : 'เมื่อสักครู่'}
                            {' • '}
                            <span className="text-indigo-600 font-medium">{thread.category}</span>
                        </span>
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
            <div className="px-4 pb-2">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{thread.title}</h2>
                <ReadMoreText content={thread.content} forceExpanded={isDetail} className="text-gray-600 leading-relaxed">
                    <RichText content={thread.content} />
                </ReadMoreText>
            </div>

            {/* Image */}
            {thread.image_url && (
                <div className="mt-2 w-full h-64 sm:h-80 bg-gray-100 overflow-hidden">
                    {(thread.image_url.endsWith('.mp4') || thread.image_url.endsWith('.webm')) ? (
                        <video
                            src={getImageUrl(thread.image_url)}
                            controls
                            className="w-full h-full object-contain bg-black"
                        />
                    ) : (
                        <img
                            src={getImageUrl(thread.image_url)}
                            alt="Post Content"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => {
                                e.target.parentNode.style.display = 'none'; // Hide container if image fails
                            }}
                        />
                    )}
                </div>
            )}

            {/* Shared Business Post */}
            {thread.SharedBusinessPost && (
                <div className="mx-4 mt-2 border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => window.location.href = `/learning-center/profile/${thread.SharedBusinessPost.business_id}`}>
                    {(() => {
                        const images = typeof thread.SharedBusinessPost.images === 'string'
                            ? JSON.parse(thread.SharedBusinessPost.images)
                            : thread.SharedBusinessPost.images || [];

                        return images.length > 0 && (
                            <div className="h-48 w-full bg-gray-200">
                                <img
                                    src={getImageUrl(images[0])}
                                    className="w-full h-full object-cover"
                                    alt={thread.SharedBusinessPost.title}
                                />
                            </div>
                        );
                    })()}
                    <div className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                            {thread.SharedBusinessPost.Business?.logo_image && (
                                <img src={getImageUrl(thread.SharedBusinessPost.Business.logo_image)} className="w-5 h-5 rounded-full" />
                            )}
                            <span className="text-xs font-bold text-gray-700">{thread.SharedBusinessPost.Business?.name}</span>
                            <span className="text-xs text-gray-400">• {new Date(thread.SharedBusinessPost.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">{thread.SharedBusinessPost.title}</h4>
                        <div className="mt-2 text-gray-800 text-sm">
                            <ReadMoreText content={thread.SharedBusinessPost.content} forceExpanded={isDetail} />
                        </div>
                    </div>
                </div>
            )}

            {/* Shared News */}
            {
                thread.SharedNews && (
                    <div className="mx-4 mt-2 border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => window.location.href = `/news/${thread.SharedNews.id}`}>
                        {thread.SharedNews.image_url && (
                            <div className="h-48 w-full bg-gray-200">
                                <img
                                    src={thread.SharedNews.image_url}
                                    className="w-full h-full object-cover"
                                    alt={thread.SharedNews.title}
                                />
                            </div>
                        )}
                        <div className="p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold uppercase">{thread.SharedNews.category}</span>
                                <span className="text-xs text-gray-400">• {new Date(thread.SharedNews.published_at).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">{thread.SharedNews.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{thread.SharedNews.summary}</p>
                        </div>
                    </div>
                )
            }

            {/* Poll */}
            {
                thread.Poll && (() => {
                    console.log('Poll Data:', thread.Poll); // Debug Log
                    const isPollExpired = new Date(thread.Poll.expires_at) < new Date();
                    const hasVoted = thread.Poll.isVoted; // From backend
                    const showResults = hasVoted || isPollExpired || isOwner;

                    return (
                        <div className="px-4 py-3">
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <h4 className="font-bold text-gray-800 mb-3 text-sm">{thread.Poll.question}</h4>
                                <div className="space-y-2">
                                    {thread.Poll.Options.map(opt => {
                                        const percent = totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0;
                                        return (
                                            <button
                                                key={opt.id}
                                                onClick={() => !showResults && handleVote(opt.id)}
                                                disabled={showResults}
                                                className={`relative w-full text-left py-2 px-3 rounded-lg border transition-all overflow-hidden group ${showResults ? 'border-gray-200 cursor-default' : 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'}`}
                                            >
                                                {showResults && (
                                                    <div className="absolute top-0 left-0 h-full bg-indigo-100 transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                                )}
                                                <div className="relative flex justify-between items-center z-10">
                                                    <span className={`text-sm font-medium ${showResults ? 'text-gray-700' : 'text-indigo-700 font-semibold'}`}>
                                                        {opt.option_text}
                                                    </span>
                                                    {showResults && (
                                                        <span className="text-xs text-indigo-600 font-bold">{percent}% ({opt.vote_count})</span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-3 text-xs text-gray-400 text-right">
                                    {totalVotes} total votes • Ends {new Date(thread.Poll.expires_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    );
                })()
            }

            {/* Stats */}
            <div className="px-4 py-2 flex justify-between text-sm text-gray-500 border-b border-gray-50">
                <span>{likes} ถูกใจ</span>
                <span>{thread.Comments?.length || 0} ความคิดเห็น • {thread.views || 0} อ่าน</span>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center px-2 py-1">
                <button
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-gray-50 transition-colors ${isLiked ? 'text-pink-600' : 'text-gray-600'}`}
                >
                    <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                    <span>ถูกใจ</span>
                </button>
                <button
                    onClick={() => onCommentClick(thread.id)}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                >
                    <MessageCircle size={20} />
                    <span>แสดงความคิดเห็น</span>
                </button>
                <button
                    onClick={handleBookmark}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                >
                    <Bookmark size={20} />
                    <span>บันทึก</span>
                </button>
                <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                >
                    <Share2 size={20} />
                    <span>แชร์</span>
                </button>
            </div>
        </div >
    );
};

export default PostCard;
