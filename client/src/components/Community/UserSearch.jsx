import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, User } from 'lucide-react';
import FriendButton from './FriendButton';
import { useNavigate } from 'react-router-dom';

const UserSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const navigate = useNavigate();

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: users, isLoading } = useQuery({
        queryKey: ['userSearch', debouncedTerm],
        queryFn: async () => {
            if (!debouncedTerm) return [];
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/users/search?q=${debouncedTerm}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data.data;
        },
        enabled: !!debouncedTerm
    });

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg h-full">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    ค้นหาเพื่อนใหม่
                </h3>
            </div>
            <div className="p-4">
                <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                        placeholder="ค้นหาจากชื่อ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="mt-4 space-y-4">
                    {isLoading && <div className="text-center text-gray-500 py-4">กำลังค้นหา...</div>}

                    {users && users.length === 0 && debouncedTerm && !isLoading && (
                        <div className="text-center text-gray-500 py-4">ไม่พบผู้ใช้งาน</div>
                    )}

                    {users && users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="flex items-center flex-1 min-w-0 mr-2 cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>
                                {user.avatar ? (
                                    <img className="h-10 w-10 rounded-full object-cover flex-shrink-0" src={user.avatar} alt={user.display_name} />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                                        <User size={20} />
                                    </div>
                                )}
                                <div className="ml-3 truncate">
                                    <p className="text-sm font-medium text-gray-900 truncate">{user.display_name}</p>
                                </div>
                            </div>
                            <FriendButton targetUserId={user.id} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserSearch;
