import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, Image as ImageIcon, Volume2, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';

const SettingsManager = () => {
    const queryClient = useQueryClient();
    const [isUploading, setIsUploading] = useState(false);
    name: '',
        type: 'background', // background, frame
            file: null,
                is_premium: true
});

// Assets
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

const uploadMutation = useMutation({
    mutationFn: adminApi.uploadAsset,
    onSuccess: () => {
        toast.success('Asset uploaded successfully!');
        setIsUploading(false);
        setUploadForm({ name: '', type: 'background', file: null });
        queryClient.invalidateQueries(['assets']);
    },
    onError: (err) => {
        console.error(err);
        toast.error('Failed to upload asset');
    }
});

const deleteAssetMutation = useMutation({
    mutationFn: adminApi.deleteAsset, // Assuming this exists in adminApi based on assetRoutes
    onSuccess: () => {
        toast.success('Asset deleted');
        queryClient.invalidateQueries(['assets']);
    },
    onError: () => toast.error('Failed to delete asset')
});

const handleUpload = (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.name) {
        toast.error('Please fill in all fields');
        return;
    }

    const formData = new FormData();
    formData.append('name', uploadForm.name);
    formData.append('type', uploadForm.type);
    formData.append('image', uploadForm.file); // 'image' matches the multer field in assetRoutes
    formData.append('image', uploadForm.file); // 'image' matches the multer field in assetRoutes
    formData.append('is_premium', uploadForm.is_premium);

    uploadMutation.mutate(formData);
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
                    className="w-full h-32 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm text-gray-900"
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
                    onClick={() => setIsUploading(!isUploading)}
                    className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm"
                >
                    {isUploading ? <X size={16} className="mr-2" /> : <Upload size={16} className="mr-2" />}
                    {isUploading ? 'Cancel Upload' : 'Upload New Asset'}
                </button>
            </div>

            {isUploading && (
                <form onSubmit={handleUpload} className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                            <input
                                type="text"
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                                value={uploadForm.name}
                                onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                                value={uploadForm.type}
                                onChange={e => setUploadForm({ ...uploadForm, type: e.target.value })}
                            >
                                <option value="background">Background</option>
                                <option value="frame">Frame</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                            <input
                                type="file"
                                required
                                accept="image/*"
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                onChange={e => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={uploadForm.is_premium}
                                onChange={e => setUploadForm({ ...uploadForm, is_premium: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900">Premium Asset (Requires Subscription)</span>
                        </label>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={uploadMutation.isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                        >
                            {uploadMutation.isPending ? 'Uploading...' : 'Upload Asset'}
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {assets.map((asset) => (
                    <div key={asset.id} className="aspect-square bg-slate-100 rounded-lg border border-slate-200 overflow-hidden relative group">
                        <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://placehold.co/150?text=Error' }}
                        />

                        {/* Overlay Info */}
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
                            <p className="text-white text-xs truncate">{asset.name}</p>
                            <p className="text-gray-300 text-[10px] capitalize">{asset.type}</p>
                        </div>

                        {/* Delete Button */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => {
                                    if (window.confirm('Delete this asset?')) {
                                        deleteAssetMutation.mutate(asset.id); // You might need to add deleteAsset to adminApi or just use api directly
                                    }
                                }}
                                className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-sm"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
                {assets.length === 0 && (
                    <div className="col-span-full py-10 text-center text-gray-400 flex flex-col items-center">
                        <ImageIcon size={48} className="mb-2 opacity-20" />
                        <p>No assets found</p>
                    </div>
                )}
            </div>
        </section>
    </div>
);
};

export default SettingsManager;
