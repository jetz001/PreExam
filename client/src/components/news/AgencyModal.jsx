import React, { useState, useEffect } from 'react';
import { X, Calendar, Search, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import newsService from '../../services/newsService';
import { useNavigate } from 'react-router-dom';

const AgencyModal = ({ agencyName, onClose }) => {
    const navigate = useNavigate();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAgencyNews = async () => {
            setLoading(true);
            try {
                const response = await newsService.getNews(null, null, agencyName);
                if (response.success) {
                    setNews(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch agency news", error);
            } finally {
                setLoading(false);
            }
        };

        if (agencyName) fetchAgencyNews();
    }, [agencyName]);

    if (!agencyName) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 to-indigo-900 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-extrabold mb-1">{agencyName}</h2>
                        <p className="text-white/70 text-sm font-medium">รายชื่อประกาศรับสมัครงานและข่าวสารล่าสุด</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-500 font-medium">กำลังโหลดข้อมูลกองงาน...</p>
                        </div>
                    ) : news.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">ไม่พบประกาศพ้นกำหนดหรือกำลังจะมาถึง</h3>
                            <p className="text-slate-500">ขออภัย ยังไม่มีข่าวคราวการรับสมัครใหม่ของหน่วยงานนี้ในเวลานี้</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {news.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(`/news/${item.id}`)}
                                    className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col gap-4 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700" />

                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {item.metadata?.position_type || 'งานราชการ'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 capitalize">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(item.published_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <h4 className="text-lg font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                                            {item.title.split(' - ')[0]}
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                                <span>{item.metadata?.location || 'ไม่ระบุสถานที่'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                                                <span className="text-indigo-600/80">{item.metadata?.salary || 'เงินเดือนตามโครงสร้าง'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between relative z-10">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">จำนวนรับสมัคร</span>
                                            <span className="text-sm font-black text-indigo-600">{item.metadata?.vacancy_count || '1'} อัตรา</span>
                                        </div>
                                        <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all text-slate-400">
                                            <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgencyModal;
