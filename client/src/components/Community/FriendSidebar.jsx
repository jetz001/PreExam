import React, { useState, useEffect } from 'react';
import { User, MessageCircle } from 'lucide-react';
import friendService from '../../services/friendService';
import PrivateChatModal from '../chat/PrivateChatModal';

const FriendSidebar = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChatFriend, setActiveChatFriend] = useState(null);

    const fetchFriends = async () => {
        try {
            const data = await friendService.getFriends();
            setFriends(data.data || []);
        } catch (error) {
            console.error("Failed to load friends", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriends();

        // Refetch everyday 1 minute to update status if not using socket for status
        const interval = setInterval(fetchFriends, 60000);
        return () => clearInterval(interval);
    }, []);

    const isOnline = (lastActive) => {
        if (!lastActive) return false;
        const diff = new Date() - new Date(lastActive);
        return diff < 5 * 60 * 1000; // 5 minutes
    };

    if (loading) return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 sticky top-24">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                    <User size={20} className="text-indigo-600" />
                    My Friends
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                        {friends.length}
                    </span>
                </h3>

                <div className="space-y-1">
                    {friends.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-4">
                            No friends yet. Add some study partners!
                        </p>
                    ) : (
                        friends.map(friend => {
                            const online = isOnline(friend.last_active_at);
                            return (
                                <div
                                    key={friend.id}
                                    className="group flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                                    onClick={() => setActiveChatFriend(friend)}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden">
                                                <img
                                                    src={friend.avatar ? (friend.avatar.startsWith('http') ? friend.avatar : `${friend.avatar.startsWith('/') ? '' : '/'}${friend.avatar}`) : `https://ui-avatars.com/api/?name=${friend.display_name}`}
                                                    alt={friend.display_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            {/* Status Indicator */}
                                            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-800 ${online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-200 truncate group-hover:text-indigo-600 transition-colors">
                                                {friend.display_name}
                                            </h4>
                                            <p className="text-[10px] text-gray-400 truncate">
                                                {online ? 'Online' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 p-1 rounded-full transition-all"
                                        title="Send Message"
                                    >
                                        <MessageCircle size={16} />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <PrivateChatModal
                isOpen={!!activeChatFriend}
                friend={activeChatFriend}
                onClose={() => setActiveChatFriend(null)}
            />
        </>
    );
};

export default FriendSidebar;
