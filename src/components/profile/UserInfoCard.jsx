import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Calendar, Flame, Timer, Edit, Crown, Check, X, AlertCircle, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import toast from 'react-hot-toast';

const UserInfoCard = ({ user, isOwnProfile, onEditProfile, onUserUpdate }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const fileInputRef = React.useRef(null);

    // Quick Edit State
    const [isEditingTarget, setIsEditingTarget] = useState(false);
    const [editTarget, setEditTarget] = useState(user?.target_exam || '');
    const [editDate, setEditDate] = useState(user?.target_exam_date ? new Date(user.target_exam_date).toISOString().split('T')[0] : '');

    const handleSaveTarget = async () => {
        try {
            const updated = await userService.updateProfile({
                target_exam: editTarget,
                target_exam_date: editDate
            });
            updateUser(updated.data);
            if (onUserUpdate) onUserUpdate(updated.data);
            setIsEditingTarget(false);
            toast.success("Goal updated!");
        } catch (error) {
            toast.error("Failed to update goal");
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        const toastId = toast.loading('Uploading image...');
        try {
            const updated = await userService.updateProfile(formData);
            updateUser(updated.data);
            if (onUserUpdate) onUserUpdate(updated.data);
            toast.success('Avatar updated!', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload', { id: toastId });
        }
    };

    useEffect(() => {
        if (user?.target_exam_date) {
            const calculateTimeLeft = () => {
                const now = new Date();
                const targetDate = new Date(user.target_exam_date);

                // Fix: Ensure target date is end of day or specific time if needed?
                // Usually target is just a day. Let's compare to midnight of target day?
                // Standard: target - now.

                if (isNaN(targetDate.getTime())) {
                    setTimeLeft('Invalid Date');
                    return;
                }

                const diff = targetDate - now;

                if (diff <= 0) {
                    // Check if it's actually the SAME day (just earlier hours)
                    const isSameDay = now.toDateString() === targetDate.toDateString();
                    if (isSameDay) {
                        setTimeLeft('Today!');
                    } else {
                        setTimeLeft('Passed');
                    }
                } else {
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    setTimeLeft(`${days}d ${hours}h`);
                }
            };

            calculateTimeLeft(); // Run immediately
            const interval = setInterval(calculateTimeLeft, 1000 * 60); // Update every minute is enough
            return () => clearInterval(interval);
        } else {
            setTimeLeft('Not set');
        }
    }, [user?.target_exam_date]);

    // Check Premium Expiry
    useEffect(() => {
        if (user?.plan_type === 'premium' && user?.premium_expiry) {
            const now = new Date();
            const expiry = new Date(user.premium_expiry);
            const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

            if (daysLeft <= 3 && daysLeft > 0) {
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-slate-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <AlertCircle className="h-10 w-10 text-yellow-500" />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        Premium Expiring Soon
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Your subscription ends in {daysLeft} days. Renew now to keep access!
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-gray-200 dark:border-slate-700">
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    navigate('/premium-upgrade');
                                }}
                                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Renew
                            </button>
                        </div>
                    </div>
                ), { duration: 5000, id: 'premium-alert' }); // ID prevents duplicates
            }
        }
    }, [user]);

    if (!user) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-indigo-700"></div>

            <div className="relative z-10 flex flex-col items-center mt-4">
                {/* Avatar */}
                <div className="relative group">
                    <div className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden shadow-md bg-white">
                        <img
                            src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`) : "https://ui-avatars.com/api/?name=" + user.display_name}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {isOwnProfile && (
                        <>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-yellow-400 text-white p-2 rounded-full hover:bg-yellow-500 transition shadow-sm"
                            >
                                <Camera size={18} />
                            </button>
                        </>
                    )}
                </div>

                {/* Name & Bio */}
                <h2 className="mt-3 text-2xl font-bold text-gray-800 dark:text-white">{user.display_name}</h2>
                <p className="text-sm text-blue-500 font-semibold mb-1">@{user.public_id || 'USER'}</p>
                <p className="text-gray-500 dark:text-gray-400 text-center text-sm px-4 truncate w-full max-w-xs">{user.bio || 'No bio yet.'}</p>

                {/* Badges / Stats Row */}
                <div className="flex items-center gap-4 mt-6 w-full justify-center">
                    {/* Streak */}
                    <div className="flex flex-col items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl min-w-[80px]">
                        <Flame className="text-orange-500 mb-1" size={20} />
                        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{user.streak_count || 0}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Day Streak</span>
                    </div>

                    {/* Target Countdown - Clickable for Quick Edit */}
                    <div
                        className={`flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl min-w-[80px] flex-grow ${isOwnProfile ? 'cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition shadow-sm' : ''}`}
                        onClick={() => isOwnProfile && setIsEditingTarget(true)}
                        title="Click to set target"
                    >
                        <Timer className="text-blue-500 mb-1" size={20} />
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{timeLeft}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px] text-center">
                            {user.target_exam || 'Set Target'}
                        </span>
                    </div>

                    {/* Membership */}
                    <div className="flex flex-col items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl min-w-[80px]">
                        <div className="text-purple-500 mb-1 text-xs font-bold uppercase border border-purple-200 px-1 rounded">
                            {user.plan_type || 'FREE'}
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">Status</span>
                    </div>
                </div>

                {isOwnProfile && user.plan_type === 'premium' && (
                    <div className="mt-4 w-full bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-100 dark:border-purple-900 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Subscription Active</p>
                        <div className="flex justify-between items-center mt-2 text-xs">
                            <div className="flex flex-col">
                                <span className="text-gray-400">Since</span>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                    {user.premium_start_date ? new Date(user.premium_start_date).toLocaleDateString() : '-'}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-400">Expires</span>
                                <span className="font-semibold text-purple-600 dark:text-purple-400">
                                    {user.premium_expiry ? new Date(user.premium_expiry).toLocaleDateString() : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {isOwnProfile && (
                    <div className="mt-6 flex flex-col gap-2 w-full">
                        {(!user.plan_type || user.plan_type === 'free') && (
                            <button
                                onClick={() => navigate('/premium-upgrade')}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-2 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition shadow-md font-medium"
                            >
                                <Crown size={18} /> Upgrade to Premium
                            </button>
                        )}
                        <button
                            onClick={onEditProfile}
                            className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-blue-600 transition text-sm font-medium py-1"
                        >
                            <Edit size={16} /> Edit Profile
                        </button>
                    </div>
                )}

                {!isOwnProfile && (
                    <div className="mt-6 flex flex-col gap-2 w-full">
                        <button
                            onClick={() => navigate(`/profile?tab=inbox&user=${user.id}`)}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
                        >
                            <Mail size={18} /> Send Message
                        </button>
                    </div>
                )}
            </div>
            {/* Quick Edit Modal */}
            {isEditingTarget && (
                <div className="absolute inset-0 z-20 bg-white/95 dark:bg-slate-800/95 flex flex-col items-center justify-center p-6 backdrop-blur-sm transition-all">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Set Your Goal</h3>
                    <div className="w-full space-y-3">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Exam Name</label>
                            <input
                                autoFocus
                                value={editTarget}
                                onChange={(e) => setEditTarget(e.target.value)}
                                placeholder="e.g. Police Exam 2024"
                                className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Exam Date</label>
                            <input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600"
                            />
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsEditingTarget(false); }}
                                className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleSaveTarget(); }}
                                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserInfoCard;
