import React, { useState, useEffect } from 'react';
import { Users, MessageCircle } from 'lucide-react';
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
            console.error('Failed to load friends', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriends();
        const interval = setInterval(fetchFriends, 60000);
        return () => clearInterval(interval);
    }, []);

    const isOnline = (lastActive) => {
        if (!lastActive) return false;
        const diff = new Date() - new Date(lastActive);
        return diff < 5 * 60 * 1000;
    };

    if (loading) {
        return (
            <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-white/15 rounded-2xl shadow-sm p-5 animate-pulse">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2 mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-white/15 rounded-2xl shadow-sm p-5 sticky top-24">
                <h3 className="text-base font-extrabold mb-4 flex items-center justify-between text-slate-900 dark:text-white">
                    <span className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-sm">
                            <Users size={16} />
                        </span>
                        <span>เพื่อนของฉัน</span>
                    </span>
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200/70 dark:border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                        {friends.length}
                    </span>
                </h3>

                <div className="space-y-1">
                    {friends.length === 0 ? (
                        <div className="text-center py-6 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-white/10">
                            <Users size={22} className="mx-auto text-slate-400 mb-2" />
                            <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">
                                ยังไม่มีเพื่อนในรายชื่อ ลองชวนเพื่อนมาร่วมติวสอบได้เลย!
                            </p>
                        </div>
                    ) : (
                        friends.map((friend) => {
                            const online = isOnline(friend.last_active_at);
                            const avatarSrc = friend.avatar
                                ? friend.avatar.startsWith('http')
                                    ? friend.avatar
                                    : `${friend.avatar.startsWith('/') ? '' : '/'}${friend.avatar}`
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.display_name || 'U')}&background=4f46e5&color=fff`;

                            return (
                                <div
                                    key={friend.id}
                                    role="button"
                                    tabIndex={0}
                                    className="group flex justify-between items-center p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    onClick={() => setActiveChatFriend(friend)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setActiveChatFriend(friend);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden min-w-0">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <img
                                                    src={avatarSrc}
                                                    alt={friend.display_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div
                                                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                                                    online ? 'bg-emerald-500' : 'bg-slate-400'
                                                }`}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {friend.display_name}
                                            </h4>
                                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                                                {online ? 'ออนไลน์' : 'ออฟไลน์'}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveChatFriend(friend);
                                        }}
                                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 p-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/15 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex-shrink-0"
                                        title="ส่งข้อความ"
                                        aria-label={`ส่งข้อความถึง ${friend.display_name}`}
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
