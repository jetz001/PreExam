import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import newsService from '../services/newsService';
import PlayfulNewsCard from '../components/news/PlayfulNewsCard';
import AgencyGrid from '../components/news/AgencyGrid';
import '../assets/css/news.css';
import { useNavigate } from 'react-router-dom';

const News = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');
    
    // General News State
    const [newsList, setNewsList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [tempSearch, setTempSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(6);

    // Jobs State
    const [agencyStats, setAgencyStats] = useState([]);

    // Kahoot-style Background Shapes
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

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [newsRes, statsRes] = await Promise.all([
                    newsService.getNews('!งานราชการ', searchQuery),
                    newsService.getAgencyStats()
                ]);
                if (newsRes.success) setNewsList(newsRes.data);
                if (statsRes.success) setAgencyStats(statsRes.data);
            } catch (err) {
                console.error("Failed to fetch news data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [searchQuery]);



    const handleSearch = (e) => {
        if (e.key === 'Enter') setSearchQuery(tempSearch);
    };

    const displayNews = newsList.slice(0, visibleCount);
    const hasMore = newsList.length > visibleCount;

    return (
        <div className="news-page">
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

            <div className="news-page-container relative z-10 space-y-6">
                
                {/* Search Bar */}
                <div className="relative max-w-3xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                        type="text"
                        placeholder="ค้นหาข่าว..."
                        value={tempSearch}
                        onChange={(e) => setTempSearch(e.target.value)}
                        onKeyDown={handleSearch}
                        className="n-search"
                    />
                    <button 
                        onClick={() => setSearchQuery(tempSearch)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#ffcc00] text-[#1a0533] px-4 py-1.5 rounded-lg font-bold text-sm"
                    >
                        ค้นหา
                    </button>
                </div>

                {/* Tabs */}
                <div className="news-tabs">
                    <div 
                        className={`news-tab ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        ข่าวทั่วไป
                    </div>
                    <div 
                        className={`news-tab ${activeTab === 'jobs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('jobs')}
                    >
                        ข่าวสมัครงานราชการ
                    </div>
                </div>

                {/* TAB 1: GENERAL NEWS */}
                {activeTab === 'general' && (
                    <div className="animate-in fade-in duration-500">
                        {loading ? (
                            <div className="text-center py-20 text-white/50">Loading news...</div>
                        ) : newsList.length > 0 ? (
                            <>
                                {/* Hero Card */}
                                {!searchQuery && <PlayfulNewsCard news={newsList[0]} isHero={true} />}
                                
                                {/* Grid Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {(searchQuery ? displayNews : displayNews.slice(1)).map((news, index) => (
                                        <PlayfulNewsCard key={news.id} news={news} index={index} />
                                    ))}
                                </div>

                                {/* Load More */}
                                {hasMore && (
                                    <button 
                                        className="n-btn-more"
                                        onClick={() => setVisibleCount(v => v + 6)}
                                    >
                                        โหลดข่าวเพิ่มเติม ↓
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 text-white/50">ไม่พบข่าวสาร</div>
                        )}
                    </div>
                )}

                {/* TAB 2: JOBS */}
                {activeTab === 'jobs' && (
                    <div className="animate-in fade-in duration-500">
                        
                        {/* Filters (Mocked for visual) */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white flex items-center gap-2">
                                <span className="bg-[#ffcc00] text-[#1a0533] px-1.5 rounded text-[10px]">594</span> ข้าราชการพลเรือน
                            </div>
                            <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white flex items-center gap-2">
                                <span className="bg-[#00b4d8] text-white px-1.5 rounded text-[10px]">234</span> พนักงานราชการ
                            </div>
                            <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white flex items-center gap-2">
                                <span className="bg-[#f72585] text-white px-1.5 rounded text-[10px]">16</span> บุคลากรอื่น
                            </div>
                        </div>

                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            📁 เลือกกรมเพื่อดูตำแหน่ง
                        </h3>

                        <AgencyGrid agencies={agencyStats} />

                        <button className="n-btn-more mt-6">
                            ดูทุกกรมและตำแหน่ง →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default News;
