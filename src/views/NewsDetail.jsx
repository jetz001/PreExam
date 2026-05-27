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
                <article className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-white/50">
                    {news.image_url && (
                        <div className="h-64 sm:h-80 w-full bg-gray-200">
                            <img
                                src={news.image_url}
                                alt={news.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-6 sm:p-10">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold tracking-wide uppercase">
                                {news.category || 'General'}
                            </span>
                        </div>

                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                                {news.title}
                            </h1>
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="flex-shrink-0 ml-4 flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm border border-indigo-100"
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                พูดคุย
                            </button>
                        </div>

                        <div className="flex items-center text-gray-500 text-sm mb-8 space-x-6 border-b border-gray-100 pb-6">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                {new Date(news.published_at).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </div>
                            <div className="flex items-center">
                                <Eye className="w-4 h-4 mr-2" />
                                {news.views} Views
                            </div>
                        </div>

                        {/* Summary / Lead */}
                        {news.summary && (
                            <div className="text-lg text-gray-600 leading-relaxed mb-8 italic border-l-4 border-primary pl-4">
                                {news.summary}
                            </div>
                        )}

                        {/* Full Content */}
                        <div className="prose prose-lg max-w-none text-gray-800 mb-10 whitespace-pre-wrap">
                            {news.content}
                        </div>

                        {/* OCSC Details Expansion */}
                        {ocscDetails && (
                            <div className="bg-indigo-50/50 rounded-xl p-6 mb-10 border border-indigo-100">
                                <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
                                    <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                                    รายละเอียดเพิ่มเติมจาก ก.พ.
                                </h3>
                                
                                {ocscDetails.civilJobEducation && (
                                    <div className="mb-6">
                                        <h4 className="font-bold text-indigo-800 mb-2">วุฒิการศึกษา / คุณสมบัติเฉพาะสำหรับตำแหน่ง</h4>
                                        <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                                            {ocscDetails.civilJobEducation || ocscDetails.employeeJobSpecification || 'ไม่ระบุ'}
                                        </div>
                                    </div>
                                )}

                                {(ocscDetails.civilJobDescription || ocscDetails.employeeJobDescription) && (
                                    <div className="mb-6">
                                        <h4 className="font-bold text-indigo-800 mb-2">ลักษณะงานที่ปฏิบัติ</h4>
                                        <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                                            {ocscDetails.civilJobDescription || ocscDetails.employeeJobDescription || 'ไม่ระบุ'}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-6 border-t border-indigo-100 pt-4">
                                    {ocscDetails.salaryMin && (
                                        <div>
                                            <span className="font-semibold text-indigo-700">เงินเดือน:</span>{' '}
                                            {ocscDetails.salaryMin.toLocaleString()} - {ocscDetails.salaryMax ? ocscDetails.salaryMax.toLocaleString() : ''} บาท
                                        </div>
                                    )}
                                    {ocscDetails.applicationStartPrint && (
                                        <div>
                                            <span className="font-semibold text-indigo-700">รับสมัคร:</span>{' '}
                                            {ocscDetails.applicationStartPrint} ถึง {ocscDetails.applicationEndPrint}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* External Links / PDF / Product */}
                        <div className="flex flex-col space-y-3 mb-8">
                            {news.pdf_url && (
                                <a href={news.pdf_url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center p-4 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors group border border-red-100">
                                    <div className="bg-white p-2 rounded-full mr-3 shadow-sm group-hover:scale-110 transition-transform">
                                        <FileText className="w-5 h-5 text-red-500" />
                                    </div>
                                    <span className="font-medium">Download Official Announcement (PDF)</span>
                                </a>
                            )}

                            {news.external_link && (
                                <a href={news.external_link} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors group border border-blue-100">
                                    <div className="bg-white p-2 rounded-full mr-3 shadow-sm group-hover:scale-110 transition-transform">
                                        <ExternalLink className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <span className="font-medium">Read Original Source</span>
                                </a>
                            )}

                            {/* Product Placement (KPI) */}
                            {news.product_link && (
                                <a href={news.product_link} target="_blank" rel="noopener noreferrer"
                                    className="mt-6 flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl hover:shadow-md transition-all group">
                                    <div className="flex items-center">
                                        <div className="bg-yellow-100 p-3 rounded-full mr-4 text-yellow-600">
                                            <ShoppingBag className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-1">Recommended Resource</div>
                                            <div className="font-bold text-gray-900 group-hover:text-yellow-700">
                                                Get the Study Guide for this Exam
                                            </div>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-yellow-500" />
                                </a>
                            )}
                        </div>

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
