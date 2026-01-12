import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Eye, MoreHorizontal, CheckCircle, XCircle, Store } from 'lucide-react';
import toast from 'react-hot-toast';

const BusinessManager = () => {
    const [search, setSearch] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);

    const { data: businesses, isLoading, refetch } = useQuery({
        queryKey: ['adminBusinesses'],
        queryFn: async () => {
            // ... existing
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/admin/businesses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data;
        }
    });

    const handleVerify = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            // Optimistic update or refetch
            await axios.put(`/api/admin/businesses/${id}/verify`, { is_verified: status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(status ? 'Business verified!' : 'Verification revoked');
            refetch();
            setOpenMenuId(null);
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/admin/businesses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Business deleted');
            refetch();
            setOpenMenuId(null);
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const filteredBusinesses = businesses?.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.Owner?.display_name.toLowerCase().includes(search.toLowerCase())
    ) || [];

    if (isLoading) return <div className="p-8 text-center">Loading businesses...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">จัดการเพจธุรกิจ</h2>
                    <p className="text-gray-500">Manage all registered business pages</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search business name or owner..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">Business</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Owner</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Category</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Stats</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredBusinesses.map(business => (
                            <tr key={business.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                            {business.logo_image ? (
                                                <img src={getImageUrl(business.logo_image)} className="w-full h-full object-cover" />
                                            ) : (
                                                <Store className="text-gray-400" size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{business.name}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{business.tagline}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-900">{business.Owner?.display_name || 'Unknown'}</p>
                                        <p className="text-gray-500">{business.Owner?.email}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                                        {business.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="flex flex-col gap-1">
                                        <span>Items: {business.item_count || 0}</span>
                                        <span>Followers: {business.stats?.followers || 0}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {business.is_verified ? (
                                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                            <CheckCircle size={16} /> Verified
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-gray-400 text-sm">
                                            Not Verified
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right relative">
                                    <div className="relative">
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === business.id ? null : business.id)}
                                            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <MoreHorizontal size={20} />
                                        </button>

                                        {openMenuId === business.id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1 text-left">
                                                <button
                                                    onClick={() => handleVerify(business.id, !business.is_verified)}
                                                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    {business.is_verified ? (
                                                        <> <XCircle size={16} className="text-red-500" /> Revoke Verify </>
                                                    ) : (
                                                        <> <CheckCircle size={16} className="text-green-500" /> Verify Page </>
                                                    )}
                                                </button>
                                                {/* Placeholder for future detailed edit */}
                                                <button
                                                    onClick={() => toast('Edit feature coming soon', { icon: '🚧' })}
                                                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <Eye size={16} /> View Details
                                                </button>
                                                <div className="border-t border-gray-100 my-1"></div>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this business page?')) handleDelete(business.id);
                                                    }}
                                                    className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                >
                                                    <XCircle size={16} /> Delete Page
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredBusinesses.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                    No businesses found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BusinessManager;
