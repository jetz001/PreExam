import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Upload,
    Trash2,
    Image as ImageIcon,
    Volume2,
    X,
    Clock,
    Settings,
    Save,
    ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';
import { versionHistory, getCurrentVersion } from '../../config/versionHistory';

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all';

const SettingsManager = () => {
    const queryClient = useQueryClient();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        name: '',
        type: 'background', // background, frame
        url: '',
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
            setUploadForm({ name: '', type: 'background', url: '', is_premium: true });
            queryClient.invalidateQueries(['assets']);
        },
        onError: (err) => {
            console.error(err);
            toast.error('Failed to upload asset');
        }
    });

    const deleteAssetMutation = useMutation({
        mutationFn: adminApi.deleteAsset,
        onSuccess: () => {
            toast.success('Asset deleted');
            queryClient.invalidateQueries(['assets']);
        },
        onError: () => toast.error('Failed to delete asset')
    });

    const handleUpload = (e) => {
        e.preventDefault();
        if (!uploadForm.url || !uploadForm.name) {
            toast.error('Please fill in all fields');
            return;
        }

        let finalUrl = uploadForm.url;
        // Auto-convert Google Drive share links to direct image links
        const driveMatch = finalUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (driveMatch) {
            finalUrl = `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
        }

        const payload = {
            name: uploadForm.name,
            type: uploadForm.type,
            url: finalUrl,
            is_premium: uploadForm.is_premium
        };

        uploadMutation.mutate(payload);
    };

    // Tab State
    const [activeTab, setActiveTab] = useState('general');

    const renderTabButton = (id, label, icon) => (
        <button
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                activeTab === id
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="space-y-6 pb-16">
            {/* Executive Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur-sm p-5 sm:p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                        <Settings size={24} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                            ตั้งค่าระบบ (System Settings)
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            จัดการประกาศระบบ คำต้องห้าม คลังภาพพื้นหลัง/กรอบโปรไฟล์ และประวัติเวอร์ชัน
                        </p>
                    </div>
                </div>

                <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/90 p-1 border border-slate-200/80" role="tablist">
                    {renderTabButton('general', 'General', <Volume2 size={16} />)}
                    {renderTabButton('assets', 'Assets', <ImageIcon size={16} />)}
                    {renderTabButton('versions', 'Versions', <Clock size={16} />)}
                </div>
            </div>

            {/* General Tab Content */}
            {activeTab === 'general' && (
                <>
                    {/* System Broadcast */}
                    <section className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/70">
                                <Volume2 size={17} />
                            </span>
                            <span>System Broadcast (Dashboard Banner)</span>
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Display a banner message on the top of Business Dashboard.
                        </p>

                        <div className="space-y-5 max-w-2xl">
                            <div className="flex items-center gap-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={Boolean(settings.announcement_active)}
                                        onChange={e => setSettings({ ...settings, announcement_active: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                                    <span className="ml-3 text-sm font-semibold text-slate-900">Active</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="e.g. System maintenance at 02:00 AM"
                                    value={settings.announcement_text || ''}
                                    onChange={e => setSettings({ ...settings, announcement_text: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
                                <div className="flex flex-wrap gap-4">
                                    {['info', 'warning', 'success'].map(type => (
                                        <label key={type} className="inline-flex items-center cursor-pointer px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition-colors">
                                            <input
                                                type="radio"
                                                name="announcement_type"
                                                value={type}
                                                checked={settings.announcement_type === type}
                                                onChange={e => setSettings({ ...settings, announcement_type: e.target.value })}
                                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                            />
                                            <span className="ml-2 text-sm font-medium text-slate-800 capitalize">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            {settings.announcement_active && (
                                <div
                                    className={`p-4 rounded-xl mt-2 flex items-center gap-3 border ${
                                        settings.announcement_type === 'warning'
                                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                                            : settings.announcement_type === 'success'
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                            : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                    }`}
                                >
                                    <Volume2 size={20} className="flex-shrink-0" />
                                    <span className="font-semibold text-sm">{settings.announcement_text || 'Preview Message'}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Global Blacklist Management */}
                    <section className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200/70">
                                <ShieldAlert size={17} />
                            </span>
                            <span>Global Blacklist Management</span>
                        </h3>
                        <p className="text-sm text-slate-500 mb-5">
                            Manage bad words for the profanity filter. Separate words with commas.
                        </p>

                        <div className="max-w-2xl">
                            <textarea
                                className={`${inputClass} h-32 resize-none font-mono`}
                                placeholder="badword1, badword2, badword3"
                                value={settings.blacklisted_words || ''}
                                onChange={e => setSettings({ ...settings, blacklisted_words: e.target.value })}
                            />
                            <p className="text-xs font-medium text-slate-500 mt-2">
                                Changes are applied immediately after saving.
                            </p>
                        </div>
                    </section>

                    {/* Save Button */}
                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={handleSaveSettings}
                            disabled={updateSettingsMutation.isPending}
                            className="inline-flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-95 text-sm font-semibold disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <Save size={17} />
                            <span>{updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </>
            )}

            {/* Versions Tab Content */}
            {activeTab === 'versions' && (
                <section className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Clock size={19} className="text-indigo-600" />
                                <span>Version History &amp; Changelog</span>
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Track system updates and new features.</p>
                        </div>
                        <div className="inline-flex items-center bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-full border border-indigo-200/80 self-start">
                            <span className="text-xs font-bold mr-1.5">CURRENT VER.</span>
                            <span className="text-sm font-extrabold">{getCurrentVersion()}</span>
                        </div>
                    </div>

                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        {versionHistory.map((version, index) => (
                            <div key={version.version} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                {/* Icon */}
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                    {index === 0 ? (
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                                    ) : (
                                        <div className="w-3 h-3 bg-slate-400 rounded-full" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                                    <div className="flex items-center justify-between mb-2.5">
                                        <div className="font-extrabold text-slate-900 text-lg">v{version.version}</div>
                                        <time className="font-mono text-xs font-medium text-slate-500">{version.date}</time>
                                    </div>
                                    <ul className="space-y-2">
                                        {version.changes.map((change, i) => (
                                            <li key={i} className="flex items-start text-sm">
                                                <span
                                                    className={`inline-flex items-center justify-center px-2 py-0.5 mr-2 text-[11px] font-bold rounded-md border flex-shrink-0 ${
                                                        change.type === 'new'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : change.type === 'fix'
                                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                    }`}
                                                >
                                                    {change.type.toUpperCase()}
                                                </span>
                                                <span className="text-slate-700 leading-relaxed">{change.description}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Assets Tab Content */}
            {activeTab === 'assets' && (
                <section className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm">
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Asset Library</h3>
                            <p className="text-xs text-slate-500 mt-0.5">จัดการภาพพื้นหลังและกรอบรูปโปรไฟล์ภายในระบบ</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsUploading(!isUploading)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors text-sm font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            {isUploading ? <X size={16} /> : <Upload size={16} />}
                            <span>{isUploading ? 'Cancel Upload' : 'Upload New Asset'}</span>
                        </button>
                    </div>

                    {isUploading && (
                        <form onSubmit={handleUpload} className="mb-8 p-5 bg-slate-50/90 rounded-2xl border border-slate-200/80">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Asset Name</label>
                                    <input
                                        type="text"
                                        required
                                        className={`${inputClass} bg-white`}
                                        value={uploadForm.name}
                                        onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Type</label>
                                    <select
                                        className={`${inputClass} bg-white`}
                                        value={uploadForm.type}
                                        onChange={e => setUploadForm({ ...uploadForm, type: e.target.value })}
                                    >
                                        <option value="background">Background</option>
                                        <option value="frame">Frame</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Image URL</label>
                                    <input
                                        type="url"
                                        required
                                        placeholder="https://example.com/image.jpg"
                                        className={`${inputClass} bg-white`}
                                        value={uploadForm.url}
                                        onChange={e => setUploadForm({ ...uploadForm, url: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={Boolean(uploadForm.is_premium)}
                                        onChange={e => setUploadForm({ ...uploadForm, is_premium: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                                    <span className="ml-3 text-sm font-semibold text-slate-900">Premium Asset (Requires Subscription)</span>
                                </label>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={uploadMutation.isPending}
                                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    {uploadMutation.isPending ? 'Uploading...' : 'Upload Asset'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {assets.map((asset) => (
                            <div key={asset.id} className="aspect-square bg-slate-100 rounded-2xl border border-slate-200/80 overflow-hidden relative group shadow-sm">
                                <img
                                    src={asset.url}
                                    alt={asset.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = 'https://placehold.co/150?text=Error'; }}
                                />

                                {/* Overlay Info */}
                                <div className="absolute inset-x-0 bottom-0 bg-slate-950/75 backdrop-blur-sm p-2.5 translate-y-0 sm:translate-y-full sm:group-hover:translate-y-0 transition-transform">
                                    <p className="text-white text-xs font-semibold truncate">{asset.name}</p>
                                    <p className="text-slate-200 text-[11px] capitalize">{asset.type}</p>
                                </div>

                                {/* Delete Button */}
                                <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (window.confirm('Delete this asset?')) {
                                                deleteAssetMutation.mutate(asset.id);
                                            }
                                        }}
                                        aria-label={`ลบ ${asset.name}`}
                                        title="ลบ Asset"
                                        className="bg-rose-600 text-white p-1.5 rounded-full hover:bg-rose-700 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {assets.length === 0 && (
                            <div className="col-span-full py-14 text-center text-slate-500 flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70">
                                <ImageIcon size={40} className="mb-2 text-slate-500" />
                                <p className="text-sm font-semibold text-slate-700">No assets found</p>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};

export default SettingsManager;
