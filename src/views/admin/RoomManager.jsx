import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MonitorPlay, XCircle, Users, Image as ImageIcon, Loader2 } from 'lucide-react';
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
            {/* Executive Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25">
                        <MonitorPlay size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            จัดการห้องสอบ &amp; ทรัพยากร (Room Management)
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Monitor active multiplayer exam rooms and manage room backgrounds &amp; frames
                        </p>
                    </div>
                </div>
                <span className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    {rooms.length} Active Rooms
                </span>
            </div>

            {/* Segmented Pill Tabs */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/80 p-1.5 inline-flex flex-wrap gap-1.5">
                <button
                    type="button"
                    onClick={() => setActiveTab('rooms')}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        activeTab === 'rooms'
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                >
                    <MonitorPlay size={16} />
                    <span>Active Rooms ({rooms.length})</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('assets')}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        activeTab === 'assets'
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                >
                    <ImageIcon size={16} />
                    <span>Assets (Images/Frames)</span>
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'rooms' && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                    <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
                        <h3 className="font-bold text-slate-800">Active Rooms (Multiplayer)</h3>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
                            {rooms.length} Online
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/90 text-slate-700 border-b border-slate-200/80 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Room Name</th>
                                    <th className="px-6 py-4 font-bold">Mode</th>
                                    <th className="px-6 py-4 font-bold">Participants</th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                            <div className="inline-flex items-center gap-2 font-medium">
                                                <Loader2 size={18} className="animate-spin text-indigo-600" />
                                                Loading active rooms...
                                            </div>
                                        </td>
                                    </tr>
                                ) : rooms.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-medium">
                                            No active rooms at the moment.
                                        </td>
                                    </tr>
                                ) : (
                                    rooms.map((room) => (
                                        <tr key={room.id} className="hover:bg-indigo-50/30 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/70 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                                        <MonitorPlay size={17} />
                                                    </div>
                                                    <span className="truncate">{room.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-slate-100 border border-slate-200/80 rounded-full text-xs font-semibold text-slate-700">
                                                    {room.mode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-slate-600 font-medium">
                                                    <Users size={15} className="mr-1.5 text-indigo-500" />
                                                    {room.participants}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleCloseRoom(room.id)}
                                                    className="inline-flex items-center gap-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-colors text-xs font-semibold border border-rose-200 ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                                >
                                                    <XCircle size={14} /> Force Close
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

            {activeTab === 'assets' && <AssetManager />}
        </div>
    );
};

export default RoomManager;
