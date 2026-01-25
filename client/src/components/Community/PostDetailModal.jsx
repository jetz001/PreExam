import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { X } from 'lucide-react';
import PostCard from './PostCard';
import CommentSection from './CommentSection';

const PostDetailModal = ({ thread: initialThread, onClose }) => {

    // Fetch fresh details (likes, views, isLiked)
    const { data: thread, isLoading } = useQuery({
        queryKey: ['thread', initialThread.id],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/community/threads/${initialThread.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data;
        },
        initialData: (initialThread && initialThread.User) ? initialThread : undefined
    });

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!thread) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center overflow-y-auto animate-fade-in backdrop-blur-sm">
            <div
                className="bg-white w-full max-w-2xl min-h-[50vh] max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden relative text-gray-900"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-gray-100 p-2 rounded-full hover:bg-gray-200 text-gray-600 shadow-sm transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="overflow-y-auto p-4 custom-scrollbar">
                    <div className="pointer-events-auto">
                        {/* Key force re-render if needed, but react query update should handle it. 
                            However, PostCard uses internal state initialized from props. 
                            If props change, internal state (useState) does NOT update automatically unless we add useEffect.
                            
                            Let's check PostCard again. It HAS useEffect for likes, but NOT for isLiked.
                            I need to fix PostCard to sync isLiked too.
                        */}
                        <PostCard key={thread.id + thread.isLiked} thread={thread} onCommentClick={() => { }} isDetail={true} />
                    </div>

                    <CommentSection threadId={thread.id} />
                </div>
            </div>
        </div>
    );
};

export default PostDetailModal;
