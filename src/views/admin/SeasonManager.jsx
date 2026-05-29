import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Calendar, CheckCircle, XCircle, Plus, Edit2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';

const SeasonManager = () => {
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSeason, setEditingSeason] = useState(null);
    const [newSeasonId, setNewSeasonId] = useState('');
    const [newSeasonName, setNewSeasonName] = useState('');

    const { data: seasonsResponse, isLoading } = useQuery({
        queryKey: ['adminSeasons'],
        queryFn: adminApi.getSeasons
    });

    const createMutation = useMutation({
        mutationFn: adminApi.createSeason,
        onSuccess: () => {
            toast.success('Season created successfully!');
            setIsCreateModalOpen(false);
            setNewSeasonId('');
            setNewSeasonName('');
            queryClient.invalidateQueries(['adminSeasons']);
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to create season')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminApi.updateSeason(id, data),
        onSuccess: () => {
            toast.success('Season updated successfully!');
            queryClient.invalidateQueries(['adminSeasons']);
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to update season')
    });

    const seasons = seasonsResponse?.data || [];

    const handleCreate = (e) => {
        e.preventDefault();
        createMutation.mutate({
            id: newSeasonId || String(new Date().getFullYear()),
            name: newSeasonName || `Season ${newSeasonId || new Date().getFullYear()}`
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate({
            id: editingSeason.id,
            data: {
                name: editingSeason.name,
                status: editingSeason.status,
                responsible_admin_id: editingSeason.responsible_admin_id
            }
        });
        setIsEditModalOpen(false);
    };

    if (isLoading) return <div className="flex justify-center p-8 text-royal-blue-600">Loading Seasons...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
                        Rankings & Seasons
                    </h1>
                    <p className="text-gray-500 mt-1">Manage yearly seasons and leaderboard resets</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-royal-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-royal-blue-700 hover:to-indigo-700 shadow-md transition-all flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Season
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm">
                        <tr>
                            <th className="px-6 py-4 font-medium">Season ID</th>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Responsible Admin</th>
                            <th className="px-6 py-4 font-medium">Start Date</th>
                            <th className="px-6 py-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {seasons.map((season) => (
                            <tr key={season.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-gray-800">{season.id}</td>
                                <td className="px-6 py-4">{season.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        season.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {season.status === 'active' ? <CheckCircle className="w-4 h-4 mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
                                        {season.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-mono text-indigo-600 bg-indigo-50/50 rounded-md">
                                    {season.responsible_admin_id}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(season.start_date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 flex items-center space-x-3">
                                    <button
                                        onClick={() => {
                                            setEditingSeason(season);
                                            setIsEditModalOpen(true);
                                        }}
                                        className="text-indigo-500 hover:text-indigo-700 text-sm font-medium flex items-center"
                                    >
                                        <Edit2 className="w-4 h-4 mr-1" /> Edit
                                    </button>
                                    {season.status === 'active' && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm("Are you sure you want to end this season manually? Usually creating a new season handles this.")) {
                                                    updateMutation.mutate({ id: season.id, data: { status: 'completed', end_date: new Date().toISOString() } });
                                                }
                                            }}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center"
                                        >
                                            <XCircle className="w-4 h-4 mr-1" /> End Season
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {seasons.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    No seasons created yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-xl text-gray-800 flex items-center">
                                <Plus className="w-6 h-6 mr-2 text-royal-blue-600" />
                                Start New Season
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Starting a new season will automatically conclude the current active season.</p>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Season ID (e.g. 2026)</label>
                                <input
                                    type="text"
                                    value={newSeasonId}
                                    onChange={(e) => setNewSeasonId(e.target.value)}
                                    placeholder={new Date().getFullYear().toString()}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-royal-blue-500 focus:border-royal-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Season Name</label>
                                <input
                                    type="text"
                                    value={newSeasonName}
                                    onChange={(e) => setNewSeasonName(e.target.value)}
                                    placeholder={`Season ${new Date().getFullYear()}`}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-royal-blue-500 focus:border-royal-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            
                            <div className="bg-amber-50 p-4 rounded-xl flex items-start border border-amber-100">
                                <ShieldAlert className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-700">
                                    You will be automatically assigned as the responsible Admin for this new season. Leaderboard rankings will reset to zero for all players.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isLoading}
                                    className="flex-1 py-3 px-4 bg-royal-blue-600 text-white font-medium rounded-xl hover:bg-royal-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {createMutation.isLoading ? 'Starting...' : 'Start Season'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && editingSeason && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-xl text-gray-800 flex items-center">
                                <Edit2 className="w-6 h-6 mr-2 text-indigo-600" />
                                Edit Season ({editingSeason.id})
                            </h3>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Season Name</label>
                                <input
                                    type="text"
                                    value={editingSeason.name}
                                    onChange={(e) => setEditingSeason({...editingSeason, name: e.target.value})}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={editingSeason.status}
                                    onChange={(e) => setEditingSeason({...editingSeason, status: e.target.value})}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="active">ACTIVE</option>
                                    <option value="completed">COMPLETED</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Responsible Admin ID</label>
                                <input
                                    type="text"
                                    value={editingSeason.responsible_admin_id}
                                    onChange={(e) => setEditingSeason({...editingSeason, responsible_admin_id: e.target.value})}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateMutation.isLoading}
                                    className="flex-1 py-3 px-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeasonManager;
