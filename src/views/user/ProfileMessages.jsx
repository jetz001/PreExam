import React from 'react';

const ProfileMessages = () => {
    return (
        <div id="sec-messages">
            <div className="section-title" style={{ marginBottom: '20px', fontSize: '22px' }}><div className="dot"></div>📩 กล่องข้อความ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'fadeSlideIn 0.4s both' }}>
                <div className="activity-card hover-slide" style={{ cursor: 'pointer', borderLeft: '3px solid var(--k-yellow)', transition: 'transform 0.2s' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#ff7700,#e21b3c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>😎</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span style={{ fontWeight: 800 }}>StarQueen99</span>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>10 นาทีที่แล้ว</span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#fff' }}>"เฮ้! สนใจมาเล่น Quiz โหมดทีมคืนนี้ไหม?"</div>
                        </div>
                    </div>
                </div>
                <div className="activity-card hover-slide" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🔔</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span style={{ fontWeight: 800 }}>ระบบ (System)</span>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>เมื่อวาน</span>
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>"ยินดีด้วย! คุณได้รับ Badge ใหม่: World Expert"</div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .hover-slide:hover { transform: translateX(4px); }
            `}</style>
        </div>
    );
};

export default ProfileMessages;
