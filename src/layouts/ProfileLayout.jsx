import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../assets/css/profile.css';
import authService from '../services/authService';
import userService from '../services/userService';

const ProfileLayout = () => {
  const navigate = useNavigate();
  const [xpWidth, setXpWidth] = useState(0);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [xpInfo, setXpInfo] = useState({ currentXP: 0, nextLevelXP: 1000, level: 1, percentage: 0 });

  useEffect(() => {
    const linkId = 'profile-fonts';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Lilita+One&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    const loadData = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) setUser(currentUser);

        const resStats = await userService.getStats();
        if (resStats.success && resStats.data) {
          setStats(resStats.data);
          // Calculate XP (1 question = 10 XP roughly, or totalScore * 10)
          // Since getStats returns totalQuestions, timeTaken, totalExams. Let's say 1 Exam = 100 XP, 1 Question = 10 XP
          const calculatedXP = (resStats.data.totalExams * 50) + (resStats.data.totalQuestions * 10);
          const level = Math.floor(calculatedXP / 1000) + 1;
          const nextLevelXP = level * 1000;
          const currentLevelXP = calculatedXP % 1000;
          const percentage = (currentLevelXP / 1000) * 100;
          
          setXpInfo({ currentXP: calculatedXP, nextLevelXP, level, percentage });
          setTimeout(() => setXpWidth(percentage), 100);
        }
      } catch (err) {
        console.error('Error fetching profile data', err);
      }
    };
    
    loadData();
  }, []);

  const navItems = [
    { to: '/profile/dashboard', label: 'Dashboard', icon: '🎮' },
    { to: '/profile/history-overview', label: 'History Overview', icon: '📊' },
    { to: '/profile/history', label: 'History', icon: '🕐' },
    { to: '/profile/bookmarks', label: 'Bookmarks', icon: '🔖' },
    { to: '/profile/threads', label: 'My Threads', icon: '💬' },
    { to: '/profile/messages', label: 'Messages', icon: '📩', badge: 3 },
    { to: '/profile/friends', label: 'Friends', icon: '👥', divider: true },
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
            <button className="notif-btn" title="Notifications">🔔</button>
            <div className="avatar-btn" onClick={() => navigate('/profile/settings')}>
              {user?.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '🦊'}
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
