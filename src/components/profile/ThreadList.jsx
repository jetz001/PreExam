import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, MessageCircle } from 'lucide-react';
import communityService from '../../services/communityService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ThreadList = ({ userId }) => {
    // Ideally we fetch threads BY USER. But communityService likely returns all or paginated.
    // For now, let's assume we can filter or have an endpoint. 
    // If not, we might need to add getMyThreads to service/backend.
    // Let's create getMyThreads in communityService quickly.

    // For this prototype, I'll fetch recent threads and filter client-side or use a new endpoint if I can validly add it.
    // Let's stick to simple client-side filter of "getThreads" for now to save backend churn unless necessary.

    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth(); // Actually we need to filter by PROFILE user id, not current auth user (unless own profile)

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                if (userId) {
                    const data = await communityService.getUserThreads(userId);
                    setThreads(data || []);
                }
            } catch (error) {
                console.error("Failed to fetch threads");
            } finally {
                setLoading(false);
            }
        };
        fetchThreads();
    }, [userId]);

    if (loading) return <div>Loading threads...</div>;

    if (threads.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-10 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <MessageSquare size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">No Threads Yet</h3>
                <p className="text-gray-500 mb-6">Start a discussion in the community!</p>
                <button onClick={() => navigate('/community')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Go to Community
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {threads.map(thread => (
                <div key={thread.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer" onClick={() => navigate(`/community?threadId=${thread.id}`)}>
                    <div className="flex gap-4">
                        {/* Thumbnail if available logic */}
                        {thread.image_url && (
                            <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                    src={thread.image_url.startsWith('http') ? thread.image_url : thread.image_url}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%239ca3af' dy='.3em' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                                    }}
                                    alt="thumbnail"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-800 dark:text-white mb-1 line-clamp-1">{thread.title}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{thread.content}</p>

                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span className="flex items-center gap-1"><ThumbsUp size={14} /> {thread.likes || 0}</span>
                                <span className="flex items-center gap-1"><MessageCircle size={14} /> {thread.comments_count || 0}</span>
                                <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
export default ThreadList;
