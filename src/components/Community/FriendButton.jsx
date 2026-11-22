import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UserPlus, UserCheck, Clock } from 'lucide-react';
import authService from '../../services/authService';

const FriendButton = ({ targetUserId, className = '', variant = 'default' }) => {
    const queryClient = useQueryClient();
    const currentUser = authService.getCurrentUser();
    const isSelf = !currentUser || !targetUserId || String(currentUser.id) === String(targetUserId);

    const { data: statusObj, isLoading } = useQuery({
        queryKey: ['friendStatus', targetUserId],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/friends/check/${targetUserId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        },
        enabled: !isSelf,
    });

    const sendRequest = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('token');
            return axios.post(
                '/api/friends/request',
                { friendId: targetUserId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => queryClient.invalidateQueries(['friendStatus', targetUserId]),
    });

    const acceptRequest = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('token');
            return axios.post(
                '/api/friends/accept',
                { friendId: targetUserId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => queryClient.invalidateQueries(['friendStatus', targetUserId]),
    });

    const removeFriend = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('token');
            return axios.delete(`/api/friends/remove/${targetUserId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => queryClient.invalidateQueries(['friendStatus', targetUserId]),
    });

    if (isSelf) return null;

    if (isLoading) {
        return (
            <div
                className={`w-8 h-8 animate-pulse rounded-xl ${
                    variant === 'glass' ? 'bg-white/15' : 'bg-slate-200 dark:bg-slate-700'
                }`}
            />
        );
    }

    const status = statusObj?.status;
    const isPending = sendRequest.isPending || acceptRequest.isPending || removeFriend.isPending;

    const baseClasses =
        'inline-flex items-center justify-center p-1.5 rounded-xl border transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';

    if (status === 'friends') {
        const tone =
            variant === 'glass'
                ? 'bg-emerald-500/20 border-emerald-300/35 text-emerald-200 hover:bg-rose-500/25 hover:border-rose-300/40 hover:text-rose-200'
                : 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600';
        return (
            <button
                type="button"
                disabled={isPending}
                onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('เลิกเป็นเพื่อน?')) removeFriend.mutate();
                }}
                className={`${baseClasses} ${tone} ${className}`}
                title="เป็นเพื่อนกันแล้ว (คลิกเพื่อเลิกเป็นเพื่อน)"
                aria-label="เป็นเพื่อนกันแล้ว (คลิกเพื่อเลิกเป็นเพื่อน)"
            >
                <UserCheck size={17} />
            </button>
        );
    }

    if (status === 'sent') {
        const tone =
            variant === 'glass'
                ? 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200';
        return (
            <button
                type="button"
                disabled={isPending}
                onClick={(e) => {
                    e.stopPropagation();
                    removeFriend.mutate();
                }}
                className={`${baseClasses} ${tone} ${className}`}
                title="ส่งคำขอแล้ว (คลิกเพื่อยกเลิก)"
                aria-label="ส่งคำขอเป็นเพื่อนแล้ว (คลิกเพื่อยกเลิก)"
            >
                <Clock size={17} />
            </button>
        );
    }

    if (status === 'received') {
        const tone =
            variant === 'glass'
                ? 'bg-amber-400/25 border-amber-300/45 text-[#fde047] hover:bg-amber-400/35'
                : 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/35 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100';
        return (
            <button
                type="button"
                disabled={isPending}
                onClick={(e) => {
                    e.stopPropagation();
                    acceptRequest.mutate();
                }}
                className={`${baseClasses} ${tone} ${className}`}
                title="ตอบรับคำขอ"
                aria-label="ตอบรับคำขอเป็นเพื่อน"
            >
                <UserPlus size={17} />
            </button>
        );
    }

    const defaultTone =
        variant === 'glass'
            ? 'bg-white/10 border-white/20 text-white/85 hover:bg-white/20 hover:text-white'
            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600';

    return (
        <button
            type="button"
            disabled={isPending}
            onClick={(e) => {
                e.stopPropagation();
                sendRequest.mutate();
            }}
            className={`${baseClasses} ${defaultTone} ${className}`}
            title="เพิ่มเพื่อน"
            aria-label="เพิ่มเพื่อน"
        >
            <UserPlus size={17} />
        </button>
    );
};

export default FriendButton;
