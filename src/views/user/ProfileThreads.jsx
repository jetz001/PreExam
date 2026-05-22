import React from 'react';

const ProfileThreads = () => {
    return (
        <div id="sec-threads">
            <div className="section-title" style={{ marginBottom: '20px', fontSize: '22px' }}><div className="dot"></div>💬 My Threads</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeSlideIn 0.4s both' }}>
                <div className="activity-card hover-lift" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '24px' }}>🧠</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, marginBottom: '3px' }}>เคล็ดลับการจำประวัติศาสตร์โลก</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>42 ความเห็น · แชร์ 18 ครั้ง</div>
                        </div>
                        <div style={{ background: 'rgba(255,204,0,0.18)', borderRadius: '99px', padding: '4px 12px', fontSize: '12px', fontWeight: 800, color: 'var(--k-yellow)' }}>🔥 Hot</div>
                    </div>
                </div>
                <div className="activity-card hover-lift" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '24px' }}>⚡</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, marginBottom: '3px' }}>กลยุทธ์ตอบเร็วใน Speed Mode</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>28 ความเห็น · แชร์ 9 ครั้ง</div>
                        </div>
                        <div style={{ background: 'rgba(0,201,133,0.18)', borderRadius: '99px', padding: '4px 12px', fontSize: '12px', fontWeight: 800, color: 'var(--k-teal)' }}>New</div>
                    </div>
                </div>
                <div className="activity-card hover-lift" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '24px' }}>🌍</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, marginBottom: '3px' }}>Quiz ภูมิศาสตร์ที่ยากที่สุด</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>15 ความเห็น · แชร์ 6 ครั้ง</div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .hover-lift:hover { transform: translateY(-3px); }
            `}</style>
        </div>
    );
};

export default ProfileThreads;
