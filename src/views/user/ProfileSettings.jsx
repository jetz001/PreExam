import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import userService from '../../services/userService';
import authService from '../../services/authService';

const ProfileSettings = () => {
    const context = useOutletContext();
    const user = context?.user;

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [friendsOnline, setFriendsOnline] = useState(true);
    const [streakReminder, setStreakReminder] = useState(true);
    const [newMessage, setNewMessage] = useState(true);
    const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
    const [isSaving, setIsSaving] = useState(false);
    
    // Danger Zone state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (user) {
            setUsername(user.display_name || user.username || '');
            setEmail(user.email || '');
            setFriendsOnline(user.settings_friends_online !== false);
            setStreakReminder(user.settings_streak_reminder !== false);
            setNewMessage(user.settings_new_message !== false);
        }
    }, [user]);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setStatusMsg({ text: '', type: '' });
        try {
            // Update Profile
            await userService.updateProfile({ username });
            
            // Update Settings
            await userService.updateSettings({
                friends_online: friendsOnline,
                streak_reminder: streakReminder,
                new_message: newMessage
            });

            // Update local state
            authService.updateCurrentUser({
                display_name: username,
                settings_friends_online: friendsOnline,
                settings_streak_reminder: streakReminder,
                settings_new_message: newMessage
            });

            setStatusMsg({ text: 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว (Profile saved!)', type: 'success' });
            setTimeout(() => setStatusMsg({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error('Error saving profile:', error);
            setStatusMsg({ text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล (Failed to save)', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteInput !== 'DELETE') return;
        setIsDeleting(true);
        try {
            await userService.deleteAccount();
            authService.logout();
            window.location.href = '/';
        } catch (error) {
            console.error('Error deleting account:', error);
            setStatusMsg({ text: 'เกิดข้อผิดพลาดในการลบบัญชี', type: 'error' });
            setIsDeleting(false);
            setShowDeleteConfirm(false);
            setDeleteInput('');
        }
    };

    return (
        <div id="sec-settings">
            <div className="section-title" style={{ marginBottom: '20px', fontSize: '22px' }}><div className="dot"></div>⚙️ Settings</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeSlideIn 0.4s both' }}>
                
                {statusMsg.text && (
                    <div style={{ 
                        padding: '12px 16px', 
                        borderRadius: '12px', 
                        background: statusMsg.type === 'success' ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 71, 87, 0.1)',
                        border: `1px solid ${statusMsg.type === 'success' ? '#2ed573' : '#ff4757'}`,
                        color: statusMsg.type === 'success' ? '#2ed573' : '#ff4757',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}>
                        {statusMsg.text}
                    </div>
                )}

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
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none' }} 
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)' }}>อีเมล</label>
                            <input 
                                type="email" 
                                value={email}
                                readOnly
                                style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-muted)', fontSize: '14px', outline: 'none', cursor: 'not-allowed' }} 
                            />
                        </div>
                    </div>
                    <button className="btn-play" onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? 'กำลังบันทึก...' : '💾 บันทึก'}
                    </button>
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
                        <div 
                            style={{ width: '44px', height: '24px', background: friendsOnline ? 'var(--k-teal)' : 'rgba(255,255,255,0.2)', borderRadius: '99px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
                            onClick={() => setFriendsOnline(!friendsOnline)}
                        >
                            <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: friendsOnline ? '23px' : '3px', transition: 'left 0.3s' }}></div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '14px' }}>Streak Reminder</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>แจ้งเตือนก่อนหมด Streak</div>
                        </div>
                        <div 
                            style={{ width: '44px', height: '24px', background: streakReminder ? 'var(--k-teal)' : 'rgba(255,255,255,0.2)', borderRadius: '99px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
                            onClick={() => setStreakReminder(!streakReminder)}
                        >
                            <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: streakReminder ? '23px' : '3px', transition: 'left 0.3s' }}></div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '14px' }}>ข้อความใหม่</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>เมื่อได้รับข้อความ</div>
                        </div>
                        <div 
                            style={{ width: '44px', height: '24px', background: newMessage ? 'var(--k-teal)' : 'rgba(255,255,255,0.2)', borderRadius: '99px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
                            onClick={() => setNewMessage(!newMessage)}
                        >
                            <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: newMessage ? '23px' : '3px', transition: 'left 0.3s' }}></div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(226,27,60,0.3)', borderRadius: '18px', padding: '24px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#ff6b87', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🚨 Danger Zone
                    </div>
                    
                    {!showDeleteConfirm ? (
                        <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            style={{ background: 'transparent', border: '1px solid rgba(226,27,60,0.5)', color: '#ff6b87', padding: '10px 20px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', transition: 'background 0.2s' }} 
                            onMouseEnter={(e) => e.target.style.background = 'rgba(226,27,60,0.1)'} 
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                            🗑️ ลบบัญชี
                        </button>
                    ) : (
                        <div style={{ background: 'rgba(226,27,60,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(226,27,60,0.2)' }}>
                            <div style={{ color: '#ff6b87', fontWeight: 'bold', marginBottom: '8px' }}>
                                คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี? (การกระทำนี้ไม่สามารถย้อนกลับได้)
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                พิมพ์คำว่า <strong>DELETE</strong> ลงในช่องด้านล่างเพื่อยืนยันการลบบัญชี
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input 
                                    type="text" 
                                    value={deleteInput}
                                    onChange={(e) => setDeleteInput(e.target.value)}
                                    placeholder="พิมพ์ DELETE"
                                    style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(226,27,60,0.3)', borderRadius: '8px', padding: '8px 12px', color: '#fff', outline: 'none' }}
                                />
                                <button 
                                    disabled={deleteInput !== 'DELETE' || isDeleting}
                                    onClick={handleDeleteAccount}
                                    style={{ 
                                        background: deleteInput === 'DELETE' ? '#e21b3c' : 'rgba(255,255,255,0.1)', 
                                        color: deleteInput === 'DELETE' ? '#fff' : 'rgba(255,255,255,0.3)',
                                        border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', 
                                        cursor: deleteInput === 'DELETE' ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบ'}
                                </button>
                                <button 
                                    onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ProfileSettings;
