import React from 'react';

const ProfileSettings = () => {
    return (
        <div id="sec-settings">
            <div className="section-title" style={{ marginBottom: '20px', fontSize: '22px' }}><div className="dot"></div>⚙️ Settings</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeSlideIn 0.4s both' }}>
                
                {/* Profile Settings */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '18px', padding: '24px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--k-yellow)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        👤 โปรไฟล์
                    </div>
                    <div className="grid-2" style={{ marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>ชื่อผู้ใช้</label>
                            <input 
                                type="text" 
                                defaultValue="NinjaFox9000"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none' }} 
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>อีเมล</label>
                            <input 
                                type="email" 
                                defaultValue="fox@play.com"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none' }} 
                            />
                        </div>
                    </div>
                    <button className="btn-play">💾 บันทึก</button>
                </div>

                {/* Notifications Settings */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '18px', padding: '24px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--k-yellow)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🔔 การแจ้งเตือน
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '14px' }}>แจ้งเตือนเพื่อนออนไลน์</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>เมื่อเพื่อนเข้าสู่ระบบ</div>
                        </div>
                        <div style={{ width: '44px', height: '24px', background: 'var(--k-teal)', borderRadius: '99px', position: 'relative', cursor: 'pointer' }}>
                            <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', right: '3px' }}></div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '14px' }}>Streak Reminder</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>แจ้งเตือนก่อนหมด Streak</div>
                        </div>
                        <div style={{ width: '44px', height: '24px', background: 'var(--k-teal)', borderRadius: '99px', position: 'relative', cursor: 'pointer' }}>
                            <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', right: '3px' }}></div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '14px' }}>ข้อความใหม่</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>เมื่อได้รับข้อความ</div>
                        </div>
                        <div style={{ width: '44px', height: '24px', background: 'rgba(255,255,255,0.2)', borderRadius: '99px', position: 'relative', cursor: 'pointer' }}>
                            <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: '3px' }}></div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(226,27,60,0.3)', borderRadius: '18px', padding: '24px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#ff6b87', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🚨 Danger Zone
                    </div>
                    <button style={{ background: 'transparent', border: '1px solid rgba(226,27,60,0.5)', color: '#ff6b87', padding: '10px 20px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(226,27,60,0.1)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                        🗑️ ลบบัญชี
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ProfileSettings;
