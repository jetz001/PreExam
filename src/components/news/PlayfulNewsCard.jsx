import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye } from 'lucide-react';

const CATEGORY_TAG_COLORS = {
    'ด่วนมาก': { bg: '#f72585', icon: '🔥' },
    'ใหม่': { bg: '#00b4d8', icon: '✨' },
    'ฮิต': { bg: '#f72585', icon: '🔥' },
    'ข้อมูล': { bg: '#06d6a0', icon: '💡' },
    'ราชการ': { bg: '#ffcc00', text: '#1a0533', icon: '🏛️' },
    'เทคนิค': { bg: '#06d6a0', icon: '💡' }
};

const BORDER_COLORS = [
    'rgba(0, 180, 216, 0.6)',  // blue
    'rgba(255, 204, 0, 0.6)',  // yellow
    'rgba(6, 214, 160, 0.6)',  // green
    'rgba(247, 37, 133, 0.6)', // pink
];

const PlayfulNewsCard = ({ news, isHero = false, index = 0 }) => {
    // Pick a tag randomly or based on category
    const cat = news.category || 'ข้อมูล';
    // Fallback if tag is not mapped
    const tagConfig = CATEGORY_TAG_COLORS[cat] || { bg: '#06d6a0', icon: '📌' };
    
    // Choose border accent color
    const borderColor = BORDER_COLORS[index % BORDER_COLORS.length];

    if (isHero) {
        return (
            <Link to={`/news/${news.id}`} className="n-card n-card-hero" style={{ padding: '32px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div style={{ flex: 1 }}>
                    <div className="n-tag" style={{ background: '#f72585', color: '#fff' }}>
                        🔥 ด่วนมาก
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '12px', lineHeight: 1.3 }}>
                        {news.title}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                        <Calendar size={14} />
                        {new Date(news.published_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        <span>- {news.agency_name || 'สำนักงาน ก.พ.'}</span>
                    </div>
                </div>
                {/* Placeholder icon/image for hero */}
                <div className="hidden md:flex" style={{ padding: '0 40px' }}>
                    <div style={{ fontSize: '100px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}>
                        🗂️
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link to={`/news/${news.id}`} className="n-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            {/* Top Border Accent */}
            <div className="n-card-accent" style={{ background: borderColor }}></div>
            
            <div className="n-tag" style={{ background: tagConfig.bg, color: tagConfig.text || '#fff' }}>
                {tagConfig.icon} {cat}
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4, flex: 1 }}>
                {news.title}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: 'auto' }}>
                <Calendar size={14} />
                {new Date(news.published_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                <span>• {news.agency_name || 'PreExam'}</span>
                
                {news.views > 0 && (
                    <>
                        <span>•</span>
                        <Eye size={14} />
                        <span>อ่าน {news.views >= 1000 ? (news.views/1000).toFixed(1) + 'k' : news.views} ครั้ง</span>
                    </>
                )}
            </div>
        </Link>
    );
};

export default PlayfulNewsCard;
