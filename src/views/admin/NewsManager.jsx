import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Trash2,
    Link as LinkIcon,
    Globe,
    Image as ImageIcon,
    Edit,
    Star,
    Newspaper,
    X,
    Building2,
    Sparkles,
    Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all';

const NewsManager = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('general'); // 'general' or 'gov'
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showAddSourceForm, setShowAddSourceForm] = useState(false);
    const [newSource, setNewSource] = useState({ name: '', url: '' });

    const initialFormState = {
        title: '',
        content: '',
        image_url: '',
        product_link: '',
        source_memo: '',
        scrape_url: '',
        external_link: '',
        keywords: '',
        category: 'ข่าวทั่วไป',
        agency: '',
        metadata: {
            organization: '',
            supervising_agency: '',
            agency_logo: '',
            recruitment_type: '',
            method: '',
            location: '',
            salary: '',
            position_type: '',
            vacancy_count: '',
            education_level: '',
            requirements: '',
            job_description: '',
            required_knowledge: '',
            skills: '',
            conditions: '',
            application_start: '',
            application_end: '',
            announcement_url: '',
            website: ''
        }
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
            setNewSource({ name: '', url: '' });
            setShowAddSourceForm(false);
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

    const mutation = useMutation({
        mutationFn: (data) => {
            if (editingId) {
                return adminApi.updateNews(editingId, data);
            } else {
                return adminApi.createNews(data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['news']);
            toast.success(editingId ? 'News updated successfully!' : 'News published successfully!');
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
                image_url: data.image_url || prev.image_url,
                content: data.summary || data.description || prev.content,
                keywords: data.keywords || prev.keywords,
                agency: data.agency || prev.agency,
                external_link: data.external_link || prev.external_link,
                metadata: data.metadata ? { ...prev.metadata, ...data.metadata } : prev.metadata
            }));
            toast.success('Content & Details auto-filled!');
        },
        onError: () => toast.error('Failed to scrape content')
    });

    const handleScrape = () => {
        if (!formData.scrape_url) return toast.error('Please enter a URL to scrape');
        scrapeMutation.mutate(formData.scrape_url);
    };

    const handleAddSourceSubmit = (e) => {
        e.preventDefault();
        if (!newSource.url.trim() || !newSource.name.trim()) {
            toast.error('Please enter both Source Name and URL');
            return;
        }
        createSourceMutation.mutate({ name: newSource.name.trim(), url: newSource.url.trim() });
    };

    const handleEdit = (item) => {
        setFormData({
            title: item.title || '',
            content: item.content || '',
            image_url: item.image_url || '',
            product_link: item.product_link || '',
            source_memo: item.source_memo || '',
            external_link: item.external_link || '',
            keywords: item.keywords || '',
            category: item.category || 'ข่าวทั่วไป',
            agency: item.agency || '',
            metadata: { ...initialFormState.metadata, ...(item.metadata || {}) },
            scrape_url: ''
        });
        setEditingId(item.id);
        setActiveTab(item.category === 'งานราชการ' ? 'gov' : 'general');
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            category: activeTab === 'gov' ? 'งานราชการ' : 'ข่าวทั่วไป'
        };
        mutation.mutate(submissionData);
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this news item?')) {
            deleteMutation.mutate(id);
        }
    };

    const filteredNews = (news || []).filter((item) =>
        activeTab === 'gov' ? item.category === 'งานราชการ' : item.category !== 'งานราชการ'
    );

    return (
        <div className="space-y-6 pb-8">
            {/* Executive Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur-sm p-5 sm:p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                        <Newspaper size={24} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                            ข่าวสารและงานราชการ (News &amp; Affiliate)
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            จัดการข่าวประชาสัมพันธ์ ลิงก์ Affiliate และประกาศรับสมัครงานราชการ
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Segmented Pill Tabs */}
                    <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100/90 p-1 border border-slate-200/80" role="tablist">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'general'}
                            onClick={() => setActiveTab('general')}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                activeTab === 'general'
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Newspaper size={15} />
                            <span>General News</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'gov'}
                            onClick={() => setActiveTab('gov')}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                activeTab === 'gov'
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Briefcase size={15} />
                            <span>Government Jobs</span>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            if (isFormOpen) {
                                setIsFormOpen(false);
                                setEditingId(null);
                                setFormData(initialFormState);
                            } else {
                                setIsFormOpen(true);
                                setEditingId(null);
                                setFormData(initialFormState);
                            }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        {isFormOpen ? <X size={18} /> : <Plus size={18} />}
                        <span>{isFormOpen ? 'Close Form' : 'Create News'}</span>
                    </button>
                </div>
            </div>

            {/* Quick Sources Panel */}
            <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-5 border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Globe size={16} className="text-indigo-600" />
                        <span>Quick Check Sources</span>
                    </h3>
                    <button
                        type="button"
                        onClick={() => setShowAddSourceForm((v) => !v)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        {showAddSourceForm ? <X size={13} /> : <Plus size={13} />}
                        <span>{showAddSourceForm ? 'Cancel' : 'Add Source'}</span>
                    </button>
                </div>

                {showAddSourceForm && (
                    <form onSubmit={handleAddSourceSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <input
                            type="text"
                            placeholder="Source Name (e.g., OCSC)"
                            value={newSource.name}
                            onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                            className={inputClass}
                        />
                        <input
                            type="url"
                            placeholder="Source URL (https://...)"
                            value={newSource.url}
                            onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                            className={inputClass}
                        />
                        <button
                            type="submit"
                            disabled={createSourceMutation.isPending}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <Plus size={14} />
                            <span>{createSourceMutation.isPending ? 'Saving...' : 'Save Source'}</span>
                        </button>
                    </form>
                )}

                <div className="flex flex-wrap gap-2">
                    {isLoadingSources ? (
                        <span className="text-xs font-medium text-slate-500">Loading sources...</span>
                    ) : sources.length === 0 ? (
                        <span className="text-xs font-medium text-slate-500">No sources saved. Add one to check quickly!</span>
                    ) : (
                        sources.map((source) => (
                            <div key={source.id} className="group relative inline-flex items-center">
                                <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all pr-7"
                                >
                                    <span>{source.name}</span>
                                    <Globe size={11} className="text-slate-500" />
                                </a>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (window.confirm('Delete source?')) deleteSourceMutation.mutate(source.id);
                                    }}
                                    aria-label={`ลบแหล่งข่าว ${source.name}`}
                                    title="Remove source"
                                    className="absolute right-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-full w-4 h-4 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create / Edit Form */}
            {isFormOpen && (
                <div className="rounded-2xl bg-white/95 backdrop-blur-sm p-6 border border-slate-200/80 shadow-md">
                    <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/70">
                                <Sparkles size={18} />
                            </span>
                            <h3 className="text-lg font-bold text-slate-900">
                                {editingId ? 'แก้ไขข่าว (Edit News)' : 'สร้างข่าวใหม่ (Create New Post)'}
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setIsFormOpen(false);
                                setEditingId(null);
                                setFormData(initialFormState);
                            }}
                            aria-label="ปิดฟอร์ม"
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Scraper Tool */}
                    <div className="mb-6 p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">
                            Auto-fill from URL
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2.5">
                            <input
                                type="url"
                                placeholder="Paste article URL here..."
                                className={`flex-1 ${inputClass} bg-white`}
                                value={formData.scrape_url}
                                onChange={(e) => setFormData({ ...formData, scrape_url: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={handleScrape}
                                disabled={scrapeMutation.isPending}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <Globe size={16} />
                                <span>{scrapeMutation.isPending ? 'Fetching...' : 'Fetch Data'}</span>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {activeTab === 'general' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Headline Link / Product Link (Affiliate)
                                    </label>
                                    <div className="relative">
                                        <LinkIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                        <input
                                            type="url"
                                            className={`${inputClass} pl-10`}
                                            placeholder="https://shopee.co.th/..."
                                            value={formData.product_link}
                                            onChange={(e) => setFormData({ ...formData, product_link: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        External Link (Public Source)
                                    </label>
                                    <div className="relative">
                                        <LinkIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                        <input
                                            type="url"
                                            className={`${inputClass} pl-10`}
                                            placeholder="https://original-source.com/..."
                                            value={formData.external_link}
                                            onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
                                    <input
                                        required
                                        type="text"
                                        className={inputClass}
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Content / Description</label>
                                        <textarea
                                            required
                                            className={`${inputClass} h-32 resize-none`}
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cover Image URL</label>
                                        <div className="relative mb-2">
                                            <ImageIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                            <input
                                                type="url"
                                                className={`${inputClass} pl-10`}
                                                placeholder="https://..."
                                                value={formData.image_url}
                                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            />
                                        </div>
                                        {formData.image_url && (
                                            <div className="h-24 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80">
                                    <div className="md:col-span-2">
                                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                                            <Building2 size={14} className="text-indigo-600" />
                                            <span>Organization Details</span>
                                        </h4>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                            ชื่อองค์กรรัฐ (Organization)
                                        </label>
                                        <input
                                            type="text"
                                            className={`${inputClass} bg-white`}
                                            placeholder="เช่น สำนักข่าวกรองแห่งชาติ"
                                            value={formData.metadata.organization}
                                            onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, organization: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                            หน่วยงานต้นสังกัด (Supervising Agency)
                                        </label>
                                        <input
                                            type="text"
                                            className={`${inputClass} bg-white`}
                                            placeholder="เช่น สำนักนายกรัฐมนตรี"
                                            value={formData.agency}
                                            onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                            โลโก้หน่วยงาน (Agency Logo URL)
                                        </label>
                                        <div className="relative">
                                            <ImageIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                            <input
                                                type="url"
                                                className={`${inputClass} bg-white pl-10`}
                                                placeholder="https://job.ocsc.go.th/content/accreditation/departments/006.png"
                                                value={formData.metadata.agency_logo || ''}
                                                onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, agency_logo: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">ประเภทการรับสมัคร (Type)</label>
                                        <input
                                            type="text"
                                            className={inputClass}
                                            placeholder="เช่น ข้าราชการพลเรือน"
                                            value={formData.metadata.recruitment_type}
                                            onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, recruitment_type: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">โดยวิธี (Method)</label>
                                        <input
                                            type="text"
                                            className={inputClass}
                                            placeholder="เช่น สอบแข่งขัน"
                                            value={formData.metadata.method}
                                            onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, method: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">จังหวัดที่บรรจุ (Location)</label>
                                        <input
                                            type="text"
                                            className={inputClass}
                                            placeholder="เช่น กรุงเทพมหานคร"
                                            value={formData.metadata.location}
                                            onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, location: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">เงินเดือน (Salary)</label>
                                        <input
                                            type="text"
                                            className={inputClass}
                                            placeholder="เช่น 18,150 - 19,970 บาท"
                                            value={formData.metadata.salary}
                                            onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, salary: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">ประเภท (Position Type)</label>
                                        <input
                                            type="text"
                                            className={inputClass}
                                            placeholder="เช่น ปฏิบัติการ"
                                            value={formData.metadata.position_type}
                                            onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, position_type: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">จำนวน (Amount)</label>
                                        <input
                                            type="text"
                                            className={inputClass}
                                            placeholder="เช่น 1 อัตรา"
                                            value={formData.metadata.vacancy_count}
                                            onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, vacancy_count: e.target.value } })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">ระดับการศึกษา (Education)</label>
                                        <input
                                            type="text"
                                            className={inputClass}
                                            placeholder="เช่น ป.ตรี"
                                            value={formData.metadata.education_level}
                                            onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, education_level: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">รายละเอียดงาน/ประกาศ (Announcement URL)</label>
                                        <input
                                            type="url"
                                            className={inputClass}
                                            placeholder="ลิงก์ดาวน์โหลดประกาศ..."
                                            value={formData.metadata.announcement_url}
                                            onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, announcement_url: e.target.value } })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">เปิดรับสมัคร (Start Date)</label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                placeholder="11 มี.ค. 2569"
                                                value={formData.metadata.application_start}
                                                onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, application_start: e.target.value } })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">ปิดรับสมัคร (End Date)</label>
                                            <input
                                                type="text"
                                                className={inputClass}
                                                placeholder="31 มี.ค. 2569"
                                                value={formData.metadata.application_end}
                                                onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, application_end: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">
                                        General Information (Auto-mapped)
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อข่าว (Title)</label>
                                            <input
                                                required
                                                type="text"
                                                className={inputClass}
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">รายละเอียดเพิ่มเติม (Content)</label>
                                            <textarea
                                                className={`${inputClass} h-24`}
                                                value={formData.content}
                                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shared Footer Fields (SEO & URL) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Source Memo (Internal)</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Note..."
                                    value={formData.source_memo}
                                    onChange={(e) => setFormData({ ...formData, source_memo: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Keywords</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="tags..."
                                    value={formData.keywords}
                                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                {mutation.isPending ? 'Saving...' : editingId ? 'Update News' : 'Publish News'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* News List - Table View */}
            <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-slate-700 divide-y divide-slate-200/80">
                        <thead className="bg-slate-50/90 text-xs uppercase font-bold text-slate-600">
                            <tr>
                                <th className="px-4 py-3.5 w-16 text-center">ID</th>
                                <th className="px-4 py-3.5 w-24">Image</th>
                                <th className="px-4 py-3.5">News Detail</th>
                                <th className="px-4 py-3.5 w-36">Source (Memo)</th>
                                <th className="px-4 py-3.5 w-24 text-center">Featured</th>
                                <th className="px-4 py-3.5 w-24 text-center">Affiliate</th>
                                <th className="px-4 py-3.5 w-24 text-center">Views</th>
                                <th className="px-4 py-3.5 w-28 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500 font-medium">
                                        Loading news...
                                    </td>
                                </tr>
                            ) : filteredNews.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-14 text-center">
                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                            <Newspaper size={22} />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700">ยังไม่มีรายการข่าวในหมวดนี้</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredNews.map((item) => (
                                    <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-4 py-3.5 text-center text-xs font-mono font-semibold text-slate-600">
                                            #{item.id}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="w-16 h-12 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                                ) : item.category === 'งานราชการ' ? (
                                                    <div className="flex items-center justify-center h-full text-xs text-indigo-700 bg-indigo-50 font-bold">
                                                        GOV
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-xs text-slate-500 font-medium">
                                                        No Img
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-bold text-slate-900 line-clamp-1 mb-0.5">{item.title}</div>
                                            <div className="text-xs text-slate-500 line-clamp-1">
                                                {item.category === 'งานราชการ' ? `${item.agency || 'ไม่ระบุหน่วยงาน'}` : item.content}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex flex-col gap-1">
                                                {item.source_memo && (
                                                    <a
                                                        href={item.source_memo.startsWith('http') ? item.source_memo : '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium border border-slate-200 max-w-[150px] truncate"
                                                        title={`Memo: ${item.source_memo}`}
                                                    >
                                                        <Globe size={12} className="mr-1.5 flex-shrink-0" />
                                                        <span className="truncate">Memo</span>
                                                    </a>
                                                )}
                                                {item.external_link && (
                                                    <a
                                                        href={item.external_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-medium border border-indigo-200/70 max-w-[150px] truncate"
                                                        title={`Public Source: ${item.external_link}`}
                                                    >
                                                        <LinkIcon size={12} className="mr-1.5 flex-shrink-0" />
                                                        <span className="truncate">Public Source</span>
                                                    </a>
                                                )}
                                                {!item.source_memo && !item.external_link && (
                                                    <span className="text-slate-500 text-xs">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <button
                                                type="button"
                                                onClick={() => toggleFeatureMutation.mutate(item.id)}
                                                aria-label={item.is_featured ? `ถอด ${item.title} จากหน้าแรก` : `ปักหมุด ${item.title} ในหน้าแรก`}
                                                title={item.is_featured ? 'Remove from Landing Page' : 'Add to Landing Page'}
                                                className={`p-1.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                                                    item.is_featured
                                                        ? 'text-amber-500 bg-amber-50 border border-amber-200/70'
                                                        : 'text-slate-500 hover:text-amber-500 hover:bg-amber-50/50'
                                                }`}
                                            >
                                                <Star size={17} fill={item.is_featured ? 'currentColor' : 'none'} />
                                            </button>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            {item.product_link ? (
                                                <a
                                                    href={item.product_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label="เปิดลิงก์ Affiliate"
                                                    title="Affiliate Link"
                                                    className="inline-flex p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                >
                                                    <LinkIcon size={16} />
                                                </a>
                                            ) : (
                                                <span className="text-slate-500 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-slate-600 font-semibold text-xs">
                                            {item.views || 0}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(item)}
                                                    aria-label={`แก้ไข ${item.title}`}
                                                    title="Edit"
                                                    className="p-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                >
                                                    <Edit size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item.id)}
                                                    aria-label={`ลบ ${item.title}`}
                                                    title="Delete"
                                                    className="p-2 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                                >
                                                    <Trash2 size={15} />
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
