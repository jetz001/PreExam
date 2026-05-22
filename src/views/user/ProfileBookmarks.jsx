import React from 'react';

const ProfileBookmarks = () => {
    return (
        <div id="sec-bookmarks">
            <div className="section-title" style={{ marginBottom: '20px', fontSize: '22px' }}><div className="dot"></div>🔖 Bookmarks</div>
            <div className="grid-2" style={{ animation: 'fadeSlideIn 0.4s both' }}>
                <div className="stat-card blue" style={{ cursor: 'pointer' }}>
                    <span className="sc-icon">🏛️</span>
                    <div className="sc-value" style={{ color: '#5a9eff', fontSize: '18px', marginBottom: '6px' }}>History of Rome</div>
                    <div className="sc-label">ประวัติศาสตร์ · 20 ข้อ · ยาก</div>
                    <button className="btn-play" style={{ marginTop: '12px', fontSize: '12px' }}>▶ เล่นเลย</button>
                </div>
                <div className="stat-card teal" style={{ cursor: 'pointer' }}>
                    <span className="sc-icon">🌊</span>
                    <div className="sc-value" style={{ color: 'var(--k-teal)', fontSize: '18px', marginBottom: '6px' }}>Ocean Deep Dive</div>
                    <div className="sc-label">วิทยาศาสตร์ · 15 ข้อ · ปานกลาง</div>
                    <button className="btn-play" style={{ marginTop: '12px', fontSize: '12px' }}>▶ เล่นเลย</button>
                </div>
                <div className="stat-card yellow" style={{ cursor: 'pointer' }}>
                    <span className="sc-icon">🎨</span>
                    <div className="sc-value" style={{ color: 'var(--k-yellow)', fontSize: '18px', marginBottom: '6px' }}>Art Through Ages</div>
                    <div className="sc-label">ศิลปะ · 12 ข้อ · ง่าย</div>
                    <button className="btn-play" style={{ marginTop: '12px', fontSize: '12px' }}>▶ เล่นเลย</button>
                </div>
                <div className="stat-card purple" style={{ cursor: 'pointer' }}>
                    <span className="sc-icon">🌌</span>
                    <div className="sc-value" style={{ color: '#b07fff', fontSize: '18px', marginBottom: '6px' }}>Space Explorers</div>
                    <div className="sc-label">ดาราศาสตร์ · 25 ข้อ · ยากมาก</div>
                    <button className="btn-play" style={{ marginTop: '12px', fontSize: '12px' }}>▶ เล่นเลย</button>
                </div>
            </div>
        </div>
    );
};

export default ProfileBookmarks;
