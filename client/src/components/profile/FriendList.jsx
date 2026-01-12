import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, X, Check, Search, Users, MessageCircle } from 'lucide-react';
import friendService from '../../services/friendService';
import toast from 'react-hot-toast';
import PrivateChatModal from '../chat/PrivateChatModal';

const FriendList = () => {
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChatFriend, setActiveChatFriend] = useState(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searching, setSearching] = useState(false);

    const fetchData = async () => {
        try {
            const [friendsData, requestsData] = await Promise.all([
                friendService.getFriends(),
                friendService.getPendingRequests()
            ]);
            setFriends(friendsData.data || []);
            setRequests(requestsData.data || []);
        } catch (error) {
            console.error("Failed to load friends", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await friendService.searchUsers(searchQuery);
            setSearchResults(res.data || []);
            setIsSearching(true);
        } catch (error) {
            toast.error("Search failed");
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleSendRequest = async (userId) => {
        try {
            await friendService.sendRequest(userId);
            toast.success("Request sent!");
            // Update local state to show 'sent'
            setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, status: 'sent' } : u));
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to send request");
        }
    };

    const handleAccept = async (friendId) => {
        try {
            await friendService.acceptRequest(friendId);
            toast.success("Friend request accepted");
            fetchData();
        } catch (error) {
            toast.error("Failed to accept request");
        }
    };

    const handleDecline = async (friendId) => {
        try {
            await friendService.removeFriend(friendId);
            toast.success("Friend request declined");
            fetchData();
        } catch (error) {
            toast.error("Failed to decline");
        }
    };

    if (loading) return <div className="p-4 text-center">Loading friends...</div>;

    return (
        <div className="space-y-6">
            {/* Search Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <UserPlus size={20} className="text-blue-500" /> Find Friends
                </h3>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 p-2.5 border rounded-lg bg-gray-50 dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={searching}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        {searching ? '...' : 'Search'}
                    </button>
                </div>

                {/* Search Results */}
                {isSearching && (
                    <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        {searchResults.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No users found.</p>
                        ) : (
                            searchResults.map(user => (
                                <div key={user.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:border-slate-700 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                            <img
                                                src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`) : `https://ui-avatars.com/api/?name=${user.display_name}`}
                                                alt={user.display_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{user.display_name}</h4>
                                            <p className="text-xs text-blue-500">@{user.public_id}</p>
                                        </div>
                                    </div>

                                    {user.status === 'friends' ? (
                                        <span className="text-green-500 flex items-center gap-1 text-sm font-medium"><UserCheck size={16} /> Friend</span>
                                    ) : user.status === 'sent' ? (
                                        <span className="text-gray-500 text-sm font-medium">Request Sent</span>
                                    ) : user.status === 'received' ? (
                                        <span className="text-orange-500 text-sm font-medium">Pending Approval</span>
                                    ) : (
                                        <button
                                            onClick={() => handleSendRequest(user.id)}
                                            className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200 transition"
                                        >
                                            Add Friend
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Requests */}
            {requests.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                    <h3 className="text-lg font-bold mb-4 text-orange-600 flex items-center gap-2">
                        <Users size={20} /> Friend Requests
                    </h3>
                    <div className="space-y-3">
                        {requests.map(req => (
                            <div key={req.id} className="flex justify-between items-center bg-orange-50 dark:bg-slate-700/50 p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden shadow-sm">
                                        <img src={req.avatar || `https://ui-avatars.com/api/?name=${req.display_name}`} alt={req.display_name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{req.display_name}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleAccept(req.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1 shadow-sm transition">
                                        <Check size={14} /> Accept
                                    </button>
                                    <button onClick={() => handleDecline(req.id)} className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-300 flex items-center gap-1 transition">
                                        <X size={14} /> Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Friends */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <UserCheck size={20} className="text-green-600" /> My Friends <span className="text-sm font-normal text-gray-500">({friends.length})</span>
                </h3>
                {friends.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-slate-700/30 rounded-xl border border-dashed border-gray-300 dark:border-slate-600">
                        <Users size={40} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">No friends yet.</p>
                        <p className="text-sm text-gray-400">Search above to find study partners!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {friends.map(friend => (
                            <div key={friend.id} className="flex items-center gap-3 p-3 border rounded-xl hover:shadow-md transition bg-gray-50 dark:bg-slate-700/20 dark:border-slate-700">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shadow-sm">
                                        <img
                                            src={friend.avatar ? (friend.avatar.startsWith('http') ? friend.avatar : `${friend.avatar.startsWith('/') ? '' : '/'}${friend.avatar}`) : `https://ui-avatars.com/api/?name=${friend.display_name}`}
                                            alt={friend.display_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {/* Online Indicator */}
                                    {friend.is_online_visible && friend.last_active_at && (new Date() - new Date(friend.last_active_at) < 5 * 60 * 1000) && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-white">{friend.display_name}</h4>
                                    <p className="text-xs text-blue-500 font-medium">@{friend.public_id || 'Student'}</p>
                                </div>
                                <div className="ml-auto flex gap-1">
                                    <button
                                        onClick={() => setActiveChatFriend(friend)}
                                        className="text-gray-400 hover:text-blue-500 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                                        title="Message"
                                    >
                                        <MessageCircle size={18} />
                                    </button>
                                    <button className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition" title="Remove Friend" onClick={() => handleDecline(friend.id)}>
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Chat Modal */}
            < PrivateChatModal
                isOpen={!!activeChatFriend}
                friend={activeChatFriend}
                onClose={() => setActiveChatFriend(null)}
            />
        </div >
    );
};

export default FriendList;
