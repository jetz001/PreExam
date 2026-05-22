// Reverting changes to match original state roughly or just removing the added fields
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Edit, Trash2, Plus, X, Save } from 'lucide-react';
import newsService from '../../services/newsService';

const NewsManager = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        category: 'General',
        image_url: '',
        external_link: '',
        pdf_url: '',
        product_link: '',
        keywords: ''
    });

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const response = await newsService.getNews();
            // Handle different response structures if needed (e.g. paginated vs list)
            setNews(response.data || []);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await api.delete(`/news/${id}`);
                fetchNews();
            } catch (error) {
                alert('Failed to delete news');
            }
        }
    };

    const handleEdit = (item) => {
        setEditingNews(item);
        setFormData({
            title: item.title,
            summary: item.summary || '',
            category: item.category || 'General',
            image_url: item.image_url || '',
            external_link: item.external_link || '',
            pdf_url: item.pdf_url || '',
            product_link: item.product_link || '',
            keywords: item.keywords || ''
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingNews(null);
        setFormData({
            title: '',
            summary: '',
            category: 'General',
            image_url: '',
            external_link: '',
            pdf_url: '',
            product_link: '',
            keywords: ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingNews) {
                await api.put(`/news/${editingNews.id}`, formData);
            } else {
                await api.post('/news', formData);
            }
            setIsModalOpen(false);
            fetchNews();
        } catch (error) {
            console.error(error);
            alert('Failed to save news');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">จัดการข่าวสาร</h2>
                <button
                    onClick={handleCreate}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    เพิ่มข่าวใหม่
                </button>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-4">Loading...</td></tr>
                        ) : news.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.title}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(item.published_at || item.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                        <Edit className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-10">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            {editingNews ? 'แก้ไขข่าว' : 'เพิ่มข่าวใหม่'}
                                        </h3>
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Title */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">หัวข้อข่าว (Title)</label>
                                            <input
                                                type="text"
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">หมวดหมู่ (Category)</label>
                                            <select
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            >
                                                <option value="General">General</option>
                                                <option value="Exam Update">Exam Update</option>
                                                <option value="Announcement">Announcement</option>
                                                <option value="Tips">Tips</option>
                                            </select>
                                        </div>

                                        {/* Summary */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">เนื้อหาย่อ (Summary)</label>
                                            <textarea
                                                rows="3"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.summary}
                                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                            />
                                        </div>

                                        {/* Image URL */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">รูปภาพปก URL (Image URL)</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.image_url}
                                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            />
                                        </div>

                                        {/* PDF URL */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">ลิงก์ประกาศ PDF (PDF URL)</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.pdf_url}
                                                onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                                            />
                                        </div>

                                        {/* External Link & Auto-fill */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">ลิงก์ต้นทาง (External Source)</label>
                                            <div className="flex mt-1">
                                                <input
                                                    type="text"
                                                    className="block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={formData.external_link}
                                                    onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                                                    placeholder="Paste URL here..."
                                                />
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        if (!formData.external_link) return alert('Please enter a URL first');
                                                        try {
                                                            const res = await api.post('/news/scrape', { url: formData.external_link });
                                                            if (res.data.success) {
                                                                const { title, summary, image_url, keywords } = res.data.data;
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    title: title || prev.title,
                                                                    summary: summary || prev.summary,
                                                                    image_url: image_url || prev.image_url,
                                                                    keywords: keywords || prev.keywords
                                                                }));
                                                                alert('Auto-filled content from URL!');
                                                            } else {
                                                                alert('Could not auto-fill. Please type manually.');
                                                            }
                                                        } catch (e) {
                                                            alert('Failed to fetch URL.');
                                                            console.error(e);
                                                        }
                                                    }}
                                                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                                                    title="Auto-fill from URL"
                                                >
                                                    ✨ Auto-fill
                                                </button>
                                            </div>
                                        </div>

                                        {/* Product Link */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">ลิงก์สินค้าแนะนำ (Product Link) [KPI Focus]</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full border-yellow-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-yellow-50"
                                                value={formData.product_link}
                                                onChange={(e) => setFormData({ ...formData, product_link: e.target.value })}
                                                placeholder="Link to study guide store..."
                                            />
                                        </div>

                                        {/* Keywords */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Keywords (SEO/Value)</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.keywords}
                                                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                                placeholder="e.g. สอบกพ, ข้าราชการ, งานราชการ"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        บันทึก
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        ยกเลิก
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsManager;
