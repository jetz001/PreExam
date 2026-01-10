import React, { useState, useEffect } from 'react';
import newsService from '../services/newsService';
import NewsCard from '../components/news/NewsCard';
import { Search } from 'lucide-react';
import AdSlot from '../components/ads/AdSlot';

const News = () => {
    const [newsList, setNewsList] = useState([]);
    const [popularKeywords, setPopularKeywords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [tempSearch, setTempSearch] = useState('');

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const response = await newsService.getNews(category, searchQuery);
                if (response.success) {
                    setNewsList(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch news", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchKeywords = async () => {
            // ... existing fetchKeywords ...
            // Optimization: Don't refetch keywords on every search, only on mount or if strictly needed.
            // But for simplicity keeping it here is fine or move out if needed.
            // Ideally keywords don't change often.
            if (popularKeywords.length === 0) {
                try {
                    const response = await newsService.getPopularKeywords();
                    if (response.success) {
                        setPopularKeywords(response.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch keywords", error);
                }
            }
        };

        fetchNews();
        fetchKeywords();
    }, [category, searchQuery]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setSearchQuery(tempSearch);
            setCategory(''); // Clear category when searching to find global results
        }
    };

    const handleTagClick = (tag) => {
        setTempSearch(tag);
        setSearchQuery(tag);
        setCategory('');
    };

    const categories = ['', 'สอบ ก.พ.', 'สอบ ท้องถิ่น', 'สอบ ครูผู้ช่วย', 'ข่าวทั่วไป'];

    // Derived state for layout
    const heroNews = newsList.length > 0 ? newsList[0] : null;
    const subNews = newsList.length > 1 ? newsList.slice(1, 5) : [];
    const remainingNews = newsList.length > 5 ? newsList.slice(5) : [];

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Top Bar / Branding */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-3 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <span className="text-xs font-medium tracking-wider uppercase opacity-80">Premium Civil Service Exam News</span>
                    <span className="text-xs font-medium">{new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header & Filters */}
                <div className="flex flex-col md:flex-row justify-between items-end border-b-2 border-gray-100 pb-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                            ข่าวสอบ<span className="text-primary">ราชการ</span>
                            <span className="block text-lg font-normal text-gray-500 mt-1">อัพเดทสถานการณ์ เจาะลึกทุกสนามสอบ</span>
                        </h1>
                    </div>

                    {/* Popular Keywords / Trending Tags */}
                    {popularKeywords.length > 0 && (
                        <div className="flex items-center space-x-2 mt-4 pb-2 animate-in slide-in-from-left-4 fade-in duration-500">
                            <span className="flex items-center text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-pulse"></span>
                                Trending
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {popularKeywords.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        onClick={() => handleTagClick(tag.name)}
                                        className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-full hover:border-royal-blue-300 hover:text-royal-blue-600 cursor-pointer transition-all"
                                    >
                                        #{tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="animate-pulse space-y-8">
                        <div className="h-96 bg-gray-200 rounded-xl w-full"></div>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="h-64 bg-gray-200 rounded-xl"></div>
                            <div className="h-64 bg-gray-200 rounded-xl"></div>
                            <div className="h-64 bg-gray-200 rounded-xl"></div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                        {/* Main Content Area (Left 3 cols) */}
                        <div className="lg:col-span-3 space-y-10">
                            {/* Show Search Result Header if searching */}
                            {searchQuery && (
                                <div className="mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        ผลการค้นหา: <span className="text-primary">"{searchQuery}"</span>
                                    </h2>
                                    {newsList.length === 0 && <p className="text-gray-500 mt-2">ไม่พบข่าวที่ค้นหา</p>}
                                </div>
                            )}

                            {/* Hero Section - Hide if searching to focus on results, or keep? Let's hide Hero if searching for better list view */}
                            {!searchQuery && heroNews && (
                                <div className="group relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-xl cursor-pointer" onClick={() => window.location.href = `/news/${heroNews.id}`}>
                                    <div className="absolute inset-0">
                                        <img
                                            src={(heroNews.image_url && !heroNews.image_url.includes('via.placeholder.com')) ? heroNews.image_url : "https://placehold.co/800x400?text=News"}
                                            alt={heroNews.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-3/4">
                                        <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider text-white bg-primary rounded-sm uppercase">
                                            {heroNews.category || 'Highlight'}
                                        </span>
                                        <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-3 group-hover:text-yellow-400 transition-colors">
                                            {heroNews.title}
                                        </h2>
                                        <p className="text-gray-300 text-sm md:text-lg line-clamp-2 mb-4">
                                            {heroNews.summary}
                                        </p>
                                        <div className="flex items-center text-gray-400 text-xs md:text-sm space-x-4">
                                            <span>{new Date(heroNews.published_at).toLocaleDateString('th-TH')}</span>
                                            <span className="flex items-center"><Search className="w-3 h-3 mr-1" /> {heroNews.views} views</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sub Grid (Next 4 items) or List if Searching */}
                            {(subNews.length > 0 || searchQuery) && (
                                <div>
                                    {!searchQuery && (
                                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                            <span className="w-2 h-8 bg-red-600 rounded-sm mr-3"></span>
                                            อัพเดทล่าสุด
                                        </h3>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {(searchQuery ? newsList : subNews).map((news, index) => (
                                            <React.Fragment key={news.id}>
                                                <div className="group cursor-pointer flex flex-col h-full" onClick={() => window.location.href = `/news/${news.id}`}>
                                                    <div className="relative aspect-video rounded-lg overflow-hidden mb-4 shadow-sm">
                                                        <img
                                                            src={(news.image_url && !news.image_url.includes('via.placeholder.com')) ? news.image_url : "https://placehold.co/400x300?text=News"}
                                                            alt={news.title}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <span className="text-xs font-bold text-red-600 uppercase">{news.category}</span>
                                                            <span className="text-gray-300 text-xs">•</span>
                                                            <span className="text-xs text-gray-400">{new Date(news.published_at).toLocaleDateString('th-TH')}</span>
                                                        </div>
                                                        <h4 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
                                                            {news.title}
                                                        </h4>
                                                        <p className="text-gray-600 text-sm line-clamp-2">
                                                            {news.summary}
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* Inject Ad every 6 items (since grid is 2 columns, 6 is 3 rows) */}
                                                {(index + 1) % 6 === 0 && (
                                                    <div className="col-span-1 md:col-span-2 py-4">
                                                        <AdSlot placement="in-feed-main" />
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Remaining List - Only show if not searching (since search shows all in grid above) */}
                            {!searchQuery && remainingNews.length > 0 && (
                                <div className="border-t pt-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {remainingNews.map(news => (
                                            <NewsCard key={news.id} news={news} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar (Trending & Categories) */}
                        <div className="lg:col-span-1 space-y-10">
                            {/* Search */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="ค้นหา..."
                                    value={tempSearch}
                                    onChange={(e) => setTempSearch(e.target.value)}
                                    onKeyDown={handleSearch}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                                <Search
                                    className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => { setSearchQuery(tempSearch); setCategory(''); }}
                                />
                            </div>

                            {/* Trending Widget */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                                <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 uppercase tracking-wider text-sm">
                                    ยอดนิยม (Trending)
                                </h4>
                                <div className="space-y-6">
                                    {newsList.slice().sort((a, b) => b.views - a.views).slice(0, 5).map((news, idx) => (
                                        <div key={news.id} className="flex group cursor-pointer" onClick={() => window.location.href = `/news/${news.id}`}>
                                            <span className="text-3xl font-black text-gray-200 mr-4 leading-none group-hover:text-primary transition-colors">{idx + 1}</span>
                                            <div>
                                                <h5 className="text-sm font-bold text-gray-900 leading-tight group-hover:underline line-clamp-2 mb-1">
                                                    {news.title}
                                                </h5>
                                                <span className="text-xs text-gray-500">{news.views} reads</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            {/* Ad/Banner Placeholder */}
                            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-8 text-center text-white">
                                <h5 className="font-bold text-xl mb-2">PreExam Pro</h5>
                                <p className="text-sm text-gray-300 mb-6">Unlocking all premium features today.</p>
                                <button className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition">Upgrade</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default News;
