import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  BarChart3,
  Clock,
  CreditCard,
  Bookmark,
  MessageSquare,
  Mail,
  Users,
  FolderKanban,
  Settings,
  Bell,
  X,
  Crown,
  User,
  Sparkles,
  CheckCheck,
} from 'lucide-react';
import '../assets/css/profile.css';
import authService from '../services/authService';
import userService from '../services/userService';
import chatApi from '../services/chatApi';
import notificationApi from '../services/notificationApi';
import useUserRole from '../hooks/useUserRole';
import BrandLogo from '../components/common/BrandLogo';

/**
 * Derive level, level XP bounds, and progress percentage consistently from raw XP.
 * Matches worker/src/index.ts level formula: Math.floor((1 + Math.sqrt(1 + 4 * (xp / 1000))) / 2)
 */
const computeXpInfo = (rawXP = 0) => {
  const currentXP = Math.max(0, Number(rawXP) || 0);
  const level = Math.max(1, Math.floor((1 + Math.sqrt(1 + 4 * (currentXP / 1000))) / 2));
  const prevLevelReq = 1000 * level * (level - 1);
  const nextLevelXP = 1000 * (level + 1) * level;
  const xpIntoLevel = Math.max(0, currentXP - prevLevelReq);
  const xpForThisLevel = Math.max(1, nextLevelXP - prevLevelReq);
  const percentage = Math.max(0, Math.min(100, (xpIntoLevel / xpForThisLevel) * 100));
  return { currentXP, prevLevelReq, nextLevelXP, level, percentage };
};

const ProfileLayout = () => {
  const navigate = useNavigate();
  const { isPremium } = useUserRole();
  const [xpWidth, setXpWidth] = useState(0);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [xpInfo, setXpInfo] = useState(() => computeXpInfo(0));
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const loadData = useCallback(async () => {
    const cachedUser = authService.getCurrentUser();
    if (cachedUser) setUser(cachedUser);

    try {
      const [resProfile, resStats, resRanking] = await Promise.all([
        userService.getProfile().catch(() => null),
        userService.getStats().catch(() => null),
        userService.getMyRanking().catch(() => ({ success: true, data: { total_score: 0 } })),
      ]);

      const freshUser = resProfile?.success && resProfile?.data ? resProfile.data : cachedUser;
      if (resProfile?.success && resProfile?.data) {
        setUser(resProfile.data);
        authService.updateCurrentUser(resProfile.data);
      }

      if (resStats?.success && resStats?.data) {
        setStats({ ...resStats.data, ranking: resRanking?.data || { total_score: 0 } });
      }

      let rawXP = 0;
      if (freshUser && freshUser.xp !== undefined && freshUser.xp !== null) {
        rawXP = Number(freshUser.xp) || 0;
      } else if (resStats?.success && resStats?.data) {
        rawXP = (resStats.data.totalExams || 0) * 50 + (resStats.data.totalQuestions || 0) * 10;
      }

      const computed = computeXpInfo(rawXP);
      setXpInfo(computed);
      setTimeout(() => setXpWidth(computed.percentage), 80);
    } catch (err) {
      console.error('Error fetching profile data', err);
      const computed = computeXpInfo(cachedUser?.xp || 0);
      setXpInfo(computed);
      setTimeout(() => setXpWidth(computed.percentage), 80);
    }
  }, []);

  useEffect(() => {
    const linkId = 'profile-fonts';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Sarabun:wght@400;500;600;700;800&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    const fetchCounts = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return;
        const [msgCount, notifCount] = await Promise.all([
          chatApi.getUnreadCount(),
          notificationApi.getUnreadCount(),
        ]);
        setUnreadMessages(msgCount || 0);
        setUnreadNotifications(notifCount || 0);
      } catch (err) {
        console.error('Error fetching unread counts', err);
      }
    };

    fetchCounts();
    const countInterval = setInterval(fetchCounts, 30000);
    loadData();

    return () => clearInterval(countInterval);
  }, [loadData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const handleToggleNotifications = async () => {
    setShowNotifDropdown((prev) => !prev);
    if (!showNotifDropdown) {
      try {
        const notifs = await notificationApi.getNotifications(10);
        setNotifications(notifs || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadNotifications((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const navItems = [
    { to: '/profile/dashboard', label: 'Dashboard', Icon: Gamepad2 },
    { to: '/profile/history-overview', label: 'History Overview', Icon: BarChart3 },
    { to: '/profile/history', label: 'History', Icon: Clock },
    { to: '/profile/billing-history', label: 'Billing History', Icon: CreditCard },
    { to: '/profile/bookmarks', label: 'Bookmarks', Icon: Bookmark },
    { to: '/profile/threads', label: 'My Threads', Icon: MessageSquare },
    { to: '/profile/messages', label: 'Messages', Icon: Mail, badge: unreadMessages > 0 ? unreadMessages : null },
    { to: '/profile/friends', label: 'Friends', Icon: Users, divider: true },
    { to: '/profile/questions', label: 'My Questions', Icon: FolderKanban },
    { to: '/profile/settings', label: 'Settings', Icon: Settings },
  ];

  return (
    <div
      className="profile-layout-container"
      style={{
        background: 'var(--k-bg)',
        minHeight: '100vh',
        color: 'var(--k-white)',
        position: 'relative',
        overflowX: 'hidden',
        fontFamily: "'Sarabun', 'Nunito', sans-serif",
      }}
    >
      {/* Ambient Floating Shapes */}
      <div
        className="floaty"
        style={{
          width: '120px',
          height: '120px',
          background: '#ffcc00',
          left: '20%',
          bottom: '-10%',
          animationDuration: '18s',
          animationDelay: '0s',
          borderRadius: '30% 70% 70% 30%/30% 30% 70% 70%',
        }}
      />
      <div
        className="floaty"
        style={{
          width: '80px',
          height: '80px',
          background: '#e21b3c',
          left: '70%',
          bottom: '-10%',
          animationDuration: '24s',
          animationDelay: '4s',
          borderRadius: '50%',
        }}
      />
      <div
        className="floaty"
        style={{
          width: '60px',
          height: '60px',
          background: '#00c985',
          left: '45%',
          bottom: '-10%',
          animationDuration: '20s',
          animationDelay: '8s',
          borderRadius: '20%',
        }}
      />
      <div
        className="floaty"
        style={{
          width: '100px',
          height: '100px',
          background: '#1368ce',
          left: '85%',
          bottom: '-10%',
          animationDuration: '22s',
          animationDelay: '2s',
          borderRadius: '50%',
        }}
      />

      {/* Sidebar */}
      <nav className="sidebar" aria-label="เมนูโปรไฟล์">
        <button
          type="button"
          className="sidebar-logo"
          onClick={() => navigate('/')}
          aria-label="กลับหน้าหลัก PreExam"
        >
          <div className="logo-icon">
            <BrandLogo showText={false} size="sm" variant="dark" aria-hidden="true" />
          </div>
          <span className="brand-wordmark">
            PreExam<span className="brand-bang">!</span>
          </span>
        </button>

        {navItems.map((item, index) => {
          const IconComp = item.Icon;
          return (
            <React.Fragment key={index}>
              <NavLink
                to={item.to}
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                end={item.exact}
                title={item.label}
              >
                <div className="nav-icon">
                  <IconComp size={19} strokeWidth={2.2} />
                </div>
                <span className="nav-label">{item.label}</span>
                {item.badge && <div className="badge-dot">{item.badge}</div>}
              </NavLink>
              {item.divider && <div className="sidebar-divider" />}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <div className="main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-inner">
            <div className="topbar-title">
              <span className="topbar-title-badge" aria-hidden="true">
                <Gamepad2 size={18} strokeWidth={2.3} />
              </span>
              <span>PreExam Dashboard</span>
            </div>

            <div className="topbar-right">
              <div
                className="xp-bar-wrap"
                role="progressbar"
                aria-valuenow={Math.round(xpInfo.percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Level ${xpInfo.level}, ${xpInfo.currentXP.toLocaleString()} จาก ${xpInfo.nextLevelXP.toLocaleString()} XP`}
                title={`${xpInfo.currentXP.toLocaleString()} / ${xpInfo.nextLevelXP.toLocaleString()} XP (${Math.round(xpInfo.percentage)}%)`}
              >
                <span className="xp-label">
                  <Sparkles size={11} />
                  LV. {xpInfo.level}
                </span>
                <div className="xp-bar">
                  <div className="xp-fill" style={{ width: `${xpWidth}%` }} />
                </div>
                <span className="xp-text">
                  {xpInfo.currentXP.toLocaleString()} / {xpInfo.nextLevelXP.toLocaleString()} XP
                </span>
              </div>

              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="notif-btn"
                  title="การแจ้งเตือน"
                  aria-label="การแจ้งเตือน"
                  aria-expanded={showNotifDropdown}
                  onClick={handleToggleNotifications}
                >
                  <Bell size={18} strokeWidth={2.2} />
                  {unreadNotifications > 0 && (
                    <span className="notif-count-badge">{unreadNotifications}</span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="notif-dropdown-panel">
                    <div className="notif-dropdown-header">
                      <span className="inline-flex items-center gap-2">
                        <Bell size={15} className="text-amber-300" />
                        <span>การแจ้งเตือน</span>
                      </span>
                      {unreadNotifications > 0 && (
                        <span className="notif-unread-pill">{unreadNotifications} ใหม่</span>
                      )}
                    </div>
                    <div className="notif-dropdown-body">
                      {notifications.length === 0 ? (
                        <div className="notif-empty">
                          <CheckCheck size={24} className="mx-auto mb-2 opacity-60" />
                          <span>ไม่มีการแจ้งเตือนใหม่</span>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <button
                            type="button"
                            key={n.id}
                            onClick={() => {
                              if (!n.is_read) handleMarkNotificationRead(n.id);
                            }}
                            className={`notif-item ${n.is_read ? 'read' : 'unread'}`}
                          >
                            <span className={`notif-item-dot ${n.is_read ? 'read' : 'unread'}`} />
                            <div className="min-w-0 flex-1 text-left">
                              <div className="notif-item-text">
                                {n.message || n.content || 'มีแจ้งเตือนใหม่'}
                              </div>
                              <div className="notif-item-time">
                                {new Date(n.created_at).toLocaleDateString('th-TH')}{' '}
                                {new Date(n.created_at).toLocaleTimeString('th-TH', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="avatar-btn"
                onClick={() => navigate('/profile/settings')}
                aria-label="ตั้งค่าโปรไฟล์"
                title="ตั้งค่าโปรไฟล์"
                style={{ position: 'relative' }}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.display_name || 'Avatar'}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <User size={19} strokeWidth={2.3} />
                )}
                {isPremium && (
                  <div className="avatar-premium-crown" title="สมาชิกพรีเมียม">
                    <Crown size={10} strokeWidth={2.8} />
                  </div>
                )}
              </button>

              <button
                type="button"
                className="notif-btn"
                onClick={() => navigate('/')}
                aria-label="กลับหน้าหลัก"
                title="กลับหน้าหลัก"
              >
                <X size={18} strokeWidth={2.3} />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic View Content */}
        <main className="content">
          <Outlet context={{ user, stats, xpInfo, refreshProfile: loadData }} />
        </main>
      </div>
    </div>
  );
};

export default ProfileLayout;
