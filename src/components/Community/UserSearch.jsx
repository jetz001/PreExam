import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, User, UserPlus, X } from 'lucide-react';
import FriendButton from './FriendButton';
import { useNavigate } from 'react-router-dom';

const UserSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm.trim());
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: users, isLoading } = useQuery({
        queryKey: ['userSearch', debouncedTerm],
        queryFn: async () => {
            if (!debouncedTerm) return [];
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/users/search?q=${encodeURIComponent(debouncedTerm)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data.data;
        },
        enabled: !!debouncedTerm,
    });

    return (
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-white/15 rounded-2xl shadow-sm overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                    <UserPlus size={18} />
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    ค้นหาเพื่อนใหม่
                </h3>
            </div>

            <div className="p-4 sm:p-5">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <input
                        type="text"
                        aria-label="ค้นหาผู้ใช้งานจากชื่อ"
                        className="block w-full pl-10 pr-9 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="ค้นหาจากชื่อ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            aria-label="ล้างคำค้นหา"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-800 dark:hover:text-white focus-visible:outline-none"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                <div className="mt-4 space-y-2">
                    {isLoading && (
                        <div className="text-center text-slate-600 dark:text-slate-300 text-sm py-4">กำลังค้นหา...</div>
                    )}

                    {users && users.length === 0 && debouncedTerm && !isLoading && (
                        <div className="text-center text-slate-600 dark:text-slate-300 text-sm py-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-white/10">
                            ไม่พบผู้ใช้งานที่ตรงกับ &ldquo;{debouncedTerm}&rdquo;
                        </div>
                    )}

                    {users &&
                        users.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between gap-2 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/70 rounded-xl transition-colors"
                            >
                                <button
                                    type="button"
                                    className="flex items-center flex-1 min-w-0 text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    onClick={() => navigate(`/profile/${user.id}`)}
                                >
                                    {user.avatar ? (
                                        <img
                                            className="h-10 w-10 rounded-full object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700"
                                            src={user.avatar}
                                            alt={user.display_name}
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0">
                                            <User size={19} />
                                        </div>
                                    )}
                                    <div className="ml-3 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                            {user.display_name}
                                        </p>
                                    </div>
                                </button>
                                <FriendButton targetUserId={user.id} />
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default UserSearch;
