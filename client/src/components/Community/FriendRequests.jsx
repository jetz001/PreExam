import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Check, X, User } from 'lucide-react';

const FriendRequests = () => {
    const queryClient = useQueryClient();

    const { data: requests, isLoading } = useQuery({
        queryKey: ['friendRequests'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:3000/api/friends/pending', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data.data;
        }
    });

    const acceptRequest = useMutation({
        mutationFn: async (friendId) => {
            const token = localStorage.getItem('token');
            return axios.post('http://localhost:3000/api/friends/accept', { friendId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['friendRequests']);
            queryClient.invalidateQueries(['friendsList']);
        }
    });

    const declineRequest = useMutation({
        mutationFn: async (friendId) => {
            const token = localStorage.getItem('token');
            return axios.delete(`http://localhost:3000/api/friends/remove/${friendId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => queryClient.invalidateQueries(['friendRequests'])
    });

    if (isLoading) return <div className="animate-pulse h-20 bg-gray-100 rounded-lg"></div>;

    if (!requests || requests.length === 0) return null;

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    คำขอเป็นเพื่อน ({requests.length})
                </h3>
            </div>
            <ul className="divide-y divide-gray-200">
                {requests.map((request) => (
                    <li key={request.id} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <div className="flex items-center">
                            {request.avatar ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={request.avatar} alt={request.display_name} />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                    <User size={20} />
                                </div>
                            )}
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{request.display_name}</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => acceptRequest.mutate(request.id)}
                                className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <Check size={16} />
                            </button>
                            <button
                                onClick={() => declineRequest.mutate(request.id)}
                                className="inline-flex items-center p-1.5 border border-gray-300 rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
