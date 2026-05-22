import React from 'react';

const ProfileFriends = () => {
    return (
        <div id="sec-friends">
            <div className="section-title" style={{ marginBottom: '20px', fontSize: '22px' }}><div className="dot"></div>👥 Friends</div>
            <div className="grid-2" style={{ animation: 'fadeSlideIn 0.4s both' }}>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '18px', padding: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--k-yellow)' }}></span>
                        Online ตอนนี้
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '10px', transition: 'background 0.2s', cursor: 'pointer' }} className="hover-bg">
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#ff7700,#e21b3c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>😎</div>
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: 'var(--k-teal)', border: '2px solid var(--k-bg)', borderRadius: '50%' }}></div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: '14px' }}>StarQueen99</div>
                                <div style={{ fontSize: '11px', color: 'var(--k-teal)' }}>กำลังเล่น Geography</div>
                            </div>
                            <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'rgba(255,255,255,0.1)' }}>ทักทาย</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '10px', transition: 'background 0.2s', cursor: 'pointer' }} className="hover-bg">
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(192,192,192,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🐯</div>
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: 'var(--k-teal)', border: '2px solid var(--k-bg)', borderRadius: '50%' }}></div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: '14px' }}>TigerByte</div>
                                <div style={{ fontSize: '11px', color: 'var(--k-teal)' }}>กำลังเล่น Math</div>
                            </div>
                            <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'rgba(255,255,255,0.1)' }}>ทักทาย</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '10px', transition: 'background 0.2s', cursor: 'pointer' }} className="hover-bg">
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(205,127,50,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🦁</div>
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: 'var(--k-orange)', border: '2px solid var(--k-bg)', borderRadius: '50%' }}></div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: '14px' }}>LionHeart_TH</div>
                                <div style={{ fontSize: '11px', color: 'var(--k-orange)' }}>Idle</div>
                            </div>
                            <button className="btn-play" style={{ padding: '6px 12px', fontSize: '12px' }}>ชวนเล่น</button>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '18px', padding: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--k-yellow)' }}></span>
                        คำขอเป็นเพื่อน
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '10px', transition: 'background 0.2s' }} className="hover-bg">
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,119,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🐉</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: '14px' }}>DragonKid</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>LVL 38 · 200 Games</div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--k-yellow)', border: 'none', color: '#1a0533', fontWeight: 'bold', cursor: 'pointer' }}>✓</button>
                                <button style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '10px', transition: 'background 0.2s' }} className="hover-bg">
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,201,133,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🐸</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: '14px' }}>QuizFrog</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>LVL 29 · 148 Games</div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--k-yellow)', border: 'none', color: '#1a0533', fontWeight: 'bold', cursor: 'pointer' }}>✓</button>
                                <button style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .hover-bg:hover { background: rgba(255,255,255,0.05); }
            `}</style>
        </div>
    );
};

export default ProfileFriends;
