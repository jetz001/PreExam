import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UserPlus, UserCheck, UserMinus, Clock } from 'lucide-react';
import authService from '../../services/authService';

const FriendButton = ({ targetUserId, className = "" }) => {
    const queryClient = useQueryClient();
    const currentUser = authService.getCurrentUser();

    // Don't show button for self
    if (currentUser?.id == targetUserId) return null;

    const { data: statusObj, isLoading } = useQuery({
        queryKey: ['friendStatus', targetUserId],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/friends/check/${targetUserId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data;
        }
    });

    const sendRequest = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('token');
            return axios.post('/api/friends/request', { friendId: targetUserId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => queryClient.invalidateQueries(['friendStatus', targetUserId])
    });

    const acceptRequest = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('token');
            return axios.post('/api/friends/accept', { friendId: targetUserId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => queryClient.invalidateQueries(['friendStatus', targetUserId])
    });

    const removeFriend = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('token');
            return axios.delete(`/api/friends/remove/${targetUserId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => queryClient.invalidateQueries(['friendStatus', targetUserId])
    });

    if (isLoading) return <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>;

    const status = statusObj?.status;

    if (status === 'friends') {
        return (
            <button
                onClick={() => {
                    if (confirm('เลิกเป็นเพื่อน?')) removeFriend.mutate();
                }}
                className={`text-green-600 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100 transition-colors ${className}`}
                title="เป็นเพื่อนกันแล้ว (คลิกเพื่อเลิกเป็นเพื่อน)"
            >
                <UserCheck size={20} />
            </button>
        );
    }

    if (status === 'sent') {
        return (
            <button
                onClick={() => removeFriend.mutate()} // Remove cancels request too
                className={`text-gray-400 p-1.5 rounded-full hover:bg-gray-100 transition-colors ${className}`}
                title="ส่งคําขอแล้ว (คลิกเพื่อยกเลิก)"
            >
                <Clock size={20} />
            </button>
        );
    }

    if (status === 'received') {
        return (
            <button
                onClick={() => acceptRequest.mutate()}
                className={`text-indigo-600 bg-indigo-50 p-1.5 rounded-full hover:bg-indigo-100 transition-colors ${className}`}
                title="ตอบรับคำขอ"
            >
                <UserPlus size={20} />
            </button>
        );
    }

    return (
        <button
            onClick={() => sendRequest.mutate()}
            className={`text-gray-400 hover:text-indigo-600 p-1.5 rounded-full hover:bg-indigo-50 transition-colors ${className}`}
            title="เพิ่มเพื่อน"
        >
            <UserPlus size={20} />
        </button>
    );
};

export default FriendButton;
