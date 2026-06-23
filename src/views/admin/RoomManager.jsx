import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MonitorPlay, XCircle, Users, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';
import AssetManager from '../../components/admin/AssetManager';

const RoomManager = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('rooms');

    const { data: rooms = [], isLoading } = useQuery({
        queryKey: ['activeRooms'],
        queryFn: adminApi.getActiveRooms
    });

    const closeRoomMutation = useMutation({
        mutationFn: adminApi.closeRoom,
        onSuccess: () => {
            queryClient.invalidateQueries(['activeRooms']);
            toast.success('Room closed successfully');
        },
        onError: () => toast.error('Failed to close room')
    });

    const handleCloseRoom = (id) => {
        if (window.confirm('Force close this room? All participants will be disconnected.')) {
            closeRoomMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Room Management</h2>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-slate-200">
                <button
                    className={`pb-3 px-4 font-bold text-sm transition-colors border-b-2 ${
                        activeTab === 'rooms' 
                        ? 'border-royal-blue-600 text-royal-blue-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                    }`}
                    onClick={() => setActiveTab('rooms')}
                >
                    <div className="flex items-center">
                        <MonitorPlay size={16} className="mr-2" />
                        Active Rooms
                    </div>
                </button>
                <button
                    className={`pb-3 px-4 font-bold text-sm transition-colors border-b-2 ${
                        activeTab === 'assets' 
                        ? 'border-royal-blue-600 text-royal-blue-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                    }`}
                    onClick={() => setActiveTab('assets')}
                >
                    <div className="flex items-center">
                        <ImageIcon size={16} className="mr-2" />
                        Assets (Images/Frames)
                    </div>
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'rooms' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-700">Active Rooms (Multiplayer)</h3>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                            {rooms.length} Online
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Room Name</th>
                                    <th className="px-6 py-4 font-semibold">Mode</th>
                                    <th className="px-6 py-4 font-semibold">Participants</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500">Loading active rooms...</td>
                                    </tr>
                                ) : rooms.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No active rooms at the moment.</td>
                                    </tr>
                                ) : (
                                    rooms.map((room) => (
                                        <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-800 flex items-center">
                                                <div className="w-8 h-8 rounded bg-royal-blue-100 text-royal-blue-600 flex items-center justify-center mr-3">
                                                    <MonitorPlay size={16} />
                                                </div>
                                                {room.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">{room.mode}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-slate-500">
                                                    <Users size={14} className="mr-1" />
                                                    {room.participants}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleCloseRoom(room.id)}
                                                    className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded transition-colors text-xs font-medium border border-red-200 flex items-center ml-auto"
                                                >
                                                    <XCircle size={14} className="mr-1" /> Force Close
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'assets' && (
                <AssetManager />
            )}
        </div>
    );
};

export default RoomManager;
