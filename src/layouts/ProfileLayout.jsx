import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../assets/css/profile.css';
import authService from '../services/authService';
import userService from '../services/userService';
import chatApi from '../services/chatApi';
import notificationApi from '../services/notificationApi';
import useUserRole from '../hooks/useUserRole';

const ProfileLayout = () => {
  const navigate = useNavigate();
  const { isPremium } = useUserRole();
  const [xpWidth, setXpWidth] = useState(0);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [xpInfo, setXpInfo] = useState({ currentXP: 0, nextLevelXP: 1000, level: 1, percentage: 0 });
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  useEffect(() => {
    const linkId = 'profile-fonts';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Lilita+One&display=swap';
      link.rel = 'stylesheet';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    const fetchCounts = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return;
        const msgCount = await chatApi.getUnreadCount();
        const notifCount = await notificationApi.getUnreadCount();
        setUnreadMessages(msgCount || 0);
        setUnreadNotifications(notifCount || 0);
      } catch (err) {
        console.error('Error fetching unread counts', err);
      }
    };
    fetchCounts();
    const countInterval = setInterval(fetchCounts, 30000);

    const loadData = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) setUser(currentUser);

        const [resStats, resRanking] = await Promise.all([
          userService.getStats(),
          userService.getMyRanking().catch(() => ({ success: true, data: { total_score: 0 } }))
        ]);

        if (resStats.success && resStats.data) {
          setStats({ ...resStats.data, ranking: resRanking?.data || { total_score: 0 } });
          // Calculate XP using user document's direct xp and level
          let currentXP = 0;
          let level = 1;
          
          if (currentUser && currentUser.xp !== undefined) {
              currentXP = currentUser.xp;
              level = currentUser.level || 1;
          } else if (resStats.success && resStats.data) {
              // Fallback
              currentXP = (resStats.data.totalExams * 50) + (resStats.data.totalQuestions * 10);
              level = Math.floor((1 + Math.sqrt(1 + 4 * (currentXP / 500))) / 2);
          }

          let prevLevelReq = 500 * level * (level - 1);
          const nextLevelXP = 500 * (level + 1) * level;
          
          const xpIntoLevel = currentXP - prevLevelReq;
          const xpForThisLevel = nextLevelXP - prevLevelReq;
          const percentage = Math.max(0, Math.min(100, (xpIntoLevel / xpForThisLevel) * 100));
          
          setXpInfo({ currentXP, nextLevelXP, level, percentage });
          setTimeout(() => setXpWidth(percentage), 100);
        } else {
            // Still calculate XP even if stats failed
            let currentXP = currentUser?.xp || 0;
            let level = currentUser?.level || 1;
            let prevLevelReq = 500 * level * (level - 1);
            const nextLevelXP = 500 * (level + 1) * level;
            
            const xpIntoLevel = currentXP - prevLevelReq;
            const xpForThisLevel = nextLevelXP - prevLevelReq;
            const percentage = Math.max(0, Math.min(100, (xpIntoLevel / xpForThisLevel) * 100));
            setXpInfo({ currentXP, nextLevelXP, level, percentage });
            setTimeout(() => setXpWidth(percentage), 100);
        }
      } catch (err) {
        console.error('Error fetching profile data', err);
        // Fallback for XP if error
        const currentUser = authService.getCurrentUser();
        let currentXP = currentUser?.xp || 0;
        let level = currentUser?.level || 1;
        const nextLevelXP = 500 * (level + 1) * level;
        setXpInfo({ currentXP, nextLevelXP, level, percentage: 0 });
      }
    };
    
    loadData();
    return () => clearInterval(countInterval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleNotifications = async () => {
    setShowNotifDropdown(!showNotifDropdown);
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
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

    const navItems = [
    { to: '/profile/dashboard', label: 'Dashboard', icon: '🎮' },
    { to: '/profile/history-overview', label: 'History Overview', icon: '📊' },
    { to: '/profile/history', label: 'History', icon: '🕐' },
    { to: '/profile/billing-history', label: 'Billing History', icon: '💳' },
    { to: '/profile/bookmarks', label: 'Bookmarks', icon: '🔖' },
    { to: '/profile/threads', label: 'My Threads', icon: '💬' },
    { to: '/profile/messages', label: 'Messages', icon: '📩', badge: unreadMessages > 0 ? unreadMessages : null },
    { to: '/profile/friends', label: 'Friends', icon: '👥', divider: true },
    { to: '/profile/questions', label: 'My Questions', icon: '📁' },
    { to: '/profile/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="profile-layout-container" style={{ background: 'var(--k-bg)', minHeight: '100vh', color: 'var(--k-white)', position: 'relative', overflowX: 'hidden', fontFamily: "'Nunito', sans-serif" }}>
      {/* Floaty Backgrounds */}
      <div className="floaty" style={{ width: '120px', height: '120px', background: '#ffcc00', left: '20%', bottom: '-10%', animationDuration: '18s', animationDelay: '0s', borderRadius: '30% 70% 70% 30%/30% 30% 70% 70%' }}></div>
      <div className="floaty" style={{ width: '80px', height: '80px', background: '#e21b3c', left: '70%', bottom: '-10%', animationDuration: '24s', animationDelay: '4s', borderRadius: '50%' }}></div>
      <div className="floaty" style={{ width: '60px', height: '60px', background: '#00c985', left: '45%', bottom: '-10%', animationDuration: '20s', animationDelay: '8s', borderRadius: '20%' }}></div>
      <div className="floaty" style={{ width: '100px', height: '100px', background: '#1368ce', left: '85%', bottom: '-10%', animationDuration: '22s', animationDelay: '2s', borderRadius: '50%' }}></div>

      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">🎯</div>
          <span>PreExam!</span>
        </div>

        {navItems.map((item, index) => (
          <React.Fragment key={index}>
            <NavLink 
              to={item.to} 
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              end={item.exact}
            >
              <div className="nav-icon">{item.icon}</div>
              <span className="nav-label">{item.label}</span>
              {item.badge && <div className="badge-dot">{item.badge}</div>}
            </NavLink>
            {item.divider && <div className="sidebar-divider"></div>}
          </React.Fragment>
        ))}
      </nav>

      {/* Main Content Area */}
      <div className="main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-title">
            <span>🎮 ProPlay Dashboard</span>
          </div>
          <div className="topbar-right">
            <div className="xp-bar-wrap">
              <span className="xp-label">LV. {xpInfo.level}</span>
              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${xpWidth}%` }}></div>
              </div>
              <span className="xp-text">{xpInfo.currentXP.toLocaleString()} / {xpInfo.nextLevelXP.toLocaleString()} XP</span>
            </div>
            
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button className="notif-btn" title="Notifications" onClick={handleToggleNotifications} style={{ position: 'relative' }}>
                🔔
                {unreadNotifications > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    background: '#e21b3c', color: 'white',
                    fontSize: '10px', fontWeight: 'bold',
                    padding: '2px 6px', borderRadius: '10px',
                    border: '2px solid var(--k-bg)'
                  }}>
                    {unreadNotifications}
                  </span>
                )}
              </button>
              
              {showNotifDropdown && (
                <div style={{
                  position: 'absolute', top: '100%', right: '0', marginTop: '10px',
                  width: '320px', background: 'var(--card-bg)', borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 1000,
                  border: '1px solid var(--card-border)', overflow: 'hidden'
                }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--card-border)', fontWeight: 'bold' }}>
                    การแจ้งเตือน
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        ไม่มีการแจ้งเตือนใหม่
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => { if (!n.is_read) handleMarkNotificationRead(n.id); }}
                          style={{
                            padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                            background: n.is_read ? 'transparent' : 'rgba(255,255,255,0.03)',
                            cursor: 'pointer', transition: 'background 0.2s'
                          }}
                        >
                          <div style={{ fontSize: '14px', marginBottom: '4px', opacity: n.is_read ? 0.7 : 1 }}>
                            {n.message || n.content || 'มีแจ้งเตือนใหม่'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {new Date(n.created_at).toLocaleDateString('th-TH')} {new Date(n.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="avatar-btn" onClick={() => navigate('/profile/settings')} style={{ position: 'relative' }}>
              {user?.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '🦊'}
              {isPremium && (
                <div style={{
                  position: 'absolute', bottom: '-4px', right: '-4px',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)',
                  borderRadius: '50%', width: '16px', height: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)', border: '1px solid #fff'
                }}>
                  <span style={{ fontSize: '10px' }}>👑</span>
                </div>
              )}
            </div>
            <button 
              className="notif-btn" 
              style={{ fontSize: '14px', marginLeft: '10px' }} 
              onClick={() => navigate('/')}
              title="Close Profile"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Dynamic View Content */}
        <main className="content">
          <Outlet context={{ user, stats, xpInfo }} />
        </main>
      </div>
    </div>
  );
};

export default ProfileLayout;
