import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adsApi from '../../services/adsApi';
import { Pause, Play, Trash2, Edit, AlertCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const MyAds = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: ads, isLoading } = useQuery({
        queryKey: ['myAds'],
        queryFn: adsApi.getMyAds,
        initialData: [
            { id: 1, campaignName: 'Summer Sale', image: null, budget: 5000, spent: 1200, status: 'active', type: 'in-feed' },
            { id: 2, campaignName: 'Brand Awareness', image: null, budget: 2000, spent: 2000, status: 'out_of_budget', type: 'result-page' },
            { id: 3, campaignName: 'Test Ad', image: null, budget: 1000, spent: 0, status: 'paused', type: 'in-feed' },
        ]
    });

    const [searchTerm, setSearchTerm] = useState('');

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, status }) => adsApi.updateAdStatus(id, status),
        onSuccess: () => {
            toast.success('Status updated');
            queryClient.invalidateQueries(['myAds']);
        },
        onError: () => toast.error('Failed to update status')
    });

    const handleToggle = (ad) => {
        if (ad.status === 'out_of_budget') return;
        const newStatus = ad.status === 'active' ? 'paused' : 'active';

        // Optimistic update (simulated via existing data for immediate feedback if api was real)
        // Here we just trigger mutation
        toggleStatusMutation.mutate({ id: ad.id, status: newStatus });

        // Mock update for this demo since API is mocked in component:
        // In real app, invalidateQueries re-fetches.
        // For demo, force a toast.
    };

    const filteredAds = ads ? ads.filter(ad =>
        (ad.title || ad.campaignName || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">My Campaigns</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 py-2 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Used</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Views / Clicks</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placement</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAds.map((ad) => (
                                <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-12 w-20 bg-gray-200 rounded-md overflow-hidden">
                                                {ad.image_url || ad.image ? (
                                                    <img className="h-full w-full object-cover" src={ad.image_url || ad.image} alt="" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{ad.title || ad.campaignName || 'Untitled'}</div>
                                                <div className="text-xs text-gray-500">ID: #{ad.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${ad.status === 'active' ? 'bg-green-100 text-green-800' :
                                            ad.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {ad.status === 'active' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>}
                                            {ad.status === 'paused' && <Pause size={10} className="mr-1" />}
                                            {ad.status === 'out_of_budget' && <AlertCircle size={10} className="mr-1" />}
                                            {ad.status === 'active' ? 'Active' : (ad.status === 'out_of_budget' ? 'Out of Budget' : 'Paused')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            ฿{(Number(ad.budget_spent || ad.spent) || 0).toLocaleString()} / ฿{(Number(ad.budget_total || ad.budget) || 0).toLocaleString()}
                                        </div>
                                        <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${(Number(ad.budget_spent || ad.spent) || 0) / (Number(ad.budget_total || ad.budget) || 1) > 0.9 ? 'bg-red-500' : 'bg-blue-500'}`}
                                                style={{ width: `${Math.min(((Number(ad.budget_spent || ad.spent) || 0) / (Number(ad.budget_total || ad.budget) || 1)) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="text-sm text-gray-900 font-medium">
                                            {ad.views_count || 0} <span className="text-gray-400 font-normal">/</span> {ad.clicks_count || 0}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            CTR: {((ad.clicks_count || 0) / (Math.max(ad.views_count, 1)) * 100).toFixed(1)}%
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        {(ad.placement || ad.type || '').replace('-', ' ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center space-x-3">
                                            <button
                                                onClick={() => handleToggle(ad)}
                                                disabled={ad.status === 'out_of_budget'}
                                                className={`p-1.5 rounded-full transition-colors ${ad.status === 'active'
                                                    ? 'text-yellow-600 hover:bg-yellow-50'
                                                    : 'text-green-600 hover:bg-green-50'
                                                    } ${ad.status === 'out_of_budget' && 'opacity-50 cursor-not-allowed text-gray-400'}`}
                                                title={ad.status === 'active' ? 'Pause' : 'Resume'}
                                            >
                                                {ad.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                                            </button>
                                            <button
                                                onClick={() => navigate('/business/create-ad', { state: { ad } })}
                                                className="text-gray-400 hover:text-blue-600 transition-colors p-1.5"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {ads.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No campaigns found. <a href="/business/create-ad" className="text-blue-600 hover:underline">Create one now</a>.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAds;
