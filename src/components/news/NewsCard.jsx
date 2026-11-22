import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Calendar, Newspaper } from 'lucide-react';

const NewsCard = ({ news }) => {
    const validDate =
        (news.published_date || news.created_at) &&
        !isNaN(new Date(news.published_date || news.created_at).getTime());

    return (
        <article className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/80 dark:border-white/15 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                <img
                    src={
                        news.image_url && !news.image_url.includes('placehold.co')
                            ? news.image_url
                            : 'https://placehold.co/300x200?text=News'
                    }
                    alt={news.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://placehold.co/300x200?text=News';
                    }}
                />
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-center gap-2 mb-2.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold tracking-wide text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200/60 dark:border-indigo-500/30 rounded-full">
                        <Newspaper size={12} />
                        <span>{news.category || 'ประกาศทั่วไป'}</span>
                    </span>
                    <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs font-medium">
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        <span>{news.views || 0}</span>
                    </div>
                </div>

                <Link
                    to={`/news/${news.id}`}
                    className="block mt-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2">
                        {news.title}
                    </h3>
                </Link>

                <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 text-sm leading-relaxed flex-1">
                    {news.summary}
                </p>

                <div className="flex items-center justify-between mt-auto text-xs font-medium text-slate-500 dark:text-slate-400 pt-3.5 border-t border-slate-100 dark:border-white/10">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                            {validDate
                                ? new Date(news.published_date || news.created_at).toLocaleDateString('th-TH', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                  })
                                : 'ไม่ระบุวันที่'}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default NewsCard;
