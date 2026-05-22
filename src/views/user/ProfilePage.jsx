import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../assets/css/profile.css';
import { Settings } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [xpWidth, setXpWidth] = useState(0);

  useEffect(() => {
    // Add Google Fonts for Lilita One and Nunito if not already present
    const linkId = 'profile-fonts';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Lilita+One&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    
    // Animate XP bar on mount
    setTimeout(() => {
      setXpWidth(81); // 2840/3500 is roughly 81%
    }, 100);
  }, []);

  const navTabs = [
    { to: '/profile/dashboard', label: 'Dashboard', icon: '🎮', exact: false },
    { to: '/profile/history-overview', label: 'History Overview', icon: '📊' },
    { to: '/profile/history', label: 'History', icon: '🕐' },
    { to: '/profile/bookmarks', label: 'Bookmarks', icon: '🔖' },
    { to: '/profile/threads', label: 'My Threads', icon: '💬' },
    { to: '/profile/messages', label: 'Messages', icon: '📩' },
    { to: '/profile/friends', label: 'Friends', icon: '👥' },
  ];

  return (
    <div className="profile-layout-container w-full">
      {/* Floating Background Shapes */}
      <div className="floaty" style={{ width: '120px', height: '120px', background: '#ffcc00', left: '20%', bottom: '-10%', animationDuration: '18s', animationDelay: '0s', borderRadius: '30% 70% 70% 30%/30% 30% 70% 70%' }}></div>
      <div className="floaty" style={{ width: '80px', height: '80px', background: '#e21b3c', left: '70%', bottom: '-10%', animationDuration: '24s', animationDelay: '4s', borderRadius: '50%' }}></div>
      <div className="floaty" style={{ width: '60px', height: '60px', background: '#00c985', left: '45%', bottom: '-10%', animationDuration: '20s', animationDelay: '8s', borderRadius: '20%' }}></div>
      <div className="floaty" style={{ width: '100px', height: '100px', background: '#1368ce', left: '85%', bottom: '-10%', animationDuration: '22s', animationDelay: '2s', borderRadius: '50%' }}></div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10 w-full">
        
        {/* Top Gamified Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-black/20 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="topbar-title">
            <span className="text-2xl">🎮 ProPlay Dashboard</span>
          </div>
          <div className="topbar-right">
            <div className="xp-bar-wrap">
              <span className="xp-label">XP</span>
              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${xpWidth}%` }}></div>
              </div>
              <span className="xp-text">2,840 / 3,500</span>
            </div>
            <button className="notif-btn" title="Notifications">🔔</button>
          </div>
        </div>

        {/* Playful Horizontal Tabs (Re-introduced) */}
        <div className="flex flex-wrap items-center gap-3 overflow-visible pb-6">
          {navTabs.map((tab, index) => {
              const colors = [
                  { bg: 'bg-[#e21b3c]', border: 'border-[#b5142f]' },
                  { bg: 'bg-[#1368ce]', border: 'border-[#0e53a3]' },
                  { bg: 'bg-[#26890c]', border: 'border-[#1e6c09]' },
                  { bg: 'bg-[#ebbf00]', border: 'border-[#b39100]' },
                  { bg: 'bg-[#46178f]', border: 'border-[#320b6d]' },
                  { bg: 'bg-[#ff7700]', border: 'border-[#cc5e00]' },
                  { bg: 'bg-[#00c985]', border: 'border-[#00a36b]' },
              ];
              const color = colors[index % colors.length];

              return (
                  <NavLink
                      key={tab.to}
                      to={tab.to}
                      className={({ isActive }) => `flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap text-sm font-black uppercase tracking-wider transition-all transform ${
                          isActive
                              ? `${color.bg} text-white shadow-[0_6px_0_${color.border.replace('border-', '')}] -translate-y-1 scale-105`
                              : `bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 hover:-translate-y-1`
                          }`}
                  >
                      <span className="text-xl">{tab.icon}</span>
                      {tab.label}
                  </NavLink>
              );
          })}
          
          <NavLink
              to="/profile/settings"
              className={({ isActive }) => `flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap text-sm font-black uppercase tracking-wider transition-all transform ${
                  isActive
                      ? `bg-gray-800 text-white shadow-[0_6px_0_#111827] -translate-y-1 scale-105`
                      : `bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 hover:-translate-y-1`
                  }`}
          >
              <Settings size={20} /> Settings
          </NavLink>
        </div>

        {/* Dynamic Route Content */}
        <div className="content-container">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
