import React, { useState, useEffect } from 'react';
import axios from '../../services/api';
import authService from '../../services/authService';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

const AssetManager = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({ type: 'background', name: '', image: null, is_premium: true });
    const [viewMode, setViewMode] = useState('desktop'); // desktop, tablet, mobile
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        fetchAssets();
    }, []);

    // Cleanup preview URL to avoid memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const fetchAssets = async () => {
        try {
            const response = await axios.get('/assets');
            if (response.data.success) {
                setAssets(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newItem.image) {
            alert('Please select an image file');
            return;
        }

        const formData = new FormData();
        formData.append('type', newItem.type);
        formData.append('name', newItem.name);
        formData.append('image', newItem.image);
        formData.append('is_premium', newItem.is_premium);

        try {
            await axios.post('/assets', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${authService.getToken()}`
                }
            });
            setNewItem({ type: 'background', name: '', image: null, is_premium: true });
            setPreviewUrl(null);
            // Reset file input manually if needed or let react handle it via key or controlled input ref
            fetchAssets();
        } catch (error) {
            alert('Failed to create asset');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewItem({ ...newItem, image: file });
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`/assets/${id}`, {
                headers: { Authorization: `Bearer ${authService.getToken()}` }
            });
            fetchAssets();
        } catch (error) {
            alert('Failed to delete asset');
        }
    };

    const getPreviewStyle = () => {
        switch (viewMode) {
            case 'mobile': return { width: '200px', aspectRatio: '9/16' };
            case 'tablet': return { width: '280px', aspectRatio: '3/4' }; // 3:4 or 4:3 usually portrait for listing
            default: return { width: '100%', aspectRatio: '16/9' };
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Asset Manager (Frames & Backgrounds)</h2>

            {/* Create Form */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h3 className="text-lg font-semibold mb-4">Add New Asset</h3>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            value={newItem.type}
                            onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                        >
                            <option value="background">Background</option>
                            <option value="frame">Frame</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Image File</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                            required
                        />
                    </div>
                    <div className="flex items-end">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={newItem.is_premium}
                                onChange={(e) => setNewItem({ ...newItem, is_premium: e.target.checked })}
                                className="rounded text-indigo-600"
                            />
                            <span className="text-sm font-medium text-gray-700">Premium Only</span>
                        </label>
                    </div>
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                        >
                            Add Asset
                        </button>
                    </div>
                </form>
            </div>

            {/* View Mode Toggle */}
            <div className="flex flex-col items-center mb-6 space-y-2">
                <div className="flex space-x-2 bg-gray-100 p-2 rounded-lg">
                    <button
                        onClick={() => setViewMode('desktop')}
                        className={`p-2 rounded flex items-center space-x-2 ${viewMode === 'desktop' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:bg-white/50'}`}
                        title="Desktop View"
                    >
                        <Monitor size={20} />
                        <span className="text-sm font-medium">Desktop (16:9)</span>
                    </button>
                    <button
                        onClick={() => setViewMode('tablet')}
                        className={`p-2 rounded flex items-center space-x-2 ${viewMode === 'tablet' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:bg-white/50'}`}
                        title="Tablet View"
                    >
                        <Tablet size={20} />
                        <span className="text-sm font-medium">Tablet (3:4)</span>
                    </button>
                    <button
                        onClick={() => setViewMode('mobile')}
                        className={`p-2 rounded flex items-center space-x-2 ${viewMode === 'mobile' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:bg-white/50'}`}
                        title="Mobile View"
                    >
                        <Smartphone size={20} />
                        <span className="text-sm font-medium">Mobile (9:16)</span>
                    </button>
                </div>
                <p className="text-xs text-gray-500">
                    Previewing aspect ratio: {viewMode === 'desktop' ? '16:9 (Standard Desktop)' : viewMode === 'tablet' ? '3:4 (iPad/Tablet)' : '9:16 (Modern Smartphone)'}
                </p>
            </div>

            {/* List and Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Preview of New Item */}
                {previewUrl && (
                    <div className="bg-indigo-50 border-2 border-indigo-200 border-dashed rounded-lg shadow overflow-hidden relative group flex flex-col items-center">
                        <div className="w-full bg-gray-100 flex items-center justify-center overflow-hidden p-4 transition-all duration-300">
                            <div
                                style={getPreviewStyle()}
                                className="relative bg-white shadow-sm flex items-center justify-center overflow-hidden transition-all duration-300"
                            >
                                {newItem.type === 'background' ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="relative w-full h-full p-4 flex items-center justify-center bg-gray-50">
                                        <div className="absolute inset-0 border-8" style={{ borderImage: `url(${previewUrl}) 30 round` }}></div>
                                        <span className="text-xs text-gray-400">Frame Preview</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 w-full text-center">
                            <span className="text-indigo-600 font-semibold">New Asset Preview</span>
                        </div>
                    </div>
                )}
                {assets.map(asset => (
                    <div key={asset.id} className="bg-white rounded-lg shadow overflow-hidden relative group flex flex-col items-center">
                        <div className="w-full bg-gray-100 flex items-center justify-center overflow-hidden p-4 transition-all duration-300">
                            <div
                                style={getPreviewStyle()}
                                className="relative bg-white shadow-sm flex items-center justify-center overflow-hidden transition-all duration-300"
                            >
                                {asset.type === 'background' ? (
                                    <img src={asset.url.startsWith('http') ? asset.url : `${window.location.protocol}//${window.location.hostname}:3000${asset.url}`} alt={asset.name} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=Asset&background=random'} />
                                ) : (
                                    <div className="relative w-full h-full p-4 flex items-center justify-center bg-gray-50">
                                        <div className="absolute inset-0 border-8" style={{ borderImage: `url(${asset.url.startsWith('http') ? asset.url : `${window.location.protocol}//${window.location.hostname}:3000${asset.url}`}) 30 round` }}></div>
                                        <span className="text-xs text-gray-400">Frame</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 w-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold">{asset.name}</h4>
                                    <p className="text-sm text-gray-500 capitalize">{asset.type}</p>
                                </div>
                                {asset.is_premium && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Premium</span>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-2 truncate" title={asset.url}>{asset.url}</p>
                            <button
                                onClick={() => handleDelete(asset.id)}
                                className="mt-3 w-full border border-red-500 text-red-500 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AssetManager;
