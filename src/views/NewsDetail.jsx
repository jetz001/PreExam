import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import newsService from '../services/newsService';
import { ArrowLeft, Calendar, Eye, FileText, ShoppingBag, ExternalLink, MessageCircle, Briefcase } from 'lucide-react';
import ShareNewsModal from '../components/Community/ShareNewsModal';
import AdSlot from '../components/ads/AdSlot';

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
                    
                    // Fetch OCSC details if applicable
                    if (response.data.external_link && response.data.external_link.includes('job.ocsc.go.th/portal/jobs/')) {
                        const ocscId = response.data.external_link.split('/').pop();
                        if (ocscId) {
                            newsService.getOcscJob(ocscId).then(ocscRes => {
                                if (ocscRes.success) {
                                    setOcscDetails(ocscRes.data);
                                }
                            }).catch(console.error);
                        }
                    }
                } else {
                    setError('News not found');
                }
            } catch (err) {
                setError('Failed to load news');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [id]);

    const [shapes, setShapes] = useState([]);
    useEffect(() => {
        const shapeTypes = ['k-circle', 'k-square', 'k-triangle'];
        const newShapes = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
            left: `${Math.random() * 100}vw`,
            size: `${30 + Math.random() * 50}px`,
            delay: `${Math.random() * 10}s`,
            duration: `${15 + Math.random() * 15}s`,
        }));
        setShapes(newShapes);
    }, []);

    const handleShareSuccess = () => {
        setIsShareModalOpen(false);
        navigate('/community');
    };

    if (loading) return (
        <div className="flex justify-center items-center py-20 news-page min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
    );

    if (error || !news) return (
        <div className="news-page min-h-screen px-4 py-8 text-center flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-[#ffcc00] drop-shadow-md">Error</h2>
            <p className="text-white/80 mt-2">{error || 'News item not found'}</p>
            <Link to="/news" className="text-white bg-white/20 px-4 py-2 rounded-full hover:bg-white/30 transition-colors mt-4 inline-block font-bold">Back to News</Link>
        </div>
    );

    return (
        <div className="news-page min-h-screen pb-12 relative overflow-hidden">
            {/* Kahoot-style Background Shapes */}
            {shapes.map(s => (
                <div 
                    key={s.id} 
                    className={`k-shape ${s.type}`} 
                    style={{ 
                        left: s.left, 
                        width: s.type !== 'k-triangle' ? s.size : undefined, 
                        height: s.type !== 'k-triangle' ? s.size : undefined,
                        '--s': s.type === 'k-triangle' ? s.size : undefined,
                        animationDelay: s.delay,
                        animationDuration: s.duration
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
                <meta property="og:url" content={window.location.href} />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-4 mb-4">
                <Link to="/news" className="text-white/80 hover:text-white flex items-center text-sm font-bold bg-white/10 w-max px-4 py-2 rounded-full backdrop-blur-md border border-white/20 transition-all hover:bg-white/20">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to News
                </Link>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-4">
                <article className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/40 ring-1 ring-black/5 relative">
                    {/* Decorative Top Gradient Line */}
                    <div className="h-2 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 absolute top-0 left-0"></div>
                    
                    {news.image_url && (
                        <div className="h-64 sm:h-96 w-full bg-gray-100 relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                            <img
                                src={news.image_url}
                                alt={news.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-6 left-6 z-20">
                                <span className="px-4 py-1.5 bg-white text-[#1a0533] rounded-full text-xs font-black tracking-widest uppercase shadow-lg">
                                    {news.category || 'General'}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="p-8 sm:p-12">
                        {!news.image_url && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="px-4 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-xs font-black tracking-widest uppercase shadow-md">
                                    {news.category || 'General'}
                                </span>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                            <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-900 to-purple-800 leading-tight">
                                {news.title}
                            </h1>
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="flex-shrink-0 inline-flex items-center justify-center px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all font-bold text-sm shadow-sm group"
                            >
                                <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                พูดคุย
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium mb-10 pb-8 border-b-2 border-gray-100 border-dashed">
                            <div className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-xl">
                                <Calendar className="w-4 h-4 mr-2" />
                                {news.published_at && !isNaN(new Date(news.published_at)) ? new Date(news.published_at).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                }) : 'ไม่ระบุวันที่'}
                            </div>
                            <div className="flex items-center px-4 py-2 bg-pink-50 text-pink-700 rounded-xl">
                                <Eye className="w-4 h-4 mr-2" />
                                {news.views || 0} Views
                            </div>
                        </div>

                        {/* Summary / Lead */}
                        {news.summary && (
                            <div className="text-xl text-gray-700 font-medium leading-relaxed mb-10 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border-l-4 border-yellow-400 shadow-inner">
                                {news.summary}
                            </div>
                        )}

                        {/* Full Content */}
                        <div className="prose prose-lg prose-indigo max-w-none text-gray-800 mb-12 whitespace-pre-wrap leading-loose">
                            {news.content}
                        </div>

                        {/* OCSC Details Expansion */}
                        {ocscDetails && (
                            <div className="relative bg-gradient-to-br from-indigo-900 to-[#1a0533] rounded-[2rem] p-8 sm:p-10 mb-12 text-white shadow-2xl overflow-hidden">
                                {/* Decorative elements inside the card */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
                                
                                <div className="relative z-10">
                                    <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm border border-white/20">
                                        <Briefcase className="w-6 h-6 text-[#ffcc00] mr-3" />
                                        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffcc00] to-yellow-200">
                                            รายละเอียดเพิ่มเติมจาก ก.พ.
                                        </h3>
                                    </div>
                                    
                                    {ocscDetails.civilJobEducation && (
                                        <div className="mb-8 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                            <h4 className="font-bold text-pink-300 mb-3 text-lg flex items-center">
                                                <span className="w-2 h-2 rounded-full bg-pink-400 mr-2"></span>
                                                วุฒิการศึกษา / คุณสมบัติเฉพาะ
                                            </h4>
                                            <div className="text-white/90 whitespace-pre-wrap text-base leading-relaxed pl-4 border-l-2 border-white/20">
                                                {ocscDetails.civilJobEducation || ocscDetails.employeeJobSpecification || 'ไม่ระบุ'}
                                            </div>
                                        </div>
                                    )}

                                    {(ocscDetails.civilJobDescription || ocscDetails.employeeJobDescription) && (
                                        <div className="mb-8 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                            <h4 className="font-bold text-blue-300 mb-3 text-lg flex items-center">
                                                <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
                                                ลักษณะงานที่ปฏิบัติ
                                            </h4>
                                            <div className="text-white/90 whitespace-pre-wrap text-base leading-relaxed pl-4 border-l-2 border-white/20">
                                                {ocscDetails.civilJobDescription || ocscDetails.employeeJobDescription || 'ไม่ระบุ'}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10">
                                        {ocscDetails.salaryMin && (
                                            <div className="flex items-center p-4 bg-black/20 rounded-xl">
                                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
                                                    <span className="text-green-400 font-black">฿</span>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-white/50 font-bold uppercase tracking-wider mb-1">เงินเดือน</div>
                                                    <div className="font-black text-lg text-green-300">
                                                        {ocscDetails.salaryMin.toLocaleString()} - {ocscDetails.salaryMax ? ocscDetails.salaryMax.toLocaleString() : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {ocscDetails.applicationStartPrint && (
                                            <div className="flex items-center p-4 bg-black/20 rounded-xl">
                                                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mr-4">
                                                    <Calendar className="w-5 h-5 text-orange-400" />
                                                </div>
                                                <div>
                                                    <div className="text-xs text-white/50 font-bold uppercase tracking-wider mb-1">ช่วงรับสมัคร</div>
                                                    <div className="font-black text-sm text-orange-300">
                                                        {ocscDetails.applicationStartPrint} - {ocscDetails.applicationEndPrint}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* External Links / PDF / Product */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            {news.pdf_url && (
                                <a href={news.pdf_url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center p-5 bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all group border border-red-200">
                                    <div className="bg-red-500 p-3 rounded-xl mr-4 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform text-white">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">ดาวน์โหลดประกาศ</div>
                                        <span className="font-black text-red-900 group-hover:text-red-700">Official PDF</span>
                                    </div>
                                </a>
                            )}

                            {news.external_link && (
                                <a href={news.external_link} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center p-5 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all group border border-blue-200">
                                    <div className="bg-blue-600 p-3 rounded-xl mr-4 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform text-white">
                                        <ExternalLink className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">อ่านต้นฉบับ</div>
                                        <span className="font-black text-blue-900 group-hover:text-blue-700">Original Source</span>
                                    </div>
                                </a>
                            )}
                        </div>

                        {/* Product Placement (KPI) */}
                        {news.product_link && (
                            <a href={news.product_link} target="_blank" rel="noopener noreferrer"
                                className="mt-4 flex items-center justify-between p-6 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 rounded-[2rem] hover:shadow-xl hover:scale-[1.02] transition-all group border-4 border-white shadow-lg overflow-hidden relative">
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
                                <div className="flex items-center relative z-10">
                                    <div className="bg-white p-4 rounded-2xl mr-5 shadow-inner text-orange-500 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                                        <ShoppingBag className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-white/80 uppercase tracking-widest mb-1 drop-shadow-sm">Recommended Resource</div>
                                        <div className="font-black text-xl text-white drop-shadow-md">
                                            หนังสือเตรียมสอบตำแหน่งนี้!
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full relative z-10 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                                    <ExternalLink className="w-6 h-6 text-white" />
                                </div>
                            </a>
                        )}

                        {/* Ad Injection for News Placement */}
                        <div className="mt-8">
                            <AdSlot placement="news" />
                        </div>
                    </div>
                </article>
            </div>

            {isShareModalOpen && (
                <ShareNewsModal
                    news={news}
                    onClose={(success) => success ? handleShareSuccess() : setIsShareModalOpen(false)}
                />
            )}
        </div>
    );
};

export default NewsDetail;
