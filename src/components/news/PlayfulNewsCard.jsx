import React from 'react';
import { Link } from 'react-router-dom';
import {
    Calendar,
    Eye,
    Flame,
    Sparkles,
    Lightbulb,
    Landmark,
    Pin,
    Briefcase,
    Newspaper,
    ArrowRight,
} from 'lucide-react';

const CATEGORY_TAG_CONFIG = {
    'ด่วนมาก': { bg: '#e11d48', text: '#ffffff', Icon: Flame },
    'ใหม่': { bg: '#0284c7', text: '#ffffff', Icon: Sparkles },
    'ฮิต': { bg: '#e11d48', text: '#ffffff', Icon: Flame },
    'ข้อมูล': { bg: '#059669', text: '#ffffff', Icon: Lightbulb },
    'ราชการ': { bg: '#ffcc00', text: '#1a0533', Icon: Landmark },
    'เทคนิค': { bg: '#059669', text: '#ffffff', Icon: Lightbulb },
};

const BORDER_COLORS = [
    'linear-gradient(90deg, #38bdf8, #818cf8)',
    'linear-gradient(90deg, #fde047, #f59e0b)',
    'linear-gradient(90deg, #34d399, #06b6d4)',
    'linear-gradient(90deg, #f472b6, #e11d48)',
];

const PlayfulNewsCard = ({ news, isHero = false, index = 0 }) => {
    const cat = news.category || 'ข้อมูล';
    let displayTag = cat;
    let tagConfig = CATEGORY_TAG_CONFIG[cat] || { bg: '#059669', text: '#ffffff', Icon: Pin };

    if (cat === 'งานราชการ') {
        const posType = (news.metadata && news.metadata.position_type) || news.recruitment_type;
        if (posType) {
            displayTag = posType;
            if (posType.includes('ข้าราชการ')) {
                tagConfig = { bg: '#ffcc00', text: '#1a0533', Icon: Landmark };
            } else if (posType.includes('พนักงานราชการ')) {
                tagConfig = { bg: '#0284c7', text: '#ffffff', Icon: Briefcase };
            } else {
                tagConfig = { bg: '#e11d48', text: '#ffffff', Icon: Pin };
            }
        } else {
            displayTag = 'งานราชการ';
            tagConfig = { bg: '#ffcc00', text: '#1a0533', Icon: Landmark };
        }
    }

    const TagIcon = tagConfig.Icon;
    const accentGradient = BORDER_COLORS[index % BORDER_COLORS.length];
    const hasValidDate =
        (news.published_date || news.created_at) &&
        !isNaN(new Date(news.published_date || news.created_at).getTime());

    if (isHero) {
        return (
            <Link
                to={`/news/${news.id}`}
                className="n-card n-card-hero group p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 no-underline text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
            >
                <div className="flex-1 min-w-0">
                    <div className="n-tag" style={{ background: '#e11d48', color: '#ffffff' }}>
                        <Flame size={13} />
                        <span>ด่วนมาก</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black mb-3 leading-snug break-words text-white group-hover:text-[#fde047] transition-colors">
                        {news.title}
                    </h2>
                    {news.summary && (
                        <p className="text-sm text-white/80 line-clamp-2 mb-4 leading-relaxed">
                            {news.summary}
                        </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white/80 font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar size={14} className="text-[#fde047]" />
                            {hasValidDate
                                ? new Date(news.published_date || news.created_at).toLocaleDateString('th-TH', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                  })
                                : 'ไม่ระบุวันที่'}
                        </span>
                        {news.agency && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-xs">
                                {news.agency}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[#fde047] font-bold ml-auto md:ml-2">
                            <span>อ่านเพิ่มเติม</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </div>
                </div>

                {/* Layered Glass Hero Icon Showcase */}
                <div className="hidden md:flex items-center justify-center px-6 shrink-0" aria-hidden="true">
                    <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-300/25 via-fuchsia-500/25 to-indigo-500/30 border border-white/25 backdrop-blur-xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        <Newspaper size={48} className="text-[#fde047]" strokeWidth={1.8} />
                        <span className="absolute -top-2.5 -right-2.5 w-9 h-9 rounded-2xl bg-gradient-to-br from-[#fde047] to-[#f59e0b] text-[#1a0533] flex items-center justify-center shadow-lg border border-white/40">
                            <Sparkles size={18} />
                        </span>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link
            to={`/news/${news.id}`}
            className="n-card group no-underline text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
        >
            {/* Top Border Accent */}
            <div className="n-card-accent" style={{ background: accentGradient }} />

            <div className="n-tag" style={{ background: tagConfig.bg, color: tagConfig.text }}>
                <TagIcon size={12} />
                <span>{displayTag}</span>
            </div>

            <h3 className="text-base font-extrabold mb-4 leading-snug flex-1 break-words text-white group-hover:text-[#fde047] transition-colors">
                {news.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2 text-xs text-white/75 font-medium mt-auto pt-3 border-t border-white/10">
                <span className="inline-flex items-center gap-1.5">
                    <Calendar size={13} className="text-amber-300" />
                    {hasValidDate
                        ? new Date(news.published_date || news.created_at).toLocaleDateString('th-TH', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                          })
                        : 'ไม่ระบุวันที่'}
                </span>
                {news.agency && <span className="truncate max-w-[140px]">• {news.agency}</span>}

                {news.views > 0 && (
                    <span className="inline-flex items-center gap-1 ml-auto text-white/80">
                        <Eye size={13} />
                        <span>{news.views >= 1000 ? (news.views / 1000).toFixed(1) + 'k' : news.views}</span>
                    </span>
                )}
            </div>
        </Link>
    );
};

export default PlayfulNewsCard;
