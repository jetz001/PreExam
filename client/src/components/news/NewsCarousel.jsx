import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const NewsCarousel = ({ newsList }) => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (newsList.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % newsList.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [newsList.length]);

    if (!newsList || newsList.length === 0) return null;

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + newsList.length) % newsList.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % newsList.length);
    };

    return (
        <div className="relative w-full overflow-hidden rounded-3xl group h-[400px] md:h-[500px] shadow-2xl">
            {/* Slides */}
            <div
                className="flex transition-transform duration-700 ease-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {newsList.map((item, index) => (
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
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

                        <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full md:w-2/3 text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-indigo-600 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-lg">
                                    {item.category || 'งานราชการ'}
                                </span>
                                <div className="flex items-center text-xs text-white/70">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {new Date(item.published_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight line-clamp-2 drop-shadow-md">
                                {item.title}
                            </h2>
                            <p className="text-white/80 text-sm md:text-lg line-clamp-2 mb-6 font-light max-w-xl">
                                {item.summary || 'คลิกเพื่ออ่านรายละเอียดเพิ่มเติมเกี่ยวกับข่าวสารนี้'}
                            </p>
                            <button className="bg-white text-slate-900 px-6 py-3 rounded-full text-sm font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-xl border-none">
                                อ่านรายละเอียด
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
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-slate-900"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-slate-900"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Dots */}
            {newsList.length > 1 && (
                <div className="absolute bottom-6 right-6 md:right-12 flex gap-2">
                    {newsList.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                            className={`h-1.5 transition-all duration-300 rounded-full ${currentIndex === idx ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewsCarousel;
