import React, { useState, useEffect } from 'react';
import newsService from '../services/newsService';
import NewsCard from '../components/news/NewsCard';
import NewsCarousel from '../components/news/NewsCarousel';
import AgencyGrid from '../components/news/AgencyGrid';
import AgencyModal from '../components/news/AgencyModal';
import { Search, TrendingUp, Filter, ArrowRight, Bell, Sparkles, Newspaper } from 'lucide-react';
import AdSlot from '../components/ads/AdSlot';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const News = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State
    const [newsList, setNewsList] = useState([]);
    const [popularKeywords, setPopularKeywords] = useState([]);
    const [agencyStats, setAgencyStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [tempSearch, setTempSearch] = useState('');
    const [selectedAgency, setSelectedAgency] = useState(null);
    const [visibleCount, setVisibleCount] = useState(6);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [newsRes, keywordsRes, statsRes] = await Promise.all([
                    newsService.getNews(null, searchQuery),
                    newsService.getPopularKeywords(),
                    newsService.getAgencyStats()
                ]);

                if (newsRes.success) setNewsList(newsRes.data);
                if (keywordsRes.success) setPopularKeywords(keywordsRes.data);
                if (statsRes.success) setAgencyStats(statsRes.data);
            } catch (error) {
                console.error("Failed to fetch news data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchQuery]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setSearchQuery(tempSearch);
        }
    };

    const handleTagClick = (tag) => {
        setTempSearch(tag);
        setSearchQuery(tag);
    };

    // Derived Data
    const featuredNews = newsList.filter(n => n.is_featured).slice(0, 5);
    const heroNews = featuredNews.length > 0 ? featuredNews : newsList.slice(0, 5);
    const displayNews = searchQuery ? newsList : newsList.slice(5).slice(0, visibleCount);
    const hasMore = !searchQuery && (newsList.length - 5) > visibleCount;
    const trendingNews = [...newsList].sort((a, b) => b.views - a.views).slice(0, 5);

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sarabun pb-20">
            {/* Dark Premium Navigation / Sub-header */}
            <div className="bg-[#1e293b] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-transparent" />
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Newspaper className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-extrabold tracking-tight text-xl hidden sm:block">PreExam <span className="text-indigo-400">News</span></span>
                    </div>

                    <div className="flex-1 max-w-xl relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="ค้นหางานราชการ, หน่วยงาน, หรือตำแหน่ง..."
                            value={tempSearch}
                            onChange={(e) => setTempSearch(e.target.value)}
                            onKeyDown={handleSearch}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-2 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-800 transition-all text-slate-200"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {/* redundant notification bell removed as per request */}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">

                {/* Hero Carousel */}
                {!searchQuery && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <NewsCarousel newsList={heroNews} />
                    </section>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* Trending Tags */}
                        {popularKeywords.length > 0 && (
                            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                <div className="flex items-center gap-1.5 text-rose-500 font-bold text-sm shrink-0">
                                    <Sparkles className="w-4 h-4" />
                                    <span>กำลังฮิต:</span>
                                </div>
                                {popularKeywords.map((tag, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleTagClick(tag.name)}
                                        className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-all shrink-0 shadow-sm"
                                    >
                                        #{tag.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Agency Section */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                        <span className="w-2 h-8 bg-indigo-600 rounded-full" />
                                        แยกตามหน่วยงานที่รับสมัคร
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-1">เจาะลึกทุกกองงาน อัปเดตล่าสุดรายวัน</p>
                                </div>
                                <button className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                    ดูทั้งหมด <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            <AgencyGrid
                                agencies={agencyStats}
                                onAgencyClick={(name) => setSelectedAgency(name)}
                            />
                        </section>

                        {/* News List */}
                        <section>
                            <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
                                <h2 className="text-2xl font-black text-slate-800">
                                    {searchQuery ? `ผลการค้นหา: "${searchQuery}"` : 'ข่าวสารประกาศสอบล่าสุด'}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors">
                                        <Filter className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
                                    ))}
                                </div>
                            ) : displayNews.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-medium">ไม่พบข้อมูลข่าวสารที่คุณกำลังค้นหา</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {displayNews.map((news, index) => (
                                        <React.Fragment key={news.id}>
                                            <NewsCard news={news} />
                                            {/* Inject Ad Spot */}
                                            {(index + 1) % 4 === 0 && (
                                                <div className="col-span-1 md:col-span-2 py-4">
                                                    <AdSlot placement="in-feed-main" />
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}

                            {hasMore && (
                                <div className="mt-12 text-center">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 6)}
                                        className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-2 mx-auto"
                                    >
                                        ดูข่าวประกาศเพิ่มเติม <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:col-span-4 space-y-10">

                        {/* Trending Sidebar */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 sticky top-24">
                            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-rose-500" />
                                ข่าวยอดนิยม
                            </h3>
                            <div className="space-y-8">
                                {trendingNews.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        onClick={() => navigate(`/news/${item.id}`)}
                                        className="flex gap-4 group cursor-pointer"
                                    >
                                        <span className="text-4xl font-black text-slate-100 group-hover:text-indigo-100 transition-colors leading-none shrink-0 italic">
                                            {idx + 1}
                                        </span>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                                <span>{item.views.toLocaleString()} อ่านแล้ว</span>
                                                <span>•</span>
                                                <span>{new Date(item.published_at).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Premium Banner */}
                            {(!user || user.plan_type !== 'premium') && (
                                <div className="mt-12 bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden group shadow-xl">
                                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                    <div className="relative z-10">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-xl font-black mb-2">PreExam Pro</h4>
                                        <p className="text-white/70 text-sm mb-6 font-medium leading-relaxed">รับการแจ้งเตือนข่าวสารก่อนใคร พร้อมสรุปแนวข้อสอบล่าสุด</p>
                                        <button
                                            onClick={() => navigate('/premium-upgrade')}
                                            className="w-full py-3 bg-white text-indigo-900 rounded-xl text-sm font-black hover:bg-slate-100 transition-all shadow-lg"
                                        >
                                            อัปเกรดตอนนี้
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Agency Modal */}
            {selectedAgency && (
                <AgencyModal
                    agencyName={selectedAgency}
                    onClose={() => setSelectedAgency(null)}
                />
            )}
        </div>
    );
};

export default News;
