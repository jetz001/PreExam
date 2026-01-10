import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // Using relative path based on file location
import { MessageSquare, Trash2, Search, AlertTriangle, Check, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const CommunityManager = () => {
    const [activeTab, setActiveTab] = useState('threads'); // 'threads' or 'reports'
    const [threads, setThreads] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (activeTab === 'threads') {
            fetchThreads(1);
        } else {
            fetchReports();
        }
    }, [activeTab]);

    const fetchThreads = async (page = 1) => {
        setLoading(true);
        try {
            const res = await api.get('/admin/threads', {
                params: { page, limit: 20, search: searchTerm }
            });
            setThreads(res.data.threads);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error('Error fetching threads:', error);
            toast.error('Failed to load threads');
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/reports');
            setReports(res.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteThread = async (id) => {
        if (!confirm('Are you sure you want to delete this thread?')) return;
        try {
            await api.delete(`/admin/threads/${id}`);
            toast.success('Thread deleted');
            fetchThreads(pagination.page);
        } catch (error) {
            toast.error('Failed to delete thread');
        }
    };

    const handleResolveReport = async (id, action) => {
        if (!confirm(`Are you sure you want to ${action === 'delete_content' ? 'delete content' : 'dismiss report'}?`)) return;
        try {
            await api.post(`/admin/reports/${id}/resolve`, { action });
            toast.success('Report processed');
            fetchReports();
        } catch (error) {
            toast.error('Failed to process report');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchThreads(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">จัดการชุมชน (Community Management)</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setActiveTab('threads')}
                        className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'threads' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        Threads
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center ${activeTab === 'reports' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Reported Content
                    </button>
                </div>
            </div>

            {activeTab === 'threads' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleSearch} className="mb-6 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search threads..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <button type="submit" className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">
                            Search
                        </button>
                    </form>

                    {loading ? (
                        <div className="text-center py-8">Loading threads...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-4 font-medium text-gray-500">ID</th>
                                        <th className="p-4 font-medium text-gray-500">Topic</th>
                                        <th className="p-4 font-medium text-gray-500">Author</th>
                                        <th className="p-4 font-medium text-gray-500 text-center">Stats</th>
                                        <th className="p-4 font-medium text-gray-500">Created</th>
                                        <th className="p-4 font-medium text-gray-500 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {threads.map((thread) => (
                                        <tr key={thread.id} className="hover:bg-gray-50">
                                            <td className="p-4 text-gray-900">#{thread.id}</td>
                                            <td className="p-4 font-medium text-gray-900">{thread.title}</td>
                                            <td className="p-4 text-gray-600">{thread.author}</td>
                                            <td className="p-4 text-center text-sm text-gray-500">
                                                <div className="flex justify-center space-x-3">
                                                    <span title="Views"><Eye className="w-4 h-4 inline mr-1" />{thread.views}</span>
                                                    <span title="Likes" className="text-red-500">♥ {thread.likes}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {new Date(thread.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteThread(thread.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Delete Thread"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {threads.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="p-8 text-center text-gray-500">
                                                No threads found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center mt-6 space-x-2">
                            <button
                                onClick={() => fetchThreads(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-3 py-1 border rounded disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="px-3 py-1 text-gray-600">
                                Page {pagination.page} / {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => fetchThreads(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="px-3 py-1 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold mb-4 text-red-600 flex items-center">
                        <AlertTriangle className="mr-2" /> Pending Reports
                    </h3>

                    {loading ? (
                        <div className="text-center py-8">Loading reports...</div>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((report) => (
                                <div key={report.id} className="border border-red-100 rounded-lg p-4 bg-red-50 flex flex-col md:flex-row gap-4 justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${report.type === 'thread' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                {report.type}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                Reported by <span className="font-medium text-gray-900">{report.reporter}</span>
                                                {' • '}{new Date(report.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="font-bold text-gray-800 mb-1">Reason: {report.reason}</p>
                                        <div className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-600 mt-2">
                                            " {report.content_preview} "
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleResolveReport(report.id, 'dismiss')}
                                            className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center"
                                        >
                                            <X className="w-4 h-4 mr-1" /> Dismiss
                                        </button>
                                        <button
                                            onClick={() => handleResolveReport(report.id, 'delete_content')}
                                            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" /> Delete Content
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {reports.length === 0 && (
                                <div className="text-center py-8 text-gray-500 bg-white rounded border border-dashed">
                                    No pending reports. Great job!
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommunityManager;
