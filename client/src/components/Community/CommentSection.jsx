import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Heart, Reply, Send, Store } from 'lucide-react';
import authService from '../../services/authService';
import RichText from './RichText';

const CommentItem = ({ comment, onReply, depth = 0 }) => {
    const [likes, setLikes] = useState(comment.likes || 0);
    const [isLiked, setIsLiked] = useState(false);

    // Limit depth to prevent UI breaking, though backend supports infinite. 
    // Usually flatten or indent up to 3-4 levels.
    const isTooDeep = depth > 3;

    const getImageUrl = (path) => {
        if (!path) return `https://ui-avatars.com/api/?name=User&background=random`;
        if (path.startsWith('http')) return path;
        return `${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const likeMutation = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('token');
            return axios.post(`/api/community/comments/${comment.id}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: (data) => {
            setLikes(data.data.likes);
        }
    });

    const handleLike = () => {
        setIsLiked(true);
        likeMutation.mutate();
    };

    return (
        <div className={`flex flex-col space-y-2 ${depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-2' : ''} mt-3`}>
            <div className="flex space-x-2">
                <img
                    src={getImageUrl(comment.User?.avatar)}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-2">
                    <div className="font-bold text-sm text-gray-900 flex items-center gap-1">
                        {comment.User?.display_name}
                        {comment.User?.MyBusiness && (
                            <Link to={`/learning-center/profile/${comment.User.MyBusiness.id}`} title="Visit Store">
                                <Store size={12} className="text-indigo-600 cursor-pointer hover:scale-110 transition-transform" />
                            </Link>
                        )}
                    </div>
                    <div className="text-gray-800 text-sm whitespace-pre-wrap">
                        <RichText content={comment.content} />
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-4 ml-10 text-xs text-gray-500">
                <span>{formatDistanceToNow(new Date(comment.created_at), { locale: th })}</span>
                <button
                    onClick={handleLike}
                    className={`font-semibold hover:underline flex items-center space-x-1 ${isLiked ? 'text-pink-600' : ''}`}
                >
                    <span>ถูกใจ {likes > 0 && `(${likes})`}</span>
                </button>
                {!isTooDeep && (
                    <button onClick={() => onReply(comment)} className="font-semibold hover:underline">ตอบกลับ</button>
                )}
            </div>

            {/* Recursive Replies */}
            {comment.Replies && comment.Replies.length > 0 && (
                <div className="mt-2">
                    {comment.Replies.map(reply => (
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

    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['comments', threadId],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/community/comments/${threadId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Need to structure flat list to nested tree
            return buildCommentTree(res.data);
        }
    });

    const mutation = useMutation({
        mutationFn: async (content) => {
            const token = localStorage.getItem('token');
            return axios.post('/api/community/comments', {
                thread_id: threadId,
                content,
                parent_id: replyTo ? replyTo.id : null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => {
            setNewComment('');
            setReplyTo(null);
            queryClient.invalidateQueries(['comments', threadId]);
            queryClient.invalidateQueries(['threads']); // Update comment count in feed
        }
    });

    const buildCommentTree = (flatComments) => {
        const map = {};
        const roots = [];

        // Use Map for O(1) access
        flatComments.forEach((c, i) => {
            map[c.id] = { ...c, Replies: [] }; // Initialize with Replies array
        });

        flatComments.forEach(c => {
            if (c.parent_id !== null && map[c.parent_id]) {
                map[c.parent_id].Replies.push(map[c.id]);
            } else {
                roots.push(map[c.id]);
            }
        });

        return roots;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        mutation.mutate(newComment);
    };

    const getImageUrl = (path) => {
        if (!path) return `https://ui-avatars.com/api/?name=User&background=random`;
        if (path.startsWith('http')) return path;
        return `${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const currentUser = authService.getCurrentUser();

    return (
        <div className="mt-4 pt-4 border-t">
            <h3 className="text-lg font-bold mb-4 text-gray-900">ความคิดเห็น ({comments.length})</h3>

            {isLoading ? <div className="text-center py-4">กำลังโหลด...</div> : (
                <div className="space-y-4 mb-20">
                    {comments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} onReply={setReplyTo} />
                    ))}
                    {comments.length === 0 && <p className="text-gray-400 text-center py-4">ยังไม่มีความคิดเห็น เป็นคนแรกเลย!</p>}
                </div>
            )}

            {/* Input Fixed at Bottom or inline? Inline is better for modal */}
            <div className="sticky bottom-0 bg-white pt-2 pb-4 border-t mt-4">
                {replyTo && (
                    <div className="flex justify-between bg-gray-100 p-2 rounded-lg mb-2 text-sm">
                        <span>ตอบกลับ: <strong>{replyTo.User?.display_name}</strong></span>
                        <button onClick={() => setReplyTo(null)} className="text-red-500 font-bold">ยกเลิก</button>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex space-x-2">
                    <img
                        src={getImageUrl(currentUser?.avatar)}
                        alt="My Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={replyTo ? `ตอบกลับคุณ ${replyTo.User?.display_name}...` : "แสดงความคิดเห็น..."}
                            className="w-full bg-gray-100 rounded-2xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-12 overflow-hidden"
                        />
                        <button type="submit" disabled={mutation.isPending} className="absolute right-2 top-2 p-1 text-indigo-600 hover:bg-indigo-100 rounded-full">
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommentSection;
