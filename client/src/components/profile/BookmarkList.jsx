import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, ExternalLink } from 'lucide-react';
import bookmarkService from '../../services/bookmarkService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import QuestionDetailModal from './QuestionDetailModal';

const BookmarkList = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);
    const navigate = useNavigate();

    const fetchBookmarks = async () => {
        try {
            const res = await bookmarkService.getBookmarks();
            setItems(res.data || []);
        } catch (error) {
            console.error("Failed to load bookmarks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const handleRemove = async (id) => {
        try {
            await bookmarkService.removeBookmark(id);
            toast.success("Bookmark removed");
            setItems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            toast.error("Failed to remove bookmark");
        }
    };

    const handleNavigate = (type, targetId) => {
        if (type === 'news') navigate(`/news/${targetId}`);
        else if (type === 'thread') navigate(`/community?threadId=${targetId}`);
        else if (type === 'question') setSelectedQuestionId(targetId);
    };

    if (loading) return <div>Loading bookmarks...</div>;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Bookmark size={20} /> Saved Items</h3>
            <div className="space-y-3">
                {items.length === 0 ? (
                    <p className="text-gray-500 py-4 text-center">No bookmarks yet.</p>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg flex justify-between items-center group">
                            <div className="cursor-pointer flex-1" onClick={() => handleNavigate(item.target_type, item.target_id)}>
                                <span className={`text-xs font-bold uppercase mr-2 border px-1 rounded bg-white dark:bg-slate-800 
                                    ${item.target_type === 'question' ? 'text-green-500 border-green-200' : 'text-blue-500 border-blue-200'}`}>
                                    {item.target_type}
                                </span>
                                <span className="text-gray-800 dark:text-gray-200 font-medium hover:text-blue-600 transition line-clamp-1">{item.title || 'Untitled Item'}</span>
                            </div>
                            <button
                                onClick={() => handleRemove(item.id)}
                                className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition opacity-0 group-hover:opacity-100"
                                title="Remove"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {selectedQuestionId && (
                <QuestionDetailModal
                    questionId={selectedQuestionId}
                    onClose={() => setSelectedQuestionId(null)}
                />
            )}
        </div>
    );
};

export default BookmarkList;
