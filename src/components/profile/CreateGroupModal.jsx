import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, BookOpen, Lock } from 'lucide-react';
import studyGroupService from '../../services/studyGroupService';
import toast from 'react-hot-toast';

const CreateGroupModal = ({ onClose, onGroupCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        description: '',
        max_members: 10,
        is_private: false
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await studyGroupService.createGroup(formData);
            toast.success('Study Group Created!');
            onGroupCreated();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Users className="text-blue-600" size={20} />
                        Create Study Group
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Group Name</label>
                        <input
                            required
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Police Exam Prep 2025"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Subject / Topic</label>
                        <div className="relative">
                            <BookOpen size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                required
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full pl-9 p-2 border rounded-lg bg-gray-50 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Criminal Law"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none h-24"
                            placeholder="Briefly describe your group goals..."
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Max Members</label>
                            <input
                                type="number"
                                name="max_members"
                                min="2"
                                max="50"
                                value={formData.max_members}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-slate-700 dark:border-slate-600"
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_private"
                                    checked={formData.is_private}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium flex items-center gap-1">
                                    <Lock size={14} /> Private Group
                                </span>
                            </label>
                        </div>
                    </div>

                    {formData.is_private && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Group Password</label>
                            <input
                                type="password"
                                name="password"
                                required={formData.is_private}
                                value={formData.password || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Set a password for joining..."
                            />
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default CreateGroupModal;
