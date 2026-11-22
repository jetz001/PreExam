import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { X, Camera, Save, Loader2, User } from 'lucide-react';
import authService from '../services/authService';

const EditProfileModal = ({ user, onClose }) => {
  const [displayName, setDisplayName] = useState(user.display_name || '');
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(
    user.avatar ? (user.avatar.startsWith('http') ? user.avatar : user.avatar) : null
  );

  const queryClient = useQueryClient();

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const token = localStorage.getItem('token');
      const res = await axios.put('/api/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        const currentUser = authService.getCurrentUser();
        const updatedUser = { ...currentUser, ...data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload();
      }
      onClose();
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
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
    <div
      className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
          <div className="flex items-center gap-2.5">
            <User size={19} />
            <h2
              id="edit-profile-title"
              className="text-lg font-black"
              style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
            >
              แก้ไขโปรไฟล์
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="hover:bg-white/15 p-1.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <img
                src={
                  preview ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    displayName || 'User'
                  )}&background=random`
                }
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-500/30 shadow-md"
              />
              <label
                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 shadow-md transition-transform hover:scale-110"
                aria-label="เปลี่ยนรูปโปรไฟล์"
                title="เปลี่ยนรูปโปรไฟล์"
              >
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2.5">
              คลิกที่ไอคอนกล้องเพื่อเปลี่ยนรูปโปรไฟล์
            </p>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <label
              htmlFor="edit-display-name"
              className="text-sm font-bold text-slate-700 dark:text-slate-200 block"
            >
              ชื่อที่แสดง (Display Name)
            </label>
            <input
              id="edit-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="ใส่ชื่อเท่ๆ ของคุณ..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {mutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>กำลังบันทึก...</span>
              </>
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
