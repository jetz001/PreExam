import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Newspaper } from 'lucide-react';

const NewsCarousel = ({ newsList }) => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!newsList || newsList.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % newsList.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [newsList]);

    if (!newsList || newsList.length === 0) return null;

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + newsList.length) % newsList.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % newsList.length);
    };

    return (
        <div className="relative w-full overflow-hidden rounded-3xl group h-[380px] sm:h-[420px] md:h-[500px] shadow-2xl border border-white/20">
            {/* Slides */}
            <div
                className="flex transition-transform duration-700 ease-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {newsList.map((item) => (
                    <div
                        key={item.id}
                        className="min-w-full h-full relative cursor-pointer"
                        onClick={() => navigate(`/news/${item.id}`)}
                    >
                        <img
                            src={item.image_url || 'https://placehold.co/1200x600?text=News'}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/45 to-transparent" />

                        <div className="absolute bottom-0 left-0 p-5 sm:p-8 md:p-12 w-full md:w-2/3 text-white">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                                    <Newspaper size={12} />
                                    <span>{item.category || 'งานราชการ'}</span>
                                </span>
                                <div className="flex items-center text-xs text-white/80 font-medium">
                                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                    {new Date(item.published_date || item.created_at).toLocaleDateString('th-TH', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </div>
                            </div>
                            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 leading-tight line-clamp-2 drop-shadow-md">
                                {item.title}
                            </h2>
                            <p className="text-white/85 text-sm md:text-base line-clamp-2 mb-5 max-w-xl">
                                {item.summary || 'คลิกเพื่ออ่านรายละเอียดเพิ่มเติมเกี่ยวกับข่าวสารนี้'}
                            </p>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/news/${item.id}`);
                                }}
                                className="bg-white text-slate-900 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-50 transition-all inline-flex items-center gap-2 shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                            >
                                <span>อ่านรายละเอียด</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {newsList.length > 1 && (
                <>
                    <button
                        type="button"
                        aria-label="ข่าวก่อนหน้า"
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePrev();
                        }}
                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/45 backdrop-blur-md text-white opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-all hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        type="button"
                        aria-label="ข่าวถัดไป"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNext();
                        }}
                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/45 backdrop-blur-md text-white opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-all hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Dots */}
            {newsList.length > 1 && (
                <div className="absolute bottom-5 right-5 md:right-12 flex gap-2">
                    {newsList.map((_, idx) => (
                        <button
                            type="button"
                            key={idx}
                            aria-label={`ไปยังสไลด์ที่ ${idx + 1}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(idx);
                            }}
                            className={`h-2 transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00] ${
                                currentIndex === idx ? 'w-8 bg-white' : 'w-2 bg-white/45 hover:bg-white/75'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewsCarousel;
