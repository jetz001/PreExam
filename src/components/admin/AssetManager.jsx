import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image as ImageIcon, Trash2, Edit2, X, Plus, Star, Loader2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';
import LottieViewer from '../room/LottieViewer';

const AssetManager = () => {
    const queryClient = useQueryClient();
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'background',
        is_premium: false
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [editingAsset, setEditingAsset] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', type: 'background', is_premium: false });
    const [editFile, setEditFile] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (!editingAsset) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setEditingAsset(null);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [editingAsset]);

    const openEditModal = (asset) => {
        setEditingAsset(asset);
        setEditFormData({
            name: asset.name,
            type: asset.type,
            is_premium: asset.is_premium
        });
        setEditFile(null);
    };

    const { data: assets = [], isLoading } = useQuery({
        queryKey: ['adminAssets'],
        queryFn: () => adminApi.getAssets()
    });

    const createAssetMutation = useMutation({
        mutationFn: adminApi.createAsset,
        onSuccess: () => {
            queryClient.invalidateQueries(['adminAssets']);
            toast.success('Asset uploaded successfully!');
            setIsUploading(false);
            setFormData({ name: '', type: 'background', is_premium: false });
            setSelectedFile(null);
            const inputEl = document.getElementById('asset-file-input');
            if (inputEl) inputEl.value = '';
        },
        onError: () => {
            toast.error('Failed to upload asset.');
            setIsUploading(false);
        }
    });

    const deleteAssetMutation = useMutation({
        mutationFn: adminApi.deleteAsset,
        onSuccess: () => {
            queryClient.invalidateQueries(['adminAssets']);
            toast.success('Asset deleted successfully');
        },
        onError: () => toast.error('Failed to delete asset')
    });

    const updateAssetMutation = useMutation({
        mutationFn: ({ id, data }) => adminApi.updateAsset(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminAssets']);
            toast.success('Asset updated successfully');
            setEditingAsset(null);
        },
        onError: () => toast.error('Failed to update asset')
    });

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editFormData.name.trim()) {
            toast.error('Asset name is required.');
            return;
        }

        let payload = { ...editFormData };

        if (editFile) {
            try {
                const uploadData = await adminApi.uploadFileToR2(editFile);
                if (!uploadData?.success || !uploadData?.url) {
                    throw new Error(uploadData?.error || 'Failed to upload');
                }
                payload.url = uploadData.url;
            } catch (error) {
                toast.error('Failed to upload new file: ' + (error.response?.data?.error || error.message));
                return;
            }
        }

        updateAssetMutation.mutate({ id: editingAsset.id, data: payload });
    };

    const handleEditFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setEditFile(e.target.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error('Please select a file to upload.');
            return;
        }
        if (!formData.name.trim()) {
            toast.error('Please provide a name for the asset.');
            return;
        }

        setIsUploading(true);
        const data = new FormData();
        data.append('image', selectedFile);
        data.append('name', formData.name);
        data.append('type', formData.type);
        data.append('is_premium', formData.is_premium);

        createAssetMutation.mutate(data);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this asset? This cannot be undone.')) {
            deleteAssetMutation.mutate(id);
        }
    };

    const roomAssets = assets.filter((a) => ['background', 'frame'].includes(a.type));
    const filteredAssets = roomAssets.filter((a) => activeTab === 'all' || a.type === activeTab);
    const isUpdating = updateAssetMutation.isPending || updateAssetMutation.isLoading;

    return (
        <div className="space-y-6">
            {/* Upload New Asset Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/80 p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/70">
                        <Plus size={18} />
                    </span>
                    <span>อัปโหลดทรัพยากรใหม่ (Upload New Asset)</span>
                </h3>

                <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                            Asset Type
                        </label>
                        <select
                            className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 bg-slate-50/70 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            disabled={isUploading}
                        >
                            <option value="background">Background</option>
                            <option value="frame">Frame</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                            Name
                        </label>
                        <input
                            type="text"
                            className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 bg-slate-50/70 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                            placeholder="e.g. Neon Cyber"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            disabled={isUploading}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                            File (Image / .json)
                        </label>
                        <input
                            id="asset-file-input"
                            type="file"
                            accept="image/*,application/json"
                            className="w-full border border-slate-200 rounded-xl p-2 text-xs text-slate-700 bg-slate-50/70 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </div>

                    <div className="flex items-center h-[42px] px-2">
                        <label className="flex items-center cursor-pointer select-none">
                            <input
                                type="checkbox"
                                className="mr-2 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                checked={formData.is_premium}
                                onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                                disabled={isUploading}
                            />
                            <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                Premium Asset <Star size={14} className="text-amber-500 fill-amber-400" />
                            </span>
                        </label>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-2.5 px-4 rounded-xl flex justify-center items-center gap-2 shadow-sm shadow-indigo-500/20 transition-all disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            {isUploading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    <Upload size={16} />
                                    <span>Upload</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Asset Library Grid */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-50/70 gap-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <ImageIcon className="text-indigo-600" size={18} />
                        <span>คลังทรัพยากร (Asset Library)</span>
                    </h3>

                    <div className="flex bg-slate-200/70 p-1 rounded-xl gap-1">
                        {[
                            { id: 'all', label: `All (${roomAssets.length})` },
                            { id: 'background', label: 'Backgrounds' },
                            { id: 'frame', label: 'Frames' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                    activeTab === tab.id
                                        ? 'bg-white text-indigo-700 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-5">
                    {isLoading ? (
                        <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
                            <Loader2 size={30} className="animate-spin text-indigo-600" />
                            <span className="text-sm font-medium">Loading assets...</span>
                        </div>
                    ) : filteredAssets.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 font-medium">
                            No assets uploaded yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredAssets.map((asset) => (
                                <div
                                    key={asset.id}
                                    className="border border-slate-200/80 rounded-2xl overflow-hidden group hover:border-indigo-300 hover:shadow-md transition-all bg-white flex flex-col"
                                >
                                    <div className="aspect-square bg-slate-100 relative flex items-center justify-center overflow-hidden">
                                        {asset.url?.endsWith('.json') ? (
                                            <LottieViewer url={asset.url} className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <img
                                                src={asset.url}
                                                alt={asset.name}
                                                className="w-full h-full object-cover"
                                            />
                                        )}

                                        {asset.is_premium && (
                                            <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-amber-400/95 text-slate-950 px-2 py-0.5 text-[10px] font-extrabold shadow-sm">
                                                <Star size={11} className="fill-slate-950" /> PRO
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-3.5 flex items-center justify-between gap-2 border-t border-slate-100">
                                        <div className="min-w-0">
                                            <h4
                                                className="font-bold text-sm text-slate-800 truncate"
                                                title={asset.name}
                                            >
                                                {asset.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 capitalize">{asset.type}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(asset)}
                                                aria-label={`แก้ไข ${asset.name}`}
                                                title="Edit Asset"
                                                className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(asset.id)}
                                                aria-label={`ลบ ${asset.name}`}
                                                title="Delete Asset"
                                                className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Asset Modal */}
            {editingAsset && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                    onClick={() => setEditingAsset(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-5 border-b border-slate-200/80 bg-slate-50/80">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <Edit2 size={18} className="text-indigo-600" />
                                Edit Asset
                            </h3>
                            <button
                                type="button"
                                onClick={() => setEditingAsset(null)}
                                aria-label="ปิดหน้าต่าง"
                                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Asset Name
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Asset Type
                                </label>
                                <select
                                    value={editFormData.type}
                                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                                >
                                    <option value="background">Background</option>
                                    <option value="frame">Frame/Foreground</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    New File (Optional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*,application/json"
                                    onChange={handleEditFileChange}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                                />
                                <p className="text-xs text-slate-500 mt-1.5">Leave empty to keep the current file.</p>
                            </div>
                            <div className="flex items-center pt-1">
                                <input
                                    type="checkbox"
                                    id="edit_is_premium"
                                    checked={editFormData.is_premium}
                                    onChange={(e) => setEditFormData({ ...editFormData, is_premium: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="edit_is_premium" className="ml-2 text-sm font-medium text-slate-700 flex items-center">
                                    Premium Asset <Star size={14} className="ml-1 text-amber-500 fill-amber-400" />
                                </label>
                            </div>
                            <div className="flex justify-end pt-4 gap-2.5 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingAsset(null)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl transition-all disabled:opacity-50 inline-flex items-center gap-2"
                                >
                                    {isUpdating && <Loader2 size={15} className="animate-spin" />}
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetManager;
