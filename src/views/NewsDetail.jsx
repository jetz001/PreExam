import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import newsService from '../services/newsService';
import {
    ArrowLeft,
    Calendar,
    Eye,
    FileText,
    ShoppingBag,
    ExternalLink,
    MessageCircle,
    Briefcase,
    Banknote,
    Newspaper,
} from 'lucide-react';
import ShareNewsModal from '../components/Community/ShareNewsModal';
import AdSlot from '../components/ads/AdSlot';
import '../assets/css/news.css';

const NewsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [news, setNews] = useState(null);
    const [ocscDetails, setOcscDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await newsService.getNewsById(id);
                if (response.success) {
                    setNews(response.data);

                    if (response.data.external_link && response.data.external_link.includes('job.ocsc.go.th/portal/jobs/')) {
                        const ocscId = response.data.external_link.split('/').pop();
                        if (ocscId) {
                            newsService
                                .getOcscJob(ocscId)
                                .then((ocscRes) => {
                                    if (ocscRes.success) {
                                        setOcscDetails(ocscRes.data);
                                    }
                                })
                                .catch(console.error);
                        }
                    }
                } else {
                    setError('ไม่พบข่าวสารที่ต้องการ');
                }
            } catch (err) {
                setError('ไม่สามารถโหลดข่าวสารได้');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [id]);

    const [shapes, setShapes] = useState([]);
    useEffect(() => {
        const shapeTypes = ['k-circle', 'k-square', 'k-triangle'];
        const newShapes = Array.from({ length: 12 }, (_, i) => ({
            id: i,
            type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
            left: `${Math.random() * 100}vw`,
            size: `${28 + Math.random() * 44}px`,
            delay: `${Math.random() * 10}s`,
            duration: `${16 + Math.random() * 14}s`,
        }));
        setShapes(newShapes);
    }, []);

    const handleShareSuccess = () => {
        setIsShareModalOpen(false);
        navigate('/community');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 news-page min-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-[#fde047]" />
            </div>
        );
    }

    if (error || !news) {
        return (
            <div className="news-page min-h-screen px-4 py-12 text-center flex flex-col items-center justify-center">
                <div className="max-w-md w-full rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 shadow-2xl">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-300/40 text-[#fde047] flex items-center justify-center mx-auto mb-4">
                        <Newspaper size={28} />
                    </div>
                    <h2 className="text-2xl font-black text-white">ไม่พบข้อมูลข่าว</h2>
                    <p className="text-white/80 mt-2 text-sm">{error || 'ข่าวสารนี้อาจถูกลบหรือไม่มีอยู่ในระบบ'}</p>
                    <Link
                        to="/news"
                        className="mt-6 inline-flex items-center gap-2 bg-[#ffcc00] text-[#1a0533] px-5 py-2.5 rounded-xl font-black text-sm hover:brightness-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>กลับหน้าข่าวทั้งหมด</span>
                    </Link>
                </div>
            </div>
        );
    }

    const currentHref = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <div className="news-page min-h-screen pb-14 relative">
            {/* Kahoot-style Background Shapes */}
            {shapes.map((s) => (
                <div
                    key={s.id}
                    className={`k-shape ${s.type}`}
                    style={{
                        left: s.left,
                        width: s.type !== 'k-triangle' ? s.size : undefined,
                        height: s.type !== 'k-triangle' ? s.size : undefined,
                        '--s': s.type === 'k-triangle' ? s.size : undefined,
                        animationDelay: s.delay,
                        animationDuration: s.duration,
                    }}
                />
            ))}

            <Helmet>
                <title>{news.title} | PreExam Thailand</title>
                <meta name="description" content={news.summary || news.title} />
                <meta property="og:title" content={news.title} />
                <meta property="og:description" content={news.summary || news.title} />
                <meta property="og:image" content={news.image_url} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={currentHref} />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-6 pt-4 pb-2">
                <Link
                    to="/news"
                    className="inline-flex items-center gap-2 text-white hover:text-[#fde047] text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>กลับหน้ารวมข่าว</span>
                </Link>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-6 py-4">
                <article className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/40 ring-1 ring-black/5 relative">
                    <div className="h-2 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400" />

                    {news.image_url && (
                        <div className="h-56 sm:h-96 w-full bg-slate-100 relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 to-transparent z-10" />
                            <img
                                src={news.image_url}
                                alt={news.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-5 left-5 z-20">
                                <span className="px-4 py-1.5 bg-white text-[#1a0533] rounded-full text-xs font-black tracking-wider uppercase shadow-lg">
                                    {news.category || 'ทั่วไป'}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="p-5 sm:p-10 lg:p-12">
                        {!news.image_url && (
                            <div className="flex flex-wrap gap-2 mb-5">
                                <span className="px-4 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-xs font-black tracking-wider uppercase shadow-md">
                                    {news.category || 'ทั่วไป'}
                                </span>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight break-words min-w-0">
                                {news.title}
                            </h1>
                            <button
                                type="button"
                                onClick={() => setIsShareModalOpen(true)}
                                className="flex-shrink-0 inline-flex items-center justify-center px-5 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-2xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all font-bold text-sm shadow-sm group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <MessageCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                <span>พูดคุยในชุมชน</span>
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold mb-8 pb-6 border-b border-slate-200 border-dashed">
                            <div className="flex items-center px-3.5 py-2 bg-blue-50 text-blue-800 rounded-xl border border-blue-100">
                                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                {(news.published_date || news.created_at) &&
                                !isNaN(new Date(news.published_date || news.created_at).getTime())
                                    ? new Date(news.published_date || news.created_at).toLocaleDateString('th-TH', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                      })
                                    : 'ไม่ระบุวันที่'}
                            </div>
                            <div className="flex items-center px-3.5 py-2 bg-pink-50 text-pink-800 rounded-xl border border-pink-100">
                                <Eye className="w-4 h-4 mr-2 text-pink-600" />
                                <span>{news.views || 0} ครั้งอ่าน</span>
                            </div>
                        </div>

                        {news.summary && (
                            <div className="text-base sm:text-lg text-slate-800 font-semibold leading-relaxed mb-8 p-5 sm:p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-l-4 border-amber-400">
                                {news.summary}
                            </div>
                        )}

                        <div className="prose prose-base sm:prose-lg prose-indigo max-w-none text-slate-800 mb-10 whitespace-pre-wrap leading-loose break-words">
                            {news.content}
                        </div>

                        {/* OCSC Details Expansion */}
                        {ocscDetails && (
                            <div className="relative bg-gradient-to-br from-indigo-950 via-purple-950 to-[#1a0533] rounded-3xl p-6 sm:p-9 mb-10 text-white shadow-2xl overflow-hidden border border-white/15">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-white/10 rounded-2xl mb-6 backdrop-blur-md border border-white/20">
                                        <Briefcase className="w-5 h-5 text-[#fde047]" />
                                        <h3 className="text-lg sm:text-xl font-black text-[#fde047]">
                                            รายละเอียดเพิ่มเติมจาก ก.พ.
                                        </h3>
                                    </div>

                                    {ocscDetails.civilJobEducation && (
                                        <div className="mb-6 bg-white/10 p-5 rounded-2xl border border-white/15 backdrop-blur-sm">
                                            <h4 className="font-bold text-pink-200 mb-2.5 text-base sm:text-lg flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-pink-400" />
                                                <span>วุฒิการศึกษา / คุณสมบัติเฉพาะ</span>
                                            </h4>
                                            <div className="text-white/90 whitespace-pre-wrap text-sm sm:text-base leading-relaxed pl-3.5 border-l-2 border-white/25 break-words">
                                                {ocscDetails.civilJobEducation || ocscDetails.employeeJobSpecification || 'ไม่ระบุ'}
                                            </div>
                                        </div>
                                    )}

                                    {(ocscDetails.civilJobDescription || ocscDetails.employeeJobDescription) && (
                                        <div className="mb-6 bg-white/10 p-5 rounded-2xl border border-white/15 backdrop-blur-sm">
                                            <h4 className="font-bold text-sky-200 mb-2.5 text-base sm:text-lg flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-sky-400" />
                                                <span>ลักษณะงานที่ปฏิบัติ</span>
                                            </h4>
                                            <div className="text-white/90 whitespace-pre-wrap text-sm sm:text-base leading-relaxed pl-3.5 border-l-2 border-white/25 break-words">
                                                {ocscDetails.civilJobDescription || ocscDetails.employeeJobDescription || 'ไม่ระบุ'}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/15">
                                        {ocscDetails.salaryMin && (
                                            <div className="flex items-center p-4 bg-black/25 rounded-2xl border border-white/10">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/35 flex items-center justify-center mr-3.5 flex-shrink-0 text-emerald-300">
                                                    <Banknote className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs text-white/75 font-bold uppercase tracking-wider mb-0.5">
                                                        เงินเดือน
                                                    </div>
                                                    <div className="font-black text-base sm:text-lg text-emerald-300">
                                                        {ocscDetails.salaryMin.toLocaleString()}{' '}
                                                        {ocscDetails.salaryMax ? `- ${ocscDetails.salaryMax.toLocaleString()}` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {ocscDetails.applicationStartPrint && (
                                            <div className="flex items-center p-4 bg-black/25 rounded-2xl border border-white/10">
                                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/35 flex items-center justify-center mr-3.5 flex-shrink-0 text-amber-300">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs text-white/75 font-bold uppercase tracking-wider mb-0.5">
                                                        ช่วงรับสมัคร
                                                    </div>
                                                    <div className="font-bold text-sm text-amber-200">
                                                        {ocscDetails.applicationStartPrint} - {ocscDetails.applicationEndPrint}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* External Links / PDF */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            {news.pdf_url && (
                                <a
                                    href={news.pdf_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center p-5 bg-gradient-to-br from-rose-50 to-red-100/80 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all group border border-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                >
                                    <div className="bg-rose-600 p-3 rounded-xl mr-4 shadow-sm group-hover:scale-105 transition-transform text-white">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-0.5">
                                            ดาวน์โหลดประกาศ
                                        </div>
                                        <span className="font-black text-rose-950">Official PDF</span>
                                    </div>
                                </a>
                            )}

                            {news.external_link && (
                                <a
                                    href={news.external_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center p-5 bg-gradient-to-br from-blue-50 to-indigo-100/80 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all group border border-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    <div className="bg-indigo-600 p-3 rounded-xl mr-4 shadow-sm group-hover:scale-105 transition-transform text-white">
                                        <ExternalLink className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-0.5">
                                            อ่านต้นฉบับ
                                        </div>
                                        <span className="font-black text-indigo-950">Original Source</span>
                                    </div>
                                </a>
                            )}
                        </div>

                        {/* Product Placement */}
                        {news.product_link && (
                            <a
                                href={news.product_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 flex items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-600 rounded-3xl hover:shadow-xl hover:scale-[1.01] transition-all group shadow-lg overflow-hidden relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <div className="flex items-center gap-4 relative z-10 min-w-0">
                                    <div className="bg-white p-3.5 rounded-2xl shadow text-orange-600 group-hover:scale-105 transition-transform flex-shrink-0">
                                        <ShoppingBag className="w-7 h-7" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-black text-white/90 uppercase tracking-wider mb-0.5">
                                            Recommended Resource
                                        </div>
                                        <div className="font-black text-lg sm:text-xl text-white">
                                            หนังสือเตรียมสอบตำแหน่งนี้!
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full relative z-10 backdrop-blur-sm group-hover:bg-white/30 transition-colors flex-shrink-0">
                                    <ExternalLink className="w-5 h-5 text-white" />
                                </div>
                            </a>
                        )}

                        <div className="mt-8">
                            <AdSlot placement="news" />
                        </div>
                    </div>
                </article>
            </div>

            {isShareModalOpen && (
                <ShareNewsModal
                    news={news}
                    onClose={(success) => (success ? handleShareSuccess() : setIsShareModalOpen(false))}
                />
            )}
        </div>
    );
};

export default NewsDetail;
