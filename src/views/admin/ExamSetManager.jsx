import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';

const ExamSetManager = () => {
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSet, setEditingSet] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_korpor_format: false,
        education_level: 'bachelor',
        time_limit_minutes: 0
    });

    const { data: setsResponse, isLoading } = useQuery({
        queryKey: ['adminExamSets'],
        queryFn: () => adminApi.request('/api/admin/exam-sets', { method: 'GET' })
    });

    const createMutation = useMutation({
        mutationFn: (data) => adminApi.request('/api/admin/exam-sets', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => {
            toast.success('Exam Set created successfully!');
            setIsCreateModalOpen(false);
            setFormData({ name: '', description: '', is_korpor_format: false, education_level: 'bachelor', time_limit_minutes: 0 });
            queryClient.invalidateQueries(['adminExamSets']);
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to create exam set')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminApi.request(`/api/admin/exam-sets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        onSuccess: () => {
            toast.success('Exam Set updated successfully!');
            setIsEditModalOpen(false);
            queryClient.invalidateQueries(['adminExamSets']);
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to update exam set')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminApi.request(`/api/admin/exam-sets/${id}`, { method: 'DELETE' }),
        onSuccess: () => {
            toast.success('Exam Set deleted successfully!');
            queryClient.invalidateQueries(['adminExamSets']);
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete exam set')
    });

    const sets = setsResponse?.data || [];

    const handleCreate = (e) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        updateMutation.mutate({ id: editingSet.id, data: formData });
    };

    const openEditModal = (set) => {
        setEditingSet(set);
        setFormData({
            name: set.name,
            description: set.description || '',
            is_korpor_format: Boolean(set.is_korpor_format),
            education_level: set.education_level || 'bachelor',
            time_limit_minutes: set.time_limit_minutes || 0
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this exam set?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
                        <Layers className="w-8 h-8 mr-3 text-blue-600" />
                        Exam Set Manager
                    </h1>
                    <p className="text-slate-500 mt-2">Manage exam sets, Kor Por formatting, and grouped questions.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium flex items-center"
                >
                    <Plus size={16} className="mr-2" />
                    Create Set
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-4 text-sm font-semibold text-slate-600">Name</th>
                            <th className="p-4 text-sm font-semibold text-slate-600">Description</th>
                            <th className="p-4 text-sm font-semibold text-slate-600">Kor Por Format</th>
                            <th className="p-4 text-sm font-semibold text-slate-600">Level</th>
                            <th className="p-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {isLoading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading...</td></tr>
                        ) : sets.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-500">No exam sets found.</td></tr>
                        ) : (
                            sets.map((set) => (
                                <tr key={set.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-medium text-slate-900">{set.name}</td>
                                    <td className="p-4 text-slate-500 text-sm">{set.description || '-'}</td>
                                    <td className="p-4">
                                        {set.is_korpor_format ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Yes</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">No</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-500 text-sm">{set.education_level || '-'}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => openEditModal(set)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(set.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900">{isEditModalOpen ? 'Edit Exam Set' : 'Create Exam Set'}</h2>
                        </div>
                        <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Set Name (e.g. ก.พ. 67)</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_korpor"
                                    checked={formData.is_korpor_format}
                                    onChange={(e) => setFormData({ ...formData, is_korpor_format: e.target.checked })}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="is_korpor" className="text-sm font-medium text-slate-700">Enable Kor Por Result Format</label>
                            </div>
                            {formData.is_korpor_format && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Education Level (For passing criteria)</label>
                                    <select
                                        value={formData.education_level}
                                        onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="bachelor">ปวช./ปวส./ปริญญาตรี (60%)</option>
                                        <option value="master">ปริญญาโท (65%)</option>
                                    </select>
                                </div>
                            )}
                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreateModalOpen(false);
                                        setIsEditModalOpen(false);
                                    }}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {isEditModalOpen ? 'Save Changes' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamSetManager;
