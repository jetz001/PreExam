import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UserMinus, User, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FriendList = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: friends, isLoading } = useQuery({
        queryKey: ['friendsList'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/friends/list', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data.data;
        },
    });

    const removeFriend = useMutation({
        mutationFn: async (friendId) => {
            const token = localStorage.getItem('token');
            return axios.delete(`/api/friends/remove/${friendId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => queryClient.invalidateQueries(['friendsList']),
    });

    if (isLoading) {
        return <div className="animate-pulse h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-white/10" />;
    }

    if (!friends || friends.length === 0) {
        return (
            <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-white/15 rounded-2xl shadow-sm p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center mx-auto mb-3">
                    <Users size={22} />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">ยังไม่มีเพื่อนในขณะนี้</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ลองค้นหาเพื่อนใหม่เพื่อร่วมติวสอบด้วยกัน</p>
            </div>
        );
    }

    return (
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-white/15 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-sm">
                        <Users size={18} />
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        เพื่อนของฉัน
                    </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-500/30">
                    {friends.length} คน
                </span>
            </div>

            <ul className="divide-y divide-slate-100 dark:divide-white/10 max-h-96 overflow-y-auto custom-scrollbar">
                {friends.map((friend) => (
                    <li
                        key={friend.id}
                        className="px-4 py-3.5 sm:px-5 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
                    >
                        <button
                            type="button"
                            className="flex items-center gap-3 min-w-0 flex-1 text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            onClick={() => navigate(`/profile/${friend.id}`)}
                        >
                            {friend.avatar ? (
                                <img
                                    className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                                    src={friend.avatar}
                                    alt={friend.display_name}
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0">
                                    <User size={19} />
                                </div>
                            )}
                            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {friend.display_name}
                            </span>
                        </button>

                        <button
                            type="button"
                            disabled={removeFriend.isPending}
                            onClick={() => {
                                if (confirm(`ยืนยันลบเพื่อน ${friend.display_name}?`)) {
                                    removeFriend.mutate(friend.id);
                                }
                            }}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 flex-shrink-0"
                            title="ลบเพื่อน"
                            aria-label={`ลบเพื่อน ${friend.display_name}`}
                        >
                            <UserMinus size={18} />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FriendList;
