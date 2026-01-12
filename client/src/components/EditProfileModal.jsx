import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { X, Camera, Save } from 'lucide-react';
import authService from '../services/authService';

const EditProfileModal = ({ user, onClose }) => {
    const [displayName, setDisplayName] = useState(user.display_name || '');
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState(user.avatar ? (user.avatar.startsWith('http') ? user.avatar : user.avatar) : null);

    // Invalidate queries to refresh UI
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (formData) => {
            const token = localStorage.getItem('token');
            const res = await axios.put('/api/users/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            return res.data;
        },
        onSuccess: (data) => {
            // Update local storage user data if needed, or rely on refetch
            if (data.success) {
                const currentUser = authService.getCurrentUser();
                const updatedUser = { ...currentUser, ...data.data };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                // Force reload or invalidate to update Navbar
                window.location.reload();
            }
            onClose();
        },
        onError: (error) => {
            alert(error.response?.data?.message || "Failed to update profile");
        }
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('display_name', displayName);
        if (avatar) {
            formData.append('avatar', avatar);
        }
        mutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
                <div className="p-4 border-b flex justify-between items-center bg-indigo-600 text-white">
                    <h2 className="text-lg font-bold">แก้ไขโปรไฟล์</h2>
                    <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded-full"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <img
                                src={preview || `https://ui-avatars.com/api/?name=${displayName || 'User'}&background=random`}
                                alt="Profile Preview"
                                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-50 shadow-md"
                            />
                            <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 shadow-sm transition-transform hover:scale-110">
                                <Camera size={16} />
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">คลิกที่กล้องเพื่อเปลี่ยนรูปโปรไฟล์</p>
                    </div>

                    {/* Display Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">ชื่อที่แสดง (Display Name)</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="ใส่ชื่อเท่ๆ ของคุณ..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-70"
                    >
                        {mutation.isPending ? (
                            <span>กำลังบันทึก...</span>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>บันทึกการเปลี่ยนแปลง</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
