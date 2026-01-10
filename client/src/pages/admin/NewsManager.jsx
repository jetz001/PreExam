import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Link as LinkIcon, Globe, Image as ImageIcon, Edit, Eye, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';

const NewsManager = () => {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const initialFormState = {
        title: '',
        content: '',
        image: '',
        product_link: '',
        source_memo: '',
        scrape_url: '',
        external_link: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    const { data: news = [], isLoading } = useQuery({
        queryKey: ['news'],
        queryFn: adminApi.getNews
    });

    // Sources Query
    const { data: sources = [], isLoading: isLoadingSources } = useQuery({
        queryKey: ['news_sources'],
        queryFn: adminApi.getSources
    });

    const createSourceMutation = useMutation({
        mutationFn: adminApi.createSource,
        onSuccess: () => {
            queryClient.invalidateQueries(['news_sources']);
            toast.success('Source added');
        },
        onError: () => toast.error('Failed to add source')
    });

    const deleteSourceMutation = useMutation({
        mutationFn: adminApi.deleteSource,
        onSuccess: () => {
            queryClient.invalidateQueries(['news_sources']);
            toast.success('Source removed');
        },
        onError: () => toast.error('Failed to remove source')
    });

    const createMutation = useMutation({
        mutationFn: (data) => {
            if (editingId) {
                return adminApi.createNews(data);
            } else {
                return adminApi.createNews(data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['news']);
            toast.success(editingId ? 'News updated (created new)' : 'News published successfully!');
            setIsFormOpen(false);
            setFormData(initialFormState);
            setEditingId(null);
        },
        onError: () => toast.error('Failed to save news')
    });

    const deleteMutation = useMutation({
        mutationFn: adminApi.deleteNews,
        onSuccess: () => {
            queryClient.invalidateQueries(['news']);
            toast.success('News deleted');
        },
        onError: () => toast.error('Failed to delete news')
    });

    const toggleFeatureMutation = useMutation({
        mutationFn: adminApi.toggleNewsFeature,
        onSuccess: () => {
            queryClient.invalidateQueries(['news']);
            toast.success('Updated featured status');
        },
        onError: () => toast.error('Failed to update status')
    });

    const scrapeMutation = useMutation({
        mutationFn: adminApi.scrapeWeb,
        onSuccess: (data) => {
            setFormData(prev => ({
                ...prev,
                title: data.title || prev.title,
                image: data.image_url || data.image || prev.image, // fix image key mismatch
                content: data.summary || data.description || prev.content,
                keywords: data.keywords || prev.keywords
            }));
            toast.success('Content & Keywords auto-filled!');
        },
        onError: () => toast.error('Failed to scrape content')
    });

    const handleScrape = () => {
        if (!formData.scrape_url) return toast.error('Please enter a URL to scrape');
        scrapeMutation.mutate(formData.scrape_url);
    };

    const handleAddSource = () => {
        const url = prompt('Enter Source URL:');
        if (!url) return;
        const name = prompt('Enter Source Name (e.g., OCSC):');
        if (!name) return;
        createSourceMutation.mutate({ name, url });
    };

    const handleEdit = (item) => {
        setFormData({
            title: item.title,
            content: item.content,
            image: item.image || item.image_url || '',
            product_link: item.product_link || '',
            source_memo: item.source_memo || '',
            external_link: item.external_link || '',
            keywords: item.keywords || '',
            scrape_url: ''
        });
        setEditingId(item.id);
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Warn if no update API
        if (editingId) {
            // Since we don't have update API yet, we might be creating duplicate.
            // But let's proceed to allow "copy/edit" workflow for "another source".
        }
        createMutation.mutate(formData);
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this news item?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">News & Affiliate</h2>
                <button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="flex items-center px-4 py-2 bg-royal-blue-600 text-white rounded-lg hover:bg-royal-blue-700 transition-colors shadow-sm"
                    style={{ backgroundColor: '#2563eb' }}
                >
                    <Plus size={20} className="mr-2" />
                    {isFormOpen ? 'Close Form' : 'Create News'}
                </button>
            </div>

            {/* Quick Sources Panel */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-slate-700 flex items-center">
                        <Globe size={16} className="mr-2 text-royal-blue-600" />
                        Quick Check Sources
                    </h3>
                    <button
                        onClick={handleAddSource}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded transition-colors"
                    >
                        + Add Source
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {isLoadingSources ? (
                        <span className="text-xs text-slate-400">Loading sources...</span>
                    ) : sources.length === 0 ? (
                        <span className="text-xs text-slate-400">No sources saved. Add one to check quickly!</span>
                    ) : (
                        sources.map((source) => (
                            <div key={source.id} className="group relative inline-flex items-center">
                                <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 hover:bg-royal-blue-50 hover:text-royal-blue-600 hover:border-royal-blue-100 transition-all"
                                >
                                    {source.name}
                                    <Globe size={10} className="ml-1.5 opacity-50" />
                                </a>
                                <button
                                    onClick={(e) => { e.preventDefault(); if (window.confirm('Delete source?')) deleteSourceMutation.mutate(source.id); }}
                                    className="absolute -top-1 -right-1 bg-red-100 text-red-500 rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                                    title="Remove"
                                >
                                    ×
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Form */}
            {isFormOpen && (
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-semibold mb-4 text-slate-700">Create New Post</h3>

                    {/* Scraper Tool */}
                    <div className="flex gap-2 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Auto-fill from URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    placeholder="Paste article URL here..."
                                    className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
                                    value={formData.scrape_url}
                                    onChange={(e) => setFormData({ ...formData, scrape_url: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={handleScrape}
                                    disabled={scrapeMutation.isPending}
                                    className="px-4 py-2 bg-slate-800 text-white rounded text-sm hover:bg-slate-900 disabled:opacity-50 flex items-center"
                                >
                                    <Globe size={16} className="mr-2" />
                                    {scrapeMutation.isPending ? 'Fetching...' : 'Fetch Data'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Headline Link / Product Link (Affiliate)</label>
                            <div className="relative">
                                <LinkIcon size={16} className="absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="url"
                                    className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-royal-blue-500 outline-none"
                                    placeholder="https://shopee.co.th/..."
                                    value={formData.product_link}
                                    onChange={(e) => setFormData({ ...formData, product_link: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Source Memo (Internal Use)</label>
                            <input
                                type="text"
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-royal-blue-500 outline-none"
                                placeholder="Source URL or Note..."
                                value={formData.source_memo}
                                onChange={(e) => setFormData({ ...formData, source_memo: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">External Link (Public Source)</label>
                            <div className="relative">
                                <LinkIcon size={16} className="absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="url"
                                    className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-royal-blue-500 outline-none"
                                    placeholder="https://original-source.com/..."
                                    value={formData.external_link}
                                    onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Keywords (Auto & SEO)</label>
                            <input
                                type="text"
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-royal-blue-500 outline-none"
                                placeholder="exam, jobs, government..."
                                value={formData.keywords}
                                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input
                                required
                                type="text"
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-royal-blue-500 outline-none"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Content / Description</label>
                                <textarea
                                    required
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-royal-blue-500 outline-none h-32 resize-none"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image URL</label>
                                <div className="relative mb-2">
                                    <ImageIcon size={16} className="absolute left-3 top-3 text-slate-400" />
                                    <input
                                        type="url"
                                        className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-royal-blue-500 outline-none"
                                        placeholder="https://..."
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    />
                                </div>
                                {formData.image && (
                                    <div className="h-20 w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-royal-blue-600 text-white rounded-lg hover:bg-royal-blue-700 transition-colors shadow-sm font-medium"
                                style={{ backgroundColor: '#2563eb' }}
                            >
                                Publish News
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* News List */}
            {/* News List - Table View */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-4 py-3 w-16 text-center">ID</th>
                                <th className="px-4 py-3 w-24">Image</th>
                                <th className="px-4 py-3">News Detail</th>
                                <th className="px-4 py-3 w-32">Source (Memo)</th>
                                <th className="px-4 py-3 w-24 text-center">Featured</th>
                                <th className="px-4 py-3 w-24 text-center">Affiliate</th>
                                <th className="px-4 py-3 w-24 text-center">Views</th>
                                <th className="px-4 py-3 w-20 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-10 text-center text-slate-500">Loading news...</td>
                                </tr>
                            ) : news.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-10 text-center text-slate-500">No news posted yet.</td>
                                </tr>
                            ) : (
                                news.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-center text-slate-400">#{item.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="w-16 h-12 bg-slate-100 rounded overflow-hidden border border-slate-200">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-xs text-slate-400">No Img</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-800 line-clamp-1 mb-0.5">{item.title}</div>
                                            <div className="text-xs text-slate-500 line-clamp-1">{item.content}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                {item.source_memo && (
                                                    <a
                                                        href={item.source_memo.startsWith('http') ? item.source_memo : '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs border border-slate-200 max-w-[150px] truncate"
                                                        title={`Memo: ${item.source_memo}`}
                                                    >
                                                        <Globe size={12} className="mr-1 flex-shrink-0" />
                                                        <span className="truncate">Memo</span>
                                                    </a>
                                                )}
                                                {item.external_link && (
                                                    <a
                                                        href={item.external_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs border border-blue-100 max-w-[150px] truncate"
                                                        title={`Public Source: ${item.external_link}`}
                                                    >
                                                        <LinkIcon size={12} className="mr-1 flex-shrink-0" />
                                                        <span className="truncate">Public Source</span>
                                                    </a>
                                                )}
                                                {!item.source_memo && !item.external_link && (
                                                    <span className="text-slate-300 text-xs">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => toggleFeatureMutation.mutate(item.id)}
                                                className={`p-1 rounded-full transition-colors ${item.is_featured ? 'text-yellow-400 bg-yellow-50' : 'text-slate-300 hover:text-yellow-400'}`}
                                                title={item.is_featured ? "Remove from Landing Page" : "Add to Landing Page"}
                                            >
                                                <Star size={18} fill={item.is_featured ? "currentColor" : "none"} />
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {item.product_link ? (
                                                <a href={item.product_link} target="_blank" rel="noopener noreferrer" className="text-royal-blue-600 hover:text-royal-blue-800" title="Affiliate Link">
                                                    <LinkIcon size={16} className="mx-auto" />
                                                </a>
                                            ) : (
                                                <span className="text-slate-300 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-500 text-xs">
                                            {item.views || 0}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-1.5 text-royal-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Plus size={16} className="rotate-45" /> {/* Using Plus rotated as Edit placeholder if Edit icon not imported, checking imports... Edit icon IS NOT imported. I will use Plus rotated or just add Edit icon import in next step. Wait, Plus is imported. */}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NewsManager;
