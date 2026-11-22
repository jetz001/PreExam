import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Settings, User, Save, Bell, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
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
      await userService.updateProfile({ username });

      await userService.updateSettings({
        friends_online: friendsOnline,
        streak_reminder: streakReminder,
        new_message: newMessage,
      });

      authService.updateCurrentUser({
        display_name: username,
        settings_friends_online: friendsOnline,
        settings_streak_reminder: streakReminder,
        settings_new_message: newMessage,
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

  const notificationOptions = [
    {
      key: 'friendsOnline',
      title: 'แจ้งเตือนเพื่อนออนไลน์',
      desc: 'เมื่อเพื่อนเข้าสู่ระบบ',
      checked: friendsOnline,
      onToggle: () => setFriendsOnline(!friendsOnline),
    },
    {
      key: 'streakReminder',
      title: 'Streak Reminder',
      desc: 'แจ้งเตือนก่อนหมด Streak',
      checked: streakReminder,
      onToggle: () => setStreakReminder(!streakReminder),
    },
    {
      key: 'newMessage',
      title: 'ข้อความใหม่',
      desc: 'เมื่อได้รับข้อความ',
      checked: newMessage,
      onToggle: () => setNewMessage(!newMessage),
    },
  ];

  return (
    <div id="sec-settings">
      <div className="section-title" style={{ marginBottom: '20px', fontSize: '20px' }}>
        <div className="dot" />
        <Settings size={20} className="text-amber-300" />
        <span>Settings</span>
      </div>

      <div className="flex flex-col gap-5" style={{ animation: 'fadeSlideIn 0.4s both' }}>
        {statusMsg.text && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
              statusMsg.type === 'success'
                ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200'
                : 'border-rose-400/50 bg-rose-500/15 text-rose-200'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        {/* Profile Settings */}
        <div className="activity-card p-6">
          <div className="mb-4 flex items-center gap-2 text-base font-black text-amber-300">
            <User size={18} />
            <span>โปรไฟล์</span>
          </div>
          <div className="grid-2 mb-4">
            <div>
              <label
                htmlFor="settings-username"
                className="mb-2 block text-xs font-bold text-white/75"
              >
                ชื่อผู้ใช้
              </label>
              <input
                id="settings-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
              />
            </div>
            <div>
              <label
                htmlFor="settings-email"
                className="mb-2 block text-xs font-bold text-white/75"
              >
                อีเมล
              </label>
              <input
                id="settings-email"
                type="email"
                value={email}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65 outline-none"
              />
            </div>
          </div>
          <button type="button" className="btn-play" onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>บันทึก</span>
              </>
            )}
          </button>
        </div>

        {/* Notifications Settings */}
        <div className="activity-card p-6">
          <div className="mb-4 flex items-center gap-2 text-base font-black text-amber-300">
            <Bell size={18} />
            <span>การแจ้งเตือน</span>
          </div>

          <div className="divide-y divide-white/10">
            {notificationOptions.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <div className="text-sm font-extrabold text-white">{item.title}</div>
                  <div className="text-xs text-white/70">{item.desc}</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.checked}
                  aria-label={item.title}
                  onClick={item.onToggle}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                    item.checked ? 'bg-emerald-400' : 'bg-white/25'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      item.checked ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-rose-400/35 bg-white/10 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2 text-base font-black text-rose-300">
            <AlertTriangle size={18} />
            <span>Danger Zone</span>
          </div>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-400/50 bg-rose-500/10 px-5 py-2.5 text-sm font-extrabold text-rose-200 transition-colors hover:bg-rose-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <Trash2 size={16} />
              <span>ลบบัญชี</span>
            </button>
          ) : (
            <div className="rounded-xl border border-rose-400/30 bg-rose-950/35 p-4">
              <div className="mb-2 text-sm font-bold text-rose-200">
                คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี? (การกระทำนี้ไม่สามารถย้อนกลับได้)
              </div>
              <div className="mb-3 text-xs text-white/75">
                พิมพ์คำว่า <strong>DELETE</strong> ลงในช่องด้านล่างเพื่อยืนยันการลบบัญชี
              </div>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="พิมพ์ DELETE"
                  aria-label="พิมพ์ DELETE เพื่อยืนยันการลบบัญชี"
                  className="flex-1 rounded-xl border border-rose-400/35 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-rose-400 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={deleteInput !== 'DELETE' || isDeleting}
                  onClick={handleDeleteAccount}
                  className={`rounded-xl px-4 py-2 text-sm font-black transition-all ${
                    deleteInput === 'DELETE'
                      ? 'bg-rose-600 text-white hover:bg-rose-500 cursor-pointer'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  {isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบ'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteInput('');
                  }}
                  className="rounded-xl border border-white/25 px-4 py-2 text-sm font-bold text-white/80 hover:bg-white/10"
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
