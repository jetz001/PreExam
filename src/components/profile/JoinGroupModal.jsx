import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Users, LogIn } from 'lucide-react';
import studyGroupService from '../../services/studyGroupService';
import toast from 'react-hot-toast';

const JoinGroupModal = ({ onClose, onGroupJoined }) => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [joiningId, setJoiningId] = useState(null);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await studyGroupService.getAllGroups(search);
            setGroups(res.data || []);
        } catch (error) {
            console.error("Failed to fetch groups");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchGroups();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleJoin = async (group) => {
        if (group.is_private) {
            const password = prompt("This is a private group. Please enter the password:");
            if (!password) return;
            joinWithPassword(group.id, password);
        } else {
            joinWithPassword(group.id);
        }
    };

    const joinWithPassword = async (groupId, password = null) => {
        setJoiningId(groupId);
        try {
            await studyGroupService.joinGroup(groupId, password);
            toast.success('Joined group!');
            onGroupJoined();
            // Update local state to show joined
            setGroups(prev => prev.map(g => g.id === groupId ? { ...g, isJoined: true } : g));
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to join');
        } finally {
            setJoiningId(null);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                    <h3 className="text-lg font-bold">Find Study Groups</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search groups by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 p-2.5 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <p className="text-center text-gray-500 py-8">Loading available groups...</p>
                    ) : groups.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No groups found using "{search}".</p>
                    ) : (
                        groups.map(group => (
                            <div key={group.id} className="flex justify-between items-center p-4 border rounded-xl dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-white">{group.name}</h4>
                                    <p className="text-sm text-gray-500 mb-1">{group.subject}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><Users size={12} /> {group.memberCount} members</span>
                                        {/* <span>{group.is_private ? 'Private' : 'Public'}</span> */}
                                    </div>
                                </div>
                                {group.isJoined ? (
                                    <button disabled className="px-4 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium cursor-default">
                                        Joined
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleJoin(group)}
                                        disabled={joiningId === group.id}
                                        className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {joiningId === group.id ? 'Joining...' : <><LogIn size={14} />Join</>}
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default JoinGroupModal;
