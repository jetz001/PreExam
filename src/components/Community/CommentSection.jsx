import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Heart, Reply, Send, Store, MessageSquare, X } from 'lucide-react';
import authService from '../../services/authService';
import RichText from './RichText';

const CommentItem = ({ comment, onReply, depth = 0 }) => {
    const [likes, setLikes] = useState(comment.likes || 0);
    const [isLiked, setIsLiked] = useState(false);

    const isTooDeep = depth > 3;

    const getImageUrl = (path) => {
        if (!path) return `https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff`;
        if (path.startsWith('http')) return path;
        return `${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const likeMutation = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('token');
            return axios.post(
                `/api/community/comments/${comment.id}/like`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: (data) => {
            setLikes(data.data.likes);
        },
    });

    const handleLike = () => {
        setIsLiked(true);
        likeMutation.mutate();
    };

    const authorName = comment.User?.display_name || 'ผู้ใช้งาน';
    const hasValidDate = comment.created_at && !isNaN(new Date(comment.created_at).getTime());

    return (
        <div className={`flex flex-col space-y-2 ${depth > 0 ? 'ml-3 sm:ml-7 border-l-2 border-white/15 pl-3' : ''} mt-3`}>
            <div className="flex gap-2.5">
                <img
                    src={getImageUrl(comment.User?.avatar)}
                    alt={authorName}
                    className="w-8 h-8 rounded-full object-cover border border-white/30 flex-shrink-0"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=4f46e5&color=fff`;
                    }}
                />
                <div className="flex-1 min-w-0 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 shadow-sm">
                    <div className="font-bold text-sm text-white flex items-center gap-1.5 flex-wrap">
                        <span className="truncate">{authorName}</span>
                        {comment.User?.MyBusiness && (
                            <Link
                                to={`/learning-center/profile/${comment.User.MyBusiness.id}`}
                                title="เยี่ยมชมสถาบัน"
                                aria-label="เยี่ยมชมสถาบัน"
                                className="text-[#fde047] hover:scale-110 transition-transform"
                            >
                                <Store size={13} />
                            </Link>
                        )}
                    </div>
                    <div className="text-white/90 text-sm whitespace-pre-wrap break-words mt-0.5 leading-relaxed">
                        <RichText content={comment.content} />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 ml-10 text-xs text-white/70">
                <span>{hasValidDate ? formatDistanceToNow(new Date(comment.created_at), { locale: th, addSuffix: true }) : 'เมื่อสักครู่'}</span>
                <button
                    type="button"
                    onClick={handleLike}
                    className={`font-bold hover:text-white transition-colors inline-flex items-center gap-1 rounded px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00] ${
                        isLiked ? 'text-rose-300' : ''
                    }`}
                >
                    <Heart size={12} className={isLiked ? 'fill-current' : ''} />
                    <span>ถูกใจ {likes > 0 && `(${likes})`}</span>
                </button>
                {!isTooDeep && (
                    <button
                        type="button"
                        onClick={() => onReply(comment)}
                        className="font-bold hover:text-white transition-colors inline-flex items-center gap-1 rounded px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                    >
                        <Reply size={12} />
                        <span>ตอบกลับ</span>
                    </button>
                )}
            </div>

            {comment.Replies && comment.Replies.length > 0 && (
                <div className="mt-1">
                    {comment.Replies.map((reply) => (
                        <CommentItem key={reply.id} comment={reply} onReply={onReply} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const CommentSection = ({ threadId }) => {
    const [replyTo, setReplyTo] = useState(null);
    const [newComment, setNewComment] = useState('');
    const queryClient = useQueryClient();

    const buildCommentTree = (flatComments) => {
        const map = {};
        const roots = [];

        flatComments.forEach((c) => {
            map[c.id] = { ...c, Replies: [] };
        });

        flatComments.forEach((c) => {
            if (c.parent_id !== null && map[c.parent_id]) {
                map[c.parent_id].Replies.push(map[c.id]);
            } else {
                roots.push(map[c.id]);
            }
        });

        return roots;
    };

    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['comments', threadId],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/community/comments/${threadId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            return buildCommentTree(res.data || []);
        },
    });

    const mutation = useMutation({
        mutationFn: async (content) => {
            const token = localStorage.getItem('token');
            return axios.post(
                '/api/community/comments',
                {
                    thread_id: threadId,
                    content,
                    parent_id: replyTo ? replyTo.id : null,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            setNewComment('');
            setReplyTo(null);
            queryClient.invalidateQueries(['comments', threadId]);
            queryClient.invalidateQueries(['threads']);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        mutation.mutate(newComment);
    };

    const getImageUrl = (path) => {
        if (!path) return `https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff`;
        if (path.startsWith('http')) return path;
        return `${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const currentUser = authService.getCurrentUser();

    return (
        <div className="mt-4 pt-4 border-t border-white/15">
            <h3 className="text-base sm:text-lg font-bold mb-3 text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-[#fde047]" />
                <span>ความคิดเห็น ({comments.length})</span>
            </h3>

            {isLoading ? (
                <div className="text-center py-6 text-white/70 text-sm">กำลังโหลดความคิดเห็น...</div>
            ) : (
                <div className="space-y-3 mb-16">
                    {comments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} onReply={setReplyTo} />
                    ))}
                    {comments.length === 0 && (
                        <p className="text-white/70 text-center py-6 text-sm bg-white/5 rounded-2xl border border-white/10">
                            ยังไม่มีความคิดเห็น เป็นคนแรกที่ร่วมพูดคุยเลย!
                        </p>
                    )}
                </div>
            )}

            <div className="sticky bottom-0 pt-3 pb-2 border-t border-white/15 mt-4 backdrop-blur-xl bg-[#270c56]/90 rounded-t-2xl px-1">
                {replyTo && (
                    <div className="flex justify-between items-center bg-white/10 border border-white/20 px-3 py-2 rounded-xl mb-2 text-xs sm:text-sm text-white">
                        <span>
                            ตอบกลับ: <strong>{replyTo.User?.display_name || 'ผู้ใช้งาน'}</strong>
                        </span>
                        <button
                            type="button"
                            onClick={() => setReplyTo(null)}
                            aria-label="ยกเลิกการตอบกลับ"
                            className="text-[#fde047] hover:text-white font-bold inline-flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00] rounded"
                        >
                            <X size={14} />
                            <span>ยกเลิก</span>
                        </button>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex items-start gap-2.5">
                    <img
                        src={getImageUrl(currentUser?.avatar)}
                        alt="รูปโปรไฟล์ของฉัน"
                        className="w-9 h-9 rounded-full object-cover border border-white/30 flex-shrink-0 mt-1"
                    />
                    <div className="flex-1 relative min-w-0">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={
                                replyTo
                                    ? `ตอบกลับคุณ ${replyTo.User?.display_name || 'ผู้ใช้งาน'}...`
                                    : 'แสดงความคิดเห็น...'
                            }
                            rows={1}
                            className="w-full bg-white/10 text-white placeholder-white/60 border border-white/20 rounded-2xl pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffcc00] focus:bg-white/15 transition-colors resize-none min-h-[44px]"
                        />
                        <button
                            type="submit"
                            disabled={mutation.isPending || !newComment.trim()}
                            aria-label="ส่งความคิดเห็น"
                            className="absolute right-2 top-1.5 p-2 bg-gradient-to-r from-[#fde047] to-[#f59e0b] text-[#1a0533] rounded-xl hover:brightness-105 disabled:opacity-45 disabled:cursor-not-allowed transition-transform hover:scale-105 active:scale-95 shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                            <Send size={15} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommentSection;
