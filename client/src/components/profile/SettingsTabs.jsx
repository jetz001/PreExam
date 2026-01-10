import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import paymentService from '../../services/paymentService';
import { User, Lock, Bell, Palette, CreditCard, Trash2, Crown, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SettingsTabs = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        display_name: user?.display_name || '',
        bio: user?.bio || '',
        phone_number: user?.phone_number || '',
        target_exam: user?.target_exam || '',
        target_exam_date: user?.target_exam_date ? new Date(user.target_exam_date).toISOString().split('T')[0] : '',
        is_public_stats: user?.is_public_stats ?? true,
        is_online_visible: user?.is_online_visible ?? true,
        allow_friend_request: user?.allow_friend_request ?? true,
        notify_study_group: user?.notify_study_group ?? true,
        theme_preference: user?.theme_preference || 'system',
        font_size_preference: user?.font_size_preference || 'medium'
    });

    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);

    useEffect(() => {
        if (activeTab === 'subscription') {
            loadTransactions();
        }
    }, [activeTab]);

    const loadTransactions = async () => {
        setLoadingTransactions(true);
        try {
            const res = await paymentService.getMyTransactions();
            setTransactions(res.transactions || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            console.log('Saving profile...', formData);
            const updated = await userService.updateProfile({
                display_name: formData.display_name,
                bio: formData.bio,
                phone_number: formData.phone_number,
                target_exam: formData.target_exam,
                target_exam_date: formData.target_exam_date
            });
            console.log('Profile updated', updated);
            updateUser(updated.data);
            toast.success('Profile updated!');
        } catch (error) {
            console.error('Update failed', error);
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            await userService.updateSettings({
                is_public_stats: formData.is_public_stats,
                is_online_visible: formData.is_online_visible,
                allow_friend_request: formData.allow_friend_request,
                notify_study_group: formData.notify_study_group,
                theme_preference: formData.theme_preference,
                font_size_preference: formData.font_size_preference
            });
            updateUser(formData); // Optimistic update
            toast.success('Settings saved!');
        } catch (error) {
            toast.error('Failed to save settings');
        }
    };

    const [deleteStep, setDeleteStep] = useState(0);

    const handleDeleteAccount = async () => {
        try {
            await userService.deleteAccount();
            toast.success('Account deleted');
            window.location.href = '/login';
        } catch (error) {
            toast.error('Failed to delete account');
            setDeleteStep(0);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'subscription', label: 'Subscription', icon: Crown },
        { id: 'privacy', label: 'Privacy', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'app', label: 'App', icon: Palette },
    ];

    // Status Badge Component
    const StatusBadge = ({ status }) => {
        const colors = {
            completed: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            pending_verification: 'bg-blue-100 text-blue-700',
            rejected: 'bg-red-100 text-red-700',
            failed: 'bg-gray-100 text-gray-700'
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${colors[status] || 'bg-gray-100'}`}>
                {status?.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden min-h-[600px]">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-gray-50 dark:bg-slate-900/50 p-4 border-r dark:border-slate-700">
                <h2 className="text-xl font-bold mb-6 px-4">Settings</h2>
                <div className="space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === tab.id
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto max-h-[800px]">
                {activeTab === 'profile' && (
                    <div className="space-y-6 max-w-lg">
                        <h3 className="text-lg font-bold border-b pb-2">Public Profile</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">Display Name</label>
                            <input
                                name="display_name"
                                value={formData.display_name}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-slate-700 dark:border-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-slate-700 dark:border-slate-600 h-24"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Target Exam</label>
                            <input
                                name="target_exam"
                                value={formData.target_exam}
                                onChange={handleChange}
                                placeholder="e.g. Police Exam 2025"
                                className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-slate-700 dark:border-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Target Date</label>
                            <input
                                type="date"
                                name="target_exam_date"
                                value={formData.target_exam_date}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-slate-700 dark:border-slate-600"
                            />
                        </div>
                        <button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}

                {activeTab === 'subscription' && (
                    <div className="space-y-8 max-w-2xl">
                        <h3 className="text-lg font-bold border-b pb-2">My Subscription</h3>

                        {/* Current Plan Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <Crown className="text-yellow-400" size={28} />
                                    <h2 className="text-2xl font-bold uppercase">{user.plan_type || 'FREE'} PLAN</h2>
                                </div>
                                {user.plan_type === 'premium' ? (
                                    <p className="opacity-90">Valid until: {new Date(user.premium_expiry).toLocaleDateString()}</p>
                                ) : (
                                    <p className="opacity-90">Upgrade to unlock full potential.</p>
                                )}

                                <button
                                    onClick={() => navigate('/premium-upgrade')}
                                    className="mt-6 px-6 py-2 bg-white text-indigo-700 rounded-lg font-bold hover:bg-gray-100 transition shadow-md flex items-center gap-2"
                                >
                                    {user.plan_type === 'premium' ? 'Extend Premium' : 'Upgrade Now'} <RefreshCcw size={16} />
                                </button>
                            </div>
                            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-8"></div>
                        </div>

                        {/* Transaction History */}
                        <div>
                            <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                <CreditCard size={18} /> Payment History
                            </h4>
                            {loadingTransactions ? (
                                <p>Loading history...</p>
                            ) : transactions.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 dark:bg-slate-700/30 rounded-lg border border-dashed border-gray-300 dark:border-slate-600">
                                    <p className="text-gray-500">No payment history found.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {transactions.map(tx => (
                                        <div key={tx.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-600">
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-white">
                                                    {tx.plan ? tx.plan.name : `Plan #${tx.plan_id}`}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(tx.created_at).toLocaleDateString()} • {tx.payment_method?.replace('_', ' ')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-800 dark:text-gray-200">฿{tx.amount}</p>
                                                <StatusBadge status={tx.status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'privacy' && (
                    <div className="space-y-6 max-w-lg">
                        <h3 className="text-lg font-bold border-b pb-2">Privacy & Security</h3>
                        <div className="flex items-center justify-between">
                            <span>Public Stats</span>
                            <input type="checkbox" name="is_public_stats" checked={formData.is_public_stats} onChange={handleChange} className="toggle" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Online Status</span>
                            <input type="checkbox" name="is_online_visible" checked={formData.is_online_visible} onChange={handleChange} className="toggle" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Allow Friend Requests</span>
                            <input type="checkbox" name="allow_friend_request" checked={formData.allow_friend_request} onChange={handleChange} className="toggle" />
                        </div>

                        {/* Delete Account Section */}
                        <div className="mt-8 pt-8 border-t border-red-200 dark:border-red-900/30">
                            <h4 className="font-bold text-red-600 mb-2">Delete Account</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <button onClick={() => setDeleteStep(1)} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2">
                                <Trash2 size={16} /> Delete Account
                            </button>
                        </div>

                        <button onClick={handleSaveSettings} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4">
                            Save Preferences
                        </button>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="space-y-6 max-w-lg">
                        <h3 className="text-lg font-bold border-b pb-2">Notifications</h3>
                        <div className="flex items-center justify-between">
                            <span>Study Group Alerts</span>
                            <input type="checkbox" name="notify_study_group" checked={formData.notify_study_group} onChange={handleChange} className="toggle" />
                        </div>
                        <button onClick={handleSaveSettings} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4">
                            Save Preferences
                        </button>
                    </div>
                )}

                {activeTab === 'app' && (
                    <div className="space-y-6 max-w-lg">
                        <h3 className="text-lg font-bold border-b pb-2">App Preferences</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">Theme</label>
                            <select name="theme_preference" value={formData.theme_preference} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-slate-700 dark:border-slate-600">
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="system">System</option>
                            </select>
                        </div>
                        <button onClick={handleSaveSettings} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4">
                            Save Preferences
                        </button>
                    </div>
                )}


            </div>

            {/* Delete Account Modal - Step 1 */}
            {deleteStep === 1 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl max-w-sm w-full">
                        <h3 className="text-xl font-bold mb-2">Are you sure?</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            This action cannot be undone. All your progress, bookmarks, and friends will be permanently removed.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteStep(0)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={() => setDeleteStep(2)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Continue</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Modal - Step 2 */}
            {deleteStep === 2 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl max-w-sm w-full">
                        <h3 className="text-xl font-bold mb-2 text-red-600">Final Confirmation</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Type <span className="font-bold select-all">DELETE</span> to confirm.
                        </p>
                        <input
                            type="text"
                            className="w-full p-2 border border-red-300 rounded-lg mb-4 dark:bg-slate-700 dark:border-slate-600"
                            placeholder="Type DELETE"
                            onChange={(e) => {
                                if (e.target.value === 'DELETE') {
                                    handleDeleteAccount();
                                }
                            }}
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteStep(0)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsTabs;
