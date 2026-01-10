import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Upload, Trash2, Image as ImageIcon, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';

const SettingsManager = () => {
    // Assets (Mock for now or existing)
    const { data: assets = [] } = useQuery({
        queryKey: ['assets'],
        queryFn: adminApi.getAssets
    });

    // --- System Settings State ---
    const [settings, setSettings] = useState({
        announcement_text: '',
        announcement_active: false,
        announcement_type: 'info', // info, warning, success
        blacklisted_words: '' // Comma separated
    });

    // Fetch Settings
    useQuery({
        queryKey: ['systemSettings'],
        queryFn: async () => {
            const res = await adminApi.getSystemSettings();
            if (res) setSettings(res);
            return res;
        }
    });

    const updateSettingsMutation = useMutation({
        mutationFn: adminApi.updateSystemSettings,
        onSuccess: () => toast.success('Settings updated successfully!'),
        onError: () => toast.error('Failed to update settings')
    });

    const handleSaveSettings = () => {
        updateSettingsMutation.mutate(settings);
    };

    const handleUpload = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1000)),
            {
                loading: 'Uploading asset...',
                success: 'Asset uploaded successfully!',
                error: 'Could not upload.'
            }
        );
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
                <button
                    onClick={handleSaveSettings}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-95 font-medium"
                >
                    Save Changes
                </button>
            </div>

            {/* System Broadcast */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                    <Volume2 size={20} className="mr-2" />
                    System Broadcast (Dashboard Banner)
                </h3>
                <p className="text-sm text-gray-500 mb-6">Display a banner message on the top of Business Dashboard.</p>

                <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center gap-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.announcement_active}
                                onChange={e => setSettings({ ...settings, announcement_active: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900">Active</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. System maintenance at 02:00 AM"
                            value={settings.announcement_text}
                            onChange={e => setSettings({ ...settings, announcement_text: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <div className="flex gap-4">
                            {['info', 'warning', 'success'].map(type => (
                                <label key={type} className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="announcement_type"
                                        value={type}
                                        checked={settings.announcement_type === type}
                                        onChange={e => setSettings({ ...settings, announcement_type: e.target.value })}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    {settings.announcement_active && (
                        <div className={`p-4 rounded-lg mt-4 flex items-center gap-3 ${settings.announcement_type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            settings.announcement_type === 'success' ? 'bg-green-50 text-green-800 border-green-200' :
                                'bg-blue-50 text-blue-800 border-blue-200'
                            } border`}>
                            <Volume2 size={20} />
                            <span className="font-medium">{settings.announcement_text || 'Preview Message'}</span>
                        </div>
                    )}
                </div>
            </section>

            {/* Global Blacklist Management */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                    <Trash2 size={20} className="mr-2" />
                    Global Blacklist Management
                </h3>
                <p className="text-sm text-gray-500 mb-6">Manage bad words for the profanity filter. Separate words with commas.</p>

                <div className="max-w-2xl">
                    <textarea
                        className="w-full h-32 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm"
                        placeholder="badword1, badword2, badword3"
                        value={settings.blacklisted_words}
                        onChange={e => setSettings({ ...settings, blacklisted_words: e.target.value })}
                    />
                    <p className="text-xs text-gray-400 mt-2">Changes are applied immediately after saving.</p>
                </div>
            </section>

            {/* Asset Library (Existing) */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-slate-700">Asset Library</h3>
                    <button
                        onClick={handleUpload}
                        className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm"
                    >
                        <Upload size={16} className="mr-2" />
                        Upload New Asset
                    </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="aspect-square bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center relative group cursor-pointer">
                            <ImageIcon className="text-slate-400" size={32} />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                <button className="text-white hover:text-red-400">
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default SettingsManager;
