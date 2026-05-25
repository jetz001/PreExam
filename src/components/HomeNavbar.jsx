import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import publicService from '../services/publicService';

/* ──────────────────────────────────────────────────────
   HomeNavbar  — Kahoot-style overlay navbar for Home page
   Left  : Logo pill + collapsible nav menu (hamburger)
   Right : Login / Register pills  OR  Avatar dropdown
────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { path: '/',               label: '🏠 หน้าแรก',          color: '#a78bfa' },
  { path: '/exam',           label: '📝 คลังข้อสอบ',       color: '#e91e63' },
  { path: '/lobby',          label: '🏆 ห้องสอบกลุ่ม',     color: '#00b4d8' },
  { path: '/community',      label: '💬 ชุมชน',            color: '#22c55e' },
  { path: '/learning-center',label: '📚 ศูนย์เรียนรู้',    color: '#f59e0b' },
  { path: '/news',           label: '📰 ข่าวสอบ',          color: '#3b82f6' },
];

const HELP_LINKS = [
  { path: '/contact', label: '📬 ติดต่อเรา' },
  { path: '/faq',     label: '❓ คำถามที่พบบ่อย' },
  { path: '/policy',  label: '🔒 นโยบายความเป็นส่วนตัว' },
];

const SOCIAL_LINKS = [
  { href: 'https://facebook.com', label: '👥 Facebook' },
  { href: 'https://line.me',      label: '💚 Line OA' },
];

export default function HomeNavbar() {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user,        setUser]        = useState(null);
  const menuRef    = useRef(null);
  const profileRef = useRef(null);
  const navigate   = useNavigate();
  const location   = useLocation();

  const isLightMode = location.pathname.startsWith('/pricing');

  /* load user */
  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  /* close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current    && !menuRef.current.contains(e.target))    setMenuOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    publicService.logActivity?.('BTN_LOGOUT', { type: 'manual' });
    authService.logout();
    setUser(null);
    setProfileOpen(false);
    navigate('/login');
  };

  const avatar = user?.avatar || user?.avatar_url;
  const displayName = user?.display_name || user?.username || 'ผู้ใช้';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        @keyframes menuSlide {
          from { opacity:0; transform:translateY(-10px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes profileSlide {
          from { opacity:0; transform:translateY(-8px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .hn-pill {
          display:inline-flex; align-items:center; gap:6px;
          padding:7px 14px; border-radius:999px;
          font-weight:700; font-size:0.82rem;
          white-space:nowrap; cursor:pointer; border:none;
          transition: transform 0.15s cubic-bezier(.34,1.6,.64,1), box-shadow 0.15s, filter 0.15s;
          text-decoration:none;
        }
        .hn-pill:hover  { transform:translateY(-2px); filter:brightness(1.1); }
        .hn-pill:active { transform:scale(0.96); }

        .hn-avatar-btn {
          width:40px; height:40px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; border:3px solid rgba(255,255,255,0.5);
          font-weight:800; font-size:1rem; color:#fff;
          transition: border-color 0.15s, transform 0.15s;
          background: linear-gradient(135deg,#a855f7,#7c3aed);
          overflow:hidden;
        }
        .hn-avatar-btn:hover { border-color:#fff; transform:scale(1.07); }

        .hn-dropdown {
          position:absolute; top:calc(100% + 10px);
          background:rgba(40, 15, 80, 0.75);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
          border:1px solid rgba(255, 255, 255, 0.15);
          border-top:1px solid rgba(255, 255, 255, 0.3);
          border-left:1px solid rgba(255, 255, 255, 0.3);
          border-radius:20px;
          box-shadow:0 20px 60px rgba(0,0,0,0.4);
          animation:menuSlide 0.2s ease both;
          overflow:hidden; z-index:200;
          padding:10px;
        }

        .hn-drop-link {
          display:flex; align-items:center; gap:10px;
          padding:10px 14px; border-radius:12px;
          color:rgba(255,255,255,0.85); font-weight:700; font-size:0.88rem;
          text-decoration:none; white-space:nowrap;
          transition:background 0.15s, color 0.15s;
          cursor:pointer; border:none; background:transparent; width:100%; text-align:left;
        }
        .hn-drop-link:hover { background:rgba(255,255,255,0.1); color:#fff; }

        .hn-hamburger {
          width:42px; height:42px; border-radius:14px;
          background:rgba(255,255,255,0.15);
          border:2px solid rgba(255,255,255,0.25);
          display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px;
          cursor:pointer; transition:background 0.15s, transform 0.15s;
        }
        .hn-hamburger:hover { background:rgba(255,255,255,0.25); transform:scale(1.05); }
        .hn-hamburger span {
          display:block; height:2.5px; border-radius:2px; background:#fff;
          transition:all 0.25s ease;
        }
        .hn-hamburger.open span:nth-child(1) { transform:translateY(7.5px) rotate(45deg); }
        .hn-hamburger.open span:nth-child(2) { opacity:0; transform:scaleX(0); }
        .hn-hamburger.open span:nth-child(3) { transform:translateY(-7.5px) rotate(-45deg); }

        .hn-light-mode .hn-hamburger {
          background: rgba(0,0,0,0.05);
          border-color: rgba(0,0,0,0.15);
        }
        .hn-light-mode .hn-hamburger:hover { background: rgba(0,0,0,0.1); }
        .hn-light-mode .hn-hamburger span { background: #46178f; }
      `}</style>

      <nav className={isLightMode ? 'hn-light-mode' : ''} style={{
        position:'absolute', top:0, left:0, right:0, zIndex:100,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'14px 20px',
      }}>

        {/* ── LEFT : Logo + Hamburger menu ── */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }} ref={menuRef}>

          {/* Logo pill */}
          <Link to="/" style={{
            display:'flex', alignItems:'center', gap:8,
            background: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)',
            border: isLightMode ? '2px solid rgba(0,0,0,0.15)' : '2px solid rgba(255,255,255,0.3)',
            backdropFilter:'blur(10px)',
            borderRadius:999,
            padding:'7px 16px 7px 10px',
            textDecoration:'none',
          }}>
            <span style={{ fontSize:22 }}>🎯</span>
            <span style={{
              fontFamily:"'Nunito','Sarabun',sans-serif",
              fontWeight:900, color: isLightMode ? '#46178f' : '#fff', fontSize:'1.05rem', letterSpacing:'-0.5px',
            }}>PreExam</span>
            <span style={{ color: isLightMode ? '#e21b3c' : '#ffcc00', fontWeight:900, fontSize:'1.05rem' }}>!</span>
          </Link>

          {/* Hamburger toggle */}
          <button
            className={`hn-hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="เมนู"
          >
            <span style={{ width: menuOpen ? 20 : 22 }}/>
            <span style={{ width:16 }}/>
            <span style={{ width: menuOpen ? 20 : 22 }}/>
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="hn-dropdown" style={{ left:0, minWidth:230 }}>

              {/* ── เมนูหลัก ── */}
              <div style={{ padding:'6px 12px 6px', color:'rgba(255,255,255,0.4)',
                fontSize:'0.68rem', fontWeight:800, letterSpacing:1.2, textTransform:'uppercase' }}>
                เมนูหลัก
              </div>
              {NAV_LINKS.map(link => (
                <Link key={link.path} to={link.path} className="hn-drop-link" onClick={() => setMenuOpen(false)}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:link.color,
                    flexShrink:0, boxShadow:`0 0 8px ${link.color}` }}/>
                  {link.label}
                </Link>
              ))}
              <Link to="/pricing" className="hn-drop-link" onClick={() => setMenuOpen(false)}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#fbbf24',
                  flexShrink:0, boxShadow:'0 0 8px #fbbf24' }}/>
                ⭐ พรีเมียม
              </Link>

              {/* ── ช่วยเหลือ ── */}
              <div style={{ margin:'8px 0 0', borderTop:'1px solid rgba(255,255,255,0.08)' }}/>
              <div style={{ padding:'8px 12px 4px', color:'rgba(255,255,255,0.4)',
                fontSize:'0.68rem', fontWeight:800, letterSpacing:1.2, textTransform:'uppercase' }}>
                ช่วยเหลือ
              </div>
              {HELP_LINKS.map(link => (
                <Link key={link.path} to={link.path} className="hn-drop-link" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}

              {/* ── ติดตามเรา ── */}
              <div style={{ margin:'8px 0 0', borderTop:'1px solid rgba(255,255,255,0.08)' }}/>
              <div style={{ padding:'8px 12px 4px', color:'rgba(255,255,255,0.4)',
                fontSize:'0.68rem', fontWeight:800, letterSpacing:1.2, textTransform:'uppercase' }}>
                ติดตามเรา
              </div>
              {SOCIAL_LINKS.map(link => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer"
                  className="hn-drop-link" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              ))}

            </div>
          )}
        </div>

        {/* ── RIGHT : Auth area ── */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>

          {user ? (
            /* ── Logged in: avatar + dropdown ── */
            <div style={{ position:'relative' }} ref={profileRef}>
              <button
                className="hn-avatar-btn"
                onClick={() => setProfileOpen(v => !v)}
                aria-label="โปรไฟล์"
              >
                {avatar
                  ? <img src={avatar} alt={displayName} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=b6e3f4,c0aede,d1d4f9`} alt={displayName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                }
              </button>

              {profileOpen && (
                <div className="hn-dropdown" style={{ right:0, minWidth:210, animation:'profileSlide 0.2s ease both' }}>
                  {/* user info */}
                  <div style={{ padding:'12px 14px 10px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:6 }}>
                    <div style={{ color:'#fff', fontWeight:800, fontSize:'0.92rem' }}>{displayName}</div>
                    <div style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.76rem', marginTop:2 }}>{user.email}</div>
                  </div>

                  <Link to="/profile" className="hn-drop-link" onClick={() => setProfileOpen(false)}>👤 โปรไฟล์ของฉัน</Link>
                  <Link to="/profile/dashboard" className="hn-drop-link" onClick={() => setProfileOpen(false)}>📊 แดชบอร์ด</Link>
                  <Link to="/profile/settings" className="hn-drop-link" onClick={() => setProfileOpen(false)}>⚙️ ตั้งค่า</Link>

                  {!user.email?.startsWith('guest_') && (
                    <Link to="/business/dashboard" className="hn-drop-link" onClick={() => setProfileOpen(false)}>
                      🏢 จัดการเพจ
                    </Link>
                  )}

                  <div style={{ margin:'6px 0 4px', borderTop:'1px solid rgba(255,255,255,0.08)' }}/>
                  <button className="hn-drop-link" onClick={handleLogout} style={{ color:'#ff6b8a' }}>
                    🚪 ออกจากระบบ
                  </button>
                </div>
              )}
            </div>

          ) : (
            /* ── Not logged in: Login + Register pills ── */
            <>
              <Link to="/login" className="hn-pill" style={{
                background: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)',
                border: isLightMode ? '2px solid rgba(0,0,0,0.15)' : '2px solid rgba(255,255,255,0.35)',
                color: isLightMode ? '#46178f' : '#fff',
                backdropFilter:'blur(10px)',
              }}>
                เข้าสู่ระบบ
              </Link>
              <Link to="/register" className="hn-pill" style={{
                background:'linear-gradient(135deg,#ffcc00,#ff9800)',
                color:'#1a0533',
                boxShadow:'0 4px 20px rgba(255,200,0,0.4)',
              }}>
                สมัครฟรี 🚀
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
