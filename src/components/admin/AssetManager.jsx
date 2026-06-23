import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image as ImageIcon, Trash2, Edit2, X, Plus, Star, Film, Loader2 } from 'lucide-react';
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
    const [editFormData, setEditFormData] = useState({});

    const openEditModal = (asset) => {
        setEditingAsset(asset);
        setEditFormData({
            name: asset.name,
            type: asset.type,
            is_premium: asset.is_premium
        });
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
            document.getElementById('asset-file-input').value = '';
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

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!editFormData.name.trim()) {
            toast.error('Asset name is required.');
            return;
        }
        updateAssetMutation.mutate({ id: editingAsset.id, data: editFormData });
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

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center">
                    <Plus className="mr-2 text-royal-blue-600" size={20} />
                    Upload New Asset
                </h3>
                
                <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Asset Type</label>
                        <select 
                            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-royal-blue-500"
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            disabled={isUploading}
                        >
                            <option value="background">Background</option>
                            <option value="frame">Frame</option>
                        </select>
                    </div>

                    <div className="lg:col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
                        <input 
                            type="text" 
                            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-royal-blue-500"
                            placeholder="e.g. Neon Cyber"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            disabled={isUploading}
                        />
                    </div>

                    <div className="lg:col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">File (Image/.json)</label>
                        <input 
                            id="asset-file-input"
                            type="file" 
                            accept="image/*,application/json"
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-royal-blue-500 bg-slate-50"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </div>

                    <div className="lg:col-span-1 flex items-center h-[42px] px-2">
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="mr-2 w-4 h-4 text-blue-600 rounded"
                                checked={formData.is_premium}
                                onChange={(e) => setFormData({...formData, is_premium: e.target.checked})}
                                disabled={isUploading}
                            />
                            <span className="text-sm font-semibold text-slate-700 flex items-center">
                                Premium Asset <Star size={14} className="ml-1 text-amber-500" />
                            </span>
                        </label>
                    </div>

                    <div className="lg:col-span-1">
                        <button 
                            type="submit" 
                            disabled={isUploading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg flex justify-center items-center transition-colors disabled:opacity-70"
                        >
                            {isUploading ? <Loader2 size={18} className="animate-spin" /> : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-bold text-slate-700 flex items-center">
                        <ImageIcon className="mr-2 text-slate-500" size={18} />
                        Asset Library
                    </h3>
                    <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-bold">
                        {assets.filter(a => ['background', 'frame'].includes(a.type)).length} Total
                    </span>
                </div>
                
                <div className="p-4">
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-500 flex flex-col items-center">
                            <Loader2 size={32} className="animate-spin text-royal-blue-500 mb-2" />
                            Loading assets...
                        </div>
                    ) : assets.filter(a => ['background', 'frame'].includes(a.type)).length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No assets uploaded yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {assets.filter(a => ['background', 'frame'].includes(a.type)).map((asset) => (
                                <div key={asset.id} className="border border-slate-200 rounded-xl overflow-hidden group relative bg-slate-50">
                                    <div className="aspect-square bg-slate-200 relative flex items-center justify-center overflow-hidden">
                                        {asset.url?.endsWith('.json') ? (
                                            <LottieViewer url={asset.url} className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                        )}
                                        
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => openEditModal(asset)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transform scale-0 group-hover:scale-100 transition-transform"
                                                title="Edit Asset"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(asset.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transform scale-0 group-hover:scale-100 transition-transform"
                                                title="Delete Asset"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-800 line-clamp-1" title={asset.name}>{asset.name}</h4>
                                                <p className="text-xs text-slate-500 capitalize">{asset.type}</p>
                                            </div>
                                            {asset.is_premium && (
                                                <Star size={14} className="text-amber-500 fill-amber-500 shrink-0" />
                                            )}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center">
                                <Edit2 size={18} className="mr-2 text-royal-blue-600" />
                                Edit Asset
                            </h3>
                            <button onClick={() => setEditingAsset(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Asset Name</label>
                                <input
                                    type="text"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Asset Type</label>
                                <select
                                    value={editFormData.type}
                                    onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal-blue-500"
                                >
                                    <option value="background">Background</option>
                                    <option value="frame">Frame/Foreground</option>
                                </select>
                            </div>
                            <div className="flex items-center pt-2">
                                <input
                                    type="checkbox"
                                    id="edit_is_premium"
                                    checked={editFormData.is_premium}
                                    onChange={(e) => setEditFormData({...editFormData, is_premium: e.target.checked})}
                                    className="w-4 h-4 text-royal-blue-600 border-slate-300 rounded focus:ring-royal-blue-500"
                                />
                                <label htmlFor="edit_is_premium" className="ml-2 text-sm text-slate-700 flex items-center">
                                    Premium Asset <Star size={14} className="ml-1 text-amber-500 fill-amber-500" />
                                </label>
                            </div>
                            <div className="flex justify-end pt-4 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingAsset(null)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateAssetMutation.isLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                                >
                                    {updateAssetMutation.isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                                    Save Changes
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
