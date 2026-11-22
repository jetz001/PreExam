import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { X, MessageSquare } from 'lucide-react';
import PostCard from './PostCard';
import CommentSection from './CommentSection';

const PostDetailModal = ({ thread: initialThread, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const { data: thread, isLoading } = useQuery({
        queryKey: ['thread', initialThread.id],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/community/threads/${initialThread.id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            return res.data;
        },
        initialData: initialThread && initialThread.User ? initialThread : undefined,
    });

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-slate-950/75 z-50 flex justify-center items-center backdrop-blur-md">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-[#fde047]" />
            </div>
        );
    }

    if (!thread) return null;

    return (
        <div
            className="fixed inset-0 bg-slate-950/75 z-50 flex justify-center items-center p-3 sm:p-4 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-detail-title"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative text-white border border-white/20 bg-gradient-to-b from-[#3b1578]/95 to-[#22094d]/95 backdrop-blur-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Sticky Header */}
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-white/15 bg-black/20 flex-shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/40 text-[#fde047] inline-flex items-center justify-center flex-shrink-0">
                            <MessageSquare size={16} />
                        </span>
                        <h2 id="post-detail-title" className="font-extrabold text-sm sm:text-base text-white truncate">
                            {thread.title || 'รายละเอียดกระทู้'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="ปิดหน้าต่าง"
                        className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00] flex-shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-3 sm:p-5 custom-scrollbar">
                    <div className="pointer-events-auto">
                        <PostCard key={thread.id + String(thread.isLiked)} thread={thread} onCommentClick={() => {}} isDetail={true} />
                    </div>

                    <CommentSection threadId={thread.id} />
                </div>
            </div>
        </div>
    );
};

export default PostDetailModal;
