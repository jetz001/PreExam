import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Check, X, User, UserPlus } from 'lucide-react';

const FriendRequests = () => {
    const queryClient = useQueryClient();

    const { data: requests, isLoading } = useQuery({
        queryKey: ['friendRequests'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/friends/pending', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data.data;
        },
    });

    const acceptRequest = useMutation({
        mutationFn: async (friendId) => {
            const token = localStorage.getItem('token');
            return axios.post(
                '/api/friends/accept',
                { friendId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['friendRequests']);
            queryClient.invalidateQueries(['friendsList']);
        },
    });

    const declineRequest = useMutation({
        mutationFn: async (friendId) => {
            const token = localStorage.getItem('token');
            return axios.delete(`/api/friends/remove/${friendId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => queryClient.invalidateQueries(['friendRequests']),
    });

    if (isLoading) {
        return <div className="animate-pulse h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-white/10 mb-6" />;
    }

    if (!requests || requests.length === 0) return null;

    return (
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-white/15 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm">
                        <UserPlus size={18} />
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        คำขอเป็นเพื่อน
                    </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-500/30">
                    {requests.length}
                </span>
            </div>

            <ul className="divide-y divide-slate-100 dark:divide-white/10">
                {requests.map((request) => (
                    <li key={request.id} className="px-4 py-3.5 sm:px-5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            {request.avatar ? (
                                <img
                                    className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                                    src={request.avatar}
                                    alt={request.display_name}
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0">
                                    <User size={19} />
                                </div>
                            )}
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {request.display_name}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                type="button"
                                disabled={acceptRequest.isPending}
                                onClick={() => acceptRequest.mutate(request.id)}
                                aria-label={`ตอบรับคำขอเป็นเพื่อนจาก ${request.display_name}`}
                                title="ตอบรับ"
                                className="inline-flex items-center justify-center p-2 rounded-xl shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            >
                                <Check size={16} />
                            </button>
                            <button
                                type="button"
                                disabled={declineRequest.isPending}
                                onClick={() => declineRequest.mutate(request.id)}
                                aria-label={`ปฏิเสธคำขอเป็นเพื่อนจาก ${request.display_name}`}
                                title="ปฏิเสธ"
                                className="inline-flex items-center justify-center p-2 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FriendRequests;
