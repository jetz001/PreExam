import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Calendar, Flame, Timer, Edit, Crown, Check, X, AlertCircle, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import { isPremiumUser } from '../../utils/userAccess';
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
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 relative overflow-hidden border-4 border-[#46178f]/10 dark:border-white/5">
            {/* Playful Background Header */}
            <div className="absolute top-0 left-0 w-full h-32 bg-[#46178f] dark:bg-[#320b6d]">
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#1368ce] rounded-full opacity-50 mix-blend-screen"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#e21b3c] rounded-full opacity-50 mix-blend-screen"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center mt-8">
                {/* Avatar with Playful styling */}
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-8 border-white dark:border-slate-800 overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.15)] bg-white transform transition hover:scale-105 hover:rotate-3">
                        <img
                            src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`) : "https://ui-avatars.com/api/?background=ebbf00&color=fff&bold=true&name=" + user.display_name}
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
                                className="absolute bottom-2 right-0 bg-[#ebbf00] text-white p-3 rounded-full hover:bg-[#d4ac00] transition shadow-[0_4px_0_#b39100] active:translate-y-1 active:shadow-none"
                            >
                                <Camera size={20} />
                            </button>
                        </>
                    )}
                </div>

                {/* Name & Bio */}
                <h2 className="mt-5 text-3xl font-black text-[#46178f] dark:text-white tracking-tight">{user.display_name}</h2>
                <p className="text-sm text-[#1368ce] font-bold mb-2">@{user.public_id || 'USER'}</p>
                <div className="bg-gray-100 dark:bg-slate-700/50 px-4 py-2 rounded-2xl mt-1">
                    <p className="text-gray-600 dark:text-gray-300 text-center text-sm font-medium w-full max-w-xs">{user.bio || "Let's play and learn!"}</p>
                </div>

                {/* Badges / Stats Row - Kahoot colorful blocks */}
                <div className="flex items-center gap-3 mt-8 w-full justify-center">
                    {/* Streak - Red Block */}
                    <div className="flex flex-col items-center p-3 bg-[#e21b3c] rounded-2xl min-w-[85px] shadow-[0_4px_0_#b5142f] text-white transform transition hover:-translate-y-1">
                        <Flame className="text-white mb-1" size={24} />
                        <span className="text-2xl font-black">{user.streak_count || 0}</span>
                        <span className="text-xs font-bold uppercase tracking-wider opacity-90 mt-1">Streak</span>
                    </div>

                    {/* Target Countdown - Blue Block */}
                    <div
                        className={`flex flex-col items-center p-3 bg-[#1368ce] rounded-2xl min-w-[90px] flex-grow shadow-[0_4px_0_#0e53a3] text-white transform transition ${isOwnProfile ? 'cursor-pointer hover:-translate-y-1' : ''}`}
                        onClick={() => isOwnProfile && setIsEditingTarget(true)}
                        title="Click to set target"
                    >
                        <Timer className="text-white mb-1" size={24} />
                        <span className="text-xl font-black truncate max-w-[120px]">{timeLeft}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 mt-1 truncate max-w-[120px]">
                            {user.target_exam || 'Set Goal'}
                        </span>
                    </div>

                    {/* Membership - Green Block */}
                    <div className="flex flex-col items-center p-3 bg-[#26890c] rounded-2xl min-w-[85px] shadow-[0_4px_0_#1e6c09] text-white transform transition hover:-translate-y-1">
                        <div className="text-white mb-1 text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded-lg">
                            {user.plan_type || 'FREE'}
                        </div>
                        <span className="text-xl font-black mt-1">Plan</span>
                    </div>
                </div>

                {isOwnProfile && isPremiumUser(user) && (
                    <div className="mt-6 w-full bg-[#46178f]/5 dark:bg-[#46178f]/20 p-4 rounded-2xl border-2 border-[#46178f]/20 text-center relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 text-[#ebbf00] opacity-20"><Crown size={64} /></div>
                        <p className="text-sm font-bold text-[#46178f] dark:text-purple-300 uppercase tracking-widest relative z-10">Premium Active</p>
                        <div className="flex justify-between items-center mt-3 text-sm font-medium relative z-10">
                            <div className="flex flex-col text-left">
                                <span className="text-gray-500">Since</span>
                                <span className="text-gray-800 dark:text-white">
                                    {user.premium_start_date ? new Date(user.premium_start_date).toLocaleDateString() : '-'}
                                </span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-gray-500">Expires</span>
                                <span className="text-[#1368ce] dark:text-blue-400 font-bold">
                                    {user.premium_expiry ? new Date(user.premium_expiry).toLocaleDateString() : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {isOwnProfile && (
                    <div className="mt-8 flex flex-col gap-3 w-full">
                        {(!user.plan_type || user.plan_type === 'free') && (
                            <button
                                onClick={() => navigate('/premium-upgrade')}
                                className="w-full flex items-center justify-center gap-2 bg-[#ebbf00] text-white text-lg font-black uppercase tracking-wider py-4 rounded-2xl hover:bg-[#d4ac00] shadow-[0_6px_0_#b39100] active:translate-y-[6px] active:shadow-none transition-all"
                            >
                                <Crown size={22} /> Go Premium!
                            </button>
                        )}
                        <button
                            onClick={onEditProfile}
                            className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-sm font-bold uppercase tracking-wider py-3 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-600 shadow-[0_4px_0_#d1d5db] dark:shadow-[0_4px_0_#334155] active:translate-y-[4px] active:shadow-none transition-all"
                        >
                            <Edit size={18} /> Edit Profile
                        </button>
                    </div>
                )}

                {!isOwnProfile && (
                    <div className="mt-8 flex flex-col gap-3 w-full">
                        <button
                            onClick={() => navigate(`/profile?tab=inbox&user=${user.id}`)}
                            className="w-full flex items-center justify-center gap-2 bg-[#1368ce] text-white text-lg font-black uppercase tracking-wider py-4 rounded-2xl hover:bg-[#0e53a3] shadow-[0_6px_0_#0b4282] active:translate-y-[6px] active:shadow-none transition-all"
                        >
                            <Mail size={22} /> Send Message
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
