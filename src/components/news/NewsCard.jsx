import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Calendar } from 'lucide-react';

const NewsCard = ({ news }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="h-48 overflow-hidden bg-gray-100">
                <img
                    src={(news.image_url && !news.image_url.includes('placehold.co')) ? news.image_url : "https://placehold.co/300x200?text=News"}
                    alt={news.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x200?text=News" }}
                />
            </div>
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold tracking-wide text-indigo-500 uppercase bg-indigo-50 rounded-full">
                        {news.category || 'ประกาศทั่วไป'}
                    </span>
                    <div className="flex items-center text-gray-400 text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        {news.views || 0}
                    </div>
                </div>

                <Link to={`/news/${news.id}`} className="block mt-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary transition-colors line-clamp-2">
                        {news.title}
                    </h3>
                </Link>

                <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                    {news.summary}
                </p>

                <div className="flex items-center justify-between mt-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(news.published_at).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsCard;
