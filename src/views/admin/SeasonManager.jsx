import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Calendar, CheckCircle, XCircle, Plus, Edit2, ShieldAlert, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';

const SeasonManager = () => {
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSeason, setEditingSeason] = useState(null);
    const [newSeasonId, setNewSeasonId] = useState('');
    const [newSeasonName, setNewSeasonName] = useState('');

    useEffect(() => {
        if (!isCreateModalOpen && !isEditModalOpen) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isCreateModalOpen, isEditModalOpen]);

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

    const isCreating = createMutation.isPending || createMutation.isLoading;
    const isUpdating = updateMutation.isPending || updateMutation.isLoading;

    if (isLoading) {
        return (
            <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 p-12 text-center text-slate-500 flex flex-col items-center gap-3 shadow-sm">
                <Loader2 size={28} className="animate-spin text-indigo-600" />
                <span className="text-sm font-medium">Loading Seasons...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Executive Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-200/80">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            ฤดูกาล &amp; แร้งกิ้ง (Rankings &amp; Seasons)
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Manage yearly seasons and leaderboard resets
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    <Plus size={18} />
                    <span>New Season</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50/90 text-slate-700 border-b border-slate-200/80 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold">Season ID</th>
                                <th className="px-6 py-4 font-bold">Name</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold">Responsible Admin</th>
                                <th className="px-6 py-4 font-bold">Start Date</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {seasons.map((season) => (
                                <tr key={season.id} className="hover:bg-indigo-50/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">{season.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-800">{season.name}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                                season.status === 'active'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}
                                        >
                                            {season.status === 'active' ? (
                                                <CheckCircle className="w-3.5 h-3.5" />
                                            ) : (
                                                <XCircle className="w-3.5 h-3.5" />
                                            )}
                                            {(season.status || 'unknown').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2.5 py-1 rounded-lg">
                                            {season.responsible_admin_id || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {season.start_date ? new Date(season.start_date).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingSeason(season);
                                                setIsEditModalOpen(true);
                                            }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/70 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        {season.status === 'active' && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (
                                                        window.confirm(
                                                            'Are you sure you want to end this season manually? Usually creating a new season handles this.'
                                                        )
                                                    ) {
                                                        updateMutation.mutate({
                                                            id: season.id,
                                                            data: {
                                                                status: 'completed',
                                                                end_date: new Date().toISOString()
                                                            }
                                                        });
                                                    }
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                            >
                                                <XCircle className="w-3.5 h-3.5" /> End Season
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {seasons.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2.5" />
                                        <p className="font-medium">No seasons created yet.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isCreateModalOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setIsCreateModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-slate-200/80 bg-slate-50/80 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-indigo-600" />
                                    Start New Season
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Starting a new season will automatically conclude the current active season.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                aria-label="ปิดหน้าต่าง"
                                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Season ID (e.g. 2026)
                                </label>
                                <input
                                    type="text"
                                    value={newSeasonId}
                                    onChange={(e) => setNewSeasonId(e.target.value)}
                                    placeholder={new Date().getFullYear().toString()}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all text-slate-900 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Season Name
                                </label>
                                <input
                                    type="text"
                                    value={newSeasonName}
                                    onChange={(e) => setNewSeasonName(e.target.value)}
                                    placeholder={`Season ${new Date().getFullYear()}`}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all text-slate-900 text-sm"
                                    required
                                />
                            </div>

                            <div className="bg-amber-50 p-4 rounded-xl flex items-start border border-amber-200/80 gap-2.5">
                                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                                    You will be automatically assigned as the responsible Admin for this new season. Leaderboard rankings will reset to zero for all players.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 text-sm inline-flex items-center justify-center gap-2"
                                >
                                    {isCreating && <Loader2 size={15} className="animate-spin" />}
                                    <span>{isCreating ? 'Starting...' : 'Start Season'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && editingSeason && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setIsEditModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-slate-200/80 bg-slate-50/80 flex items-center justify-between">
                            <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-indigo-600" />
                                Edit Season ({editingSeason.id})
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                aria-label="ปิดหน้าต่าง"
                                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Season Name
                                </label>
                                <input
                                    type="text"
                                    value={editingSeason.name}
                                    onChange={(e) => setEditingSeason({ ...editingSeason, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all text-slate-900 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={editingSeason.status}
                                    onChange={(e) => setEditingSeason({ ...editingSeason, status: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all text-slate-900 text-sm"
                                >
                                    <option value="active">ACTIVE</option>
                                    <option value="completed">COMPLETED</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Responsible Admin ID
                                </label>
                                <input
                                    type="text"
                                    value={editingSeason.responsible_admin_id || ''}
                                    onChange={(e) =>
                                        setEditingSeason({ ...editingSeason, responsible_admin_id: e.target.value })
                                    }
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all text-slate-900 text-sm"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 text-sm inline-flex items-center justify-center gap-2"
                                >
                                    {isUpdating && <Loader2 size={15} className="animate-spin" />}
                                    <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
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
