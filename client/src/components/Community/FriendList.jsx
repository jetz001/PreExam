import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UserMinus, User, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FriendList = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: friends, isLoading } = useQuery({
        queryKey: ['friendsList'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:3000/api/friends/list', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data.data;
        }
    });

    const removeFriend = useMutation({
        mutationFn: async (friendId) => {
            const token = localStorage.getItem('token');
            return axios.delete(`http://localhost:3000/api/friends/remove/${friendId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => queryClient.invalidateQueries(['friendsList'])
    });

    if (isLoading) return <div className="animate-pulse h-40 bg-gray-100 rounded-lg"></div>;

    if (!friends || friends.length === 0) {
        return (
            <div className="bg-white overflow-hidden shadow rounded-lg p-6 text-center text-gray-500">
                ยังไม่มีเพื่อนในขณะนี้
            </div>
        );
    }

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    เพื่อนของฉัน ({friends.length})
                </h3>
            </div>
            <ul className="divide-y divide-gray-200 h-96 overflow-y-auto">
                {friends.map((friend) => (
                    <li key={friend.id} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center cursor-pointer" onClick={() => navigate(`/profile/${friend.id}`)}>
                            {friend.avatar ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={friend.avatar} alt={friend.display_name} />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                    <User size={20} />
                                </div>
                            )}
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{friend.display_name}</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            {/* Future chat feature placeholder */}
                            {/* <button className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50">
                                <MessageSquare size={18} />
                            </button> */}
                            <button
                                onClick={() => {
                                    if (confirm(`ยืนยันลบเพื่อน ${friend.display_name}?`)) {
                                        removeFriend.mutate(friend.id);
                                    }
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                                title="ลบเพื่อน"
                            >
                                <UserMinus size={18} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FriendList;
