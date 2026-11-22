import React, { useState, useEffect } from 'react';
import { X, Calendar, Search, MapPin, ExternalLink, ArrowRight, Building2 } from 'lucide-react';
import newsService from '../../services/newsService';
import { useNavigate } from 'react-router-dom';

const AgencyModal = ({ agencyName, onClose }) => {
    const navigate = useNavigate();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        const fetchAgencyNews = async () => {
            setLoading(true);
            try {
                const response = await newsService.getNews(null, null, agencyName);
                if (response.success) {
                    setNews(response.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch agency news', error);
            } finally {
                setLoading(false);
            }
        };

        if (agencyName) fetchAgencyNews();
    }, [agencyName]);

    if (!agencyName) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="agency-modal-title"
        >
            <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-white/95 backdrop-blur-xl w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-white/40 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-5 sm:p-7 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex justify-between items-center gap-4 shrink-0">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-[#fde047] flex items-center justify-center shrink-0">
                            <Building2 size={24} />
                        </div>
                        <div className="min-w-0">
                            <h2 id="agency-modal-title" className="text-xl sm:text-2xl font-black mb-0.5 truncate">
                                {agencyName}
                            </h2>
                            <p className="text-white/75 text-xs sm:text-sm font-medium">
                                รายชื่อประกาศรับสมัครงานและข่าวสารล่าสุด
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="ปิดหน้าต่าง"
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-7 bg-slate-50 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-11 h-11 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-600 font-semibold text-sm">กำลังโหลดข้อมูลประกาศ...</p>
                        </div>
                    ) : news.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <div className="w-16 h-16 bg-slate-200/70 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1.5">ไม่พบประกาศรับสมัคร</h3>
                            <p className="text-slate-600 text-sm">
                                ยังไม่มีประกาศรับสมัครงานใหม่ของหน่วยงานนี้ในขณะนี้
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {news.map((item) => (
                                <button
                                    type="button"
                                    key={item.id}
                                    onClick={() => navigate(`/news/${item.id}`)}
                                    className="bg-white text-left p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200/80 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col gap-3.5 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700" />

                                    <div className="flex justify-between items-start relative z-10 w-full gap-2">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
                                            {item.metadata?.position_type || 'งานราชการ'}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 shrink-0">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(item.published_date || item.created_at).toLocaleDateString('th-TH', {
                                                day: 'numeric',
                                                month: 'short',
                                            })}
                                        </span>
                                    </div>

                                    <div className="relative z-10">
                                        <h4 className="text-base sm:text-lg font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                                            {item.title.split(' - ')[0]}
                                        </h4>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                                <span className="truncate">{item.metadata?.location || 'ไม่ระบุสถานที่'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                <ExternalLink className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                                <span className="text-indigo-700 truncate">
                                                    {item.metadata?.salary || 'เงินเดือนตามโครงสร้าง'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-3.5 border-t border-slate-100 flex items-center justify-between relative z-10 w-full">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">
                                                จำนวนรับสมัคร
                                            </span>
                                            <span className="text-sm font-black text-indigo-700">
                                                {item.metadata?.vacancy_count || '1'} อัตรา
                                            </span>
                                        </div>
                                        <span className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all text-slate-600">
                                            <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgencyModal;
