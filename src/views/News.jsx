import React, { useState, useEffect } from 'react';
import {
    Search,
    X,
    Newspaper,
    Building2,
    Landmark,
    Briefcase,
    Users,
    ArrowDown,
    Sparkles,
} from 'lucide-react';
import newsService from '../services/newsService';
import PlayfulNewsCard from '../components/news/PlayfulNewsCard';
import AgencyGrid from '../components/news/AgencyGrid';
import '../assets/css/news.css';

const News = () => {
    // General News State
    const [newsList, setNewsList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [tempSearch, setTempSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(6);

    // Jobs State
    const [agencyStats, setAgencyStats] = useState([]);
    const [jobTypesCount, setJobTypesCount] = useState({ civil: 0, employee: 0, other: 0 });
    const [activeJobType, setActiveJobType] = useState(null);

    // Kahoot-style Background Shapes
    const [shapes, setShapes] = useState([]);
    useEffect(() => {
        const shapeTypes = ['k-circle', 'k-square', 'k-triangle'];
        const newShapes = Array.from({ length: 14 }, (_, i) => ({
            id: i,
            type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
            left: `${Math.random() * 100}vw`,
            size: `${28 + Math.random() * 44}px`,
            delay: `${Math.random() * 10}s`,
            duration: `${16 + Math.random() * 14}s`,
        }));
        setShapes(newShapes);
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [newsRes, statsRes] = await Promise.all([
                    newsService.getNews('!งานราชการ', searchQuery),
                    newsService.getAgencyStats(activeJobType),
                ]);
                if (newsRes.success) setNewsList(newsRes.data || []);
                if (statsRes.success) {
                    setAgencyStats(statsRes.data || []);
                    if (statsRes.jobTypes && !activeJobType) {
                        setJobTypesCount(statsRes.jobTypes);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch news data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [searchQuery, activeJobType]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') setSearchQuery(tempSearch);
    };

    const handleClearSearch = () => {
        setTempSearch('');
        setSearchQuery('');
    };

    const displayNews = newsList.slice(0, visibleCount);
    const hasMore = newsList.length > visibleCount;

    return (
        <div className="news-page">
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

            <div className="news-page-container relative z-10 space-y-8">
                {/* Header & Search Banner */}
                <header className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-7 shadow-2xl">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        <div className="flex items-start sm:items-center gap-4 min-w-0">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-300/30 to-pink-500/30 border border-amber-300/45 text-[#fde047] flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Newspaper size={26} />
                            </div>
                            <div className="min-w-0">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold text-amber-200 mb-1.5">
                                    <Sparkles size={11} />
                                    <span>PreExam News & Careers</span>
                                </div>
                                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight break-words">
                                    ข่าวการสอบและเปิดรับสมัครงานราชการ
                                </h1>
                                <p className="text-xs sm:text-sm text-white/75 mt-1">
                                    ติดตามประกาศรับสมัครงานราชการ อัปเดตตำแหน่งตามหน่วยงาน และข่าวสอบล่าสุด
                                </p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full lg:max-w-md flex-shrink-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
                            <input
                                type="text"
                                aria-label="ค้นหาข่าวสอบและตำแหน่งงาน"
                                placeholder="ค้นหาข่าวหรือตำแหน่งงาน..."
                                value={tempSearch}
                                onChange={(e) => setTempSearch(e.target.value)}
                                onKeyDown={handleSearch}
                                className="n-search"
                            />
                            {tempSearch && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    aria-label="ล้างคำค้นหา"
                                    className="absolute right-[84px] top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                                >
                                    <X size={15} />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setSearchQuery(tempSearch)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#fde047] to-[#f59e0b] text-[#1a0533] px-4 py-1.5 rounded-xl font-black text-xs sm:text-sm shadow hover:brightness-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                ค้นหา
                            </button>
                        </div>
                    </div>
                </header>

                {/* JOBS SECTION (TOP) */}
                <section aria-labelledby="agency-jobs-heading">
                    {/* Job Type Filter Pills */}
                    <div className="flex flex-wrap gap-2.5 mb-6" role="group" aria-label="กรองตามประเภทบุคลากร">
                        <button
                            type="button"
                            aria-pressed={activeJobType === 'civil'}
                            onClick={() => setActiveJobType(activeJobType === 'civil' ? null : 'civil')}
                            className={`px-4 py-2 rounded-full border text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00] ${
                                activeJobType === 'civil'
                                    ? 'bg-[#ffcc00] border-[#ffcc00] text-[#1a0533] shadow-lg'
                                    : 'bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20'
                            }`}
                        >
                            <Landmark size={14} />
                            <span>ข้าราชการพลเรือน</span>
                            <span
                                className={`${
                                    activeJobType === 'civil' ? 'bg-[#1a0533] text-[#ffcc00]' : 'bg-[#ffcc00] text-[#1a0533]'
                                } px-2 py-0.5 rounded-full text-[11px] font-black`}
                            >
                                {jobTypesCount.civil || 0}
                            </span>
                        </button>

                        <button
                            type="button"
                            aria-pressed={activeJobType === 'employee'}
                            onClick={() => setActiveJobType(activeJobType === 'employee' ? null : 'employee')}
                            className={`px-4 py-2 rounded-full border text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00] ${
                                activeJobType === 'employee'
                                    ? 'bg-[#00b4d8] border-[#00b4d8] text-white shadow-lg'
                                    : 'bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20'
                            }`}
                        >
                            <Briefcase size={14} />
                            <span>พนักงานราชการ</span>
                            <span
                                className={`${
                                    activeJobType === 'employee' ? 'bg-white text-[#0077b6]' : 'bg-[#00b4d8] text-white'
                                } px-2 py-0.5 rounded-full text-[11px] font-black`}
                            >
                                {jobTypesCount.employee || 0}
                            </span>
                        </button>

                        <button
                            type="button"
                            aria-pressed={activeJobType === 'other'}
                            onClick={() => setActiveJobType(activeJobType === 'other' ? null : 'other')}
                            className={`px-4 py-2 rounded-full border text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00] ${
                                activeJobType === 'other'
                                    ? 'bg-[#f72585] border-[#f72585] text-white shadow-lg'
                                    : 'bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20'
                            }`}
                        >
                            <Users size={14} />
                            <span>บุคลากรอื่น</span>
                            <span
                                className={`${
                                    activeJobType === 'other' ? 'bg-white text-[#f72585]' : 'bg-[#f72585] text-white'
                                } px-2 py-0.5 rounded-full text-[11px] font-black`}
                            >
                                {jobTypesCount.other || 0}
                            </span>
                        </button>
                    </div>

                    <h2 id="agency-jobs-heading" className="font-extrabold text-white text-lg sm:text-xl mb-4 flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/40 text-[#fde047] inline-flex items-center justify-center flex-shrink-0">
                            <Building2 size={18} />
                        </span>
                        <span>เลือกกรมเพื่อดูตำแหน่ง (ข่าวสมัครสอบราชการ)</span>
                    </h2>

                    <AgencyGrid agencies={agencyStats} />
                </section>

                {/* GENERAL NEWS SECTION (BOTTOM) */}
                <section aria-labelledby="general-news-heading" className="border-t border-white/15 pt-8">
                    <h2 id="general-news-heading" className="font-extrabold text-white mb-6 text-lg sm:text-xl flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-400/40 text-pink-200 inline-flex items-center justify-center flex-shrink-0">
                            <Newspaper size={18} />
                        </span>
                        <span>ข่าวทั่วไป</span>
                    </h2>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((idx) => (
                                <div key={idx} className="n-card h-44 animate-pulse space-y-3" aria-hidden="true">
                                    <div className="h-5 w-24 bg-white/15 rounded-full" />
                                    <div className="h-5 w-4/5 bg-white/15 rounded" />
                                    <div className="h-4 w-2/3 bg-white/10 rounded mt-auto" />
                                </div>
                            ))}
                        </div>
                    ) : newsList.length > 0 ? (
                        <>
                            {/* Hero Card */}
                            {!searchQuery && <PlayfulNewsCard news={newsList[0]} isHero={true} />}

                            {/* Grid Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-8 mt-6">
                                {(searchQuery ? displayNews : displayNews.slice(1)).map((news, index) => (
                                    <PlayfulNewsCard key={news.id} news={news} index={index} />
                                ))}
                            </div>

                            {/* Load More */}
                            {hasMore && (
                                <button
                                    type="button"
                                    className="n-btn-more"
                                    onClick={() => setVisibleCount((v) => v + 6)}
                                >
                                    <span>โหลดข่าวเพิ่มเติม</span>
                                    <ArrowDown size={16} />
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16 px-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-[#fde047] flex items-center justify-center mx-auto mb-3">
                                <Newspaper size={26} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">ไม่พบข่าวสาร</h3>
                            <p className="text-sm text-white/75 mb-4">
                                {searchQuery ? `ไม่พบข่าวที่ตรงกับ "${searchQuery}"` : 'ยังไม่มีข่าวสารในขณะนี้'}
                            </p>
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="px-4 py-2 rounded-xl bg-[#ffcc00] text-[#1a0533] text-xs font-black shadow hover:brightness-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    แสดงข่าวทั้งหมด
                                </button>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default News;
