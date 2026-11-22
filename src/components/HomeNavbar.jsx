import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import publicService from '../services/publicService';
import {
  Building2,
  Home,
  FileCheck2,
  Trophy,
  MessageSquare,
  BookOpen,
  Newspaper,
  Crown,
  Mail,
  HelpCircle,
  ShieldCheck,
  Share2,
  MessageCircle,
  User,
  FolderKanban,
  Settings,
  LogOut,
  LogIn,
  Rocket,
} from 'lucide-react';
import useUserRole from '../hooks/useUserRole';
import BrandLogo from './common/BrandLogo';

/* ──────────────────────────────────────────────────────
   HomeNavbar  — Floating Glass Navbar for PreExam
   Left  : Brand Emblem pill + Hamburger drawer toggle
   Center: Desktop Quick-Nav pills (lg+)
   Right : Login / Register pills OR Avatar dropdown
────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { path: '/',                label: 'หน้าแรก',       color: '#a78bfa', Icon: Home },
  { path: '/exam',            label: 'คลังข้อสอบ',    color: '#f43f5e', Icon: FileCheck2 },
  { path: '/lobby',           label: 'ห้องสอบกลุ่ม',  color: '#06b6d4', Icon: Trophy },
  { path: '/community',       label: 'ชุมชน',         color: '#22c55e', Icon: MessageSquare },
  { path: '/learning-center', label: 'ศูนย์เรียนรู้', color: '#f59e0b', Icon: BookOpen },
  { path: '/news',            label: 'ข่าวสอบ',       color: '#3b82f6', Icon: Newspaper },
];

const QUICK_NAV_PATHS = ['/exam', '/lobby', '/community', '/learning-center', '/news'];
const QUICK_NAV_LINKS = NAV_LINKS.filter((item) => QUICK_NAV_PATHS.includes(item.path));

const HELP_LINKS = [
  { path: '/contact', label: 'ติดต่อเรา',              color: '#38bdf8', Icon: Mail },
  { path: '/faq',     label: 'คำถามที่พบบ่อย',         color: '#a78bfa', Icon: HelpCircle },
  { path: '/policy',  label: 'นโยบายความเป็นส่วนตัว', color: '#34d399', Icon: ShieldCheck },
];

const SOCIAL_LINKS = [
  { href: 'https://facebook.com', label: 'Facebook', color: '#60a5fa', Icon: Share2 },
  { href: 'https://line.me',      label: 'Line OA',  color: '#4ade80', Icon: MessageCircle },
];

export default function HomeNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { isPremium } = useUserRole();
  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isLightMode = location.pathname.startsWith('/pricing');
  const isAuthPage = ['/login', '/register'].some((path) => location.pathname.startsWith(path));

  /* load user */
  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, [location.pathname]);

  /* close menus on route change */
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /* close on outside click or Escape */
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const handleLogout = async () => {
    await publicService.logActivity?.('BTN_LOGOUT', { type: 'manual' });
    authService.logout();
    setUser(null);
    setProfileOpen(false);
    navigate('/login');
  };

  const avatar = user?.avatar || user?.avatar_url;
  const displayName = user?.display_name || user?.username || 'ผู้ใช้';

  return (
    <>
      <style>{`
        @keyframes menuSlide {
          from { opacity:0; transform:translateY(-10px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes profileSlide {
          from { opacity:0; transform:translateY(-8px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .hn-pill {
          display:inline-flex; align-items:center; gap:7px;
          padding:8px 15px; border-radius:999px;
          font-weight:800; font-size:0.82rem;
          font-family:'Sarabun','Nunito',sans-serif;
          white-space:nowrap; cursor:pointer; border:none;
          transition: transform 0.18s cubic-bezier(.34,1.6,.64,1), box-shadow 0.18s, filter 0.18s, background 0.18s;
          text-decoration:none;
        }
        .hn-pill:hover  { transform:translateY(-2px); filter:brightness(1.08); }
        .hn-pill:active { transform:scale(0.96); }
        .hn-pill:focus-visible { outline:none; box-shadow:0 0 0 3px rgba(253,224,71,0.75); }

        .hn-avatar-btn {
          width:42px; height:42px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; border:2.5px solid rgba(255,255,255,0.55);
          font-weight:800; font-size:1rem; color:#fff;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          background: linear-gradient(135deg,#8b5cf6,#6d28d9);
          box-shadow: 0 4px 16px rgba(15, 5, 36, 0.35);
          overflow:visible;
          padding:0;
        }
        .hn-avatar-btn:hover { border-color:#fde047; transform:scale(1.06); box-shadow:0 6px 22px rgba(253,224,71,0.3); }
        .hn-avatar-btn:focus-visible { outline:none; box-shadow:0 0 0 3px rgba(253,224,71,0.85); }

        .hn-dropdown {
          position:absolute; top:calc(100% + 12px);
          background:rgba(28, 10, 62, 0.9);
          backdrop-filter:blur(24px);
          -webkit-backdrop-filter:blur(24px);
          border:1px solid rgba(255, 255, 255, 0.18);
          border-top:1px solid rgba(255, 255, 255, 0.32);
          border-radius:22px;
          box-shadow:0 24px 64px rgba(8, 2, 24, 0.55);
          animation:menuSlide 0.2s cubic-bezier(.2,.8,.2,1) both;
          overflow:hidden; z-index:200;
          padding:10px;
          font-family:'Sarabun','Nunito',sans-serif;
        }

        .hn-drop-link {
          display:flex; align-items:center; gap:11px;
          padding:9px 12px; border-radius:14px;
          color:rgba(255,255,255,0.88); font-weight:700; font-size:0.88rem;
          text-decoration:none; white-space:nowrap;
          transition:background 0.16s, color 0.16s, transform 0.16s;
          cursor:pointer; border:none; background:transparent; width:100%; text-align:left;
        }
        .hn-drop-link:hover { background:rgba(255,255,255,0.12); color:#fff; transform:translateX(2px); }
        .hn-drop-link:focus-visible { outline:none; background:rgba(255,255,255,0.16); box-shadow:inset 0 0 0 2px rgba(253,224,71,0.65); }

        .hn-icon-badge {
          width:30px; height:30px; border-radius:10px;
          display:inline-flex; align-items:center; justify-content:center;
          flex-shrink:0;
          backdrop-filter:blur(8px);
          transition:transform 0.18s ease;
        }
        .hn-drop-link:hover .hn-icon-badge { transform:scale(1.08); }

        .hn-hamburger {
          width:42px; height:42px; border-radius:14px;
          background:rgba(255,255,255,0.14);
          backdrop-filter:blur(14px);
          -webkit-backdrop-filter:blur(14px);
          border:1.5px solid rgba(255,255,255,0.28);
          display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px;
          cursor:pointer; transition:background 0.18s, transform 0.18s, border-color 0.18s;
          box-shadow:0 4px 16px rgba(0,0,0,0.15);
        }
        .hn-hamburger:hover { background:rgba(255,255,255,0.24); transform:scale(1.05); border-color:rgba(255,255,255,0.45); }
        .hn-hamburger:focus-visible { outline:none; box-shadow:0 0 0 3px rgba(253,224,71,0.75); }
        .hn-hamburger span {
          display:block; height:2.5px; border-radius:2px; background:#fff;
          transition:all 0.25s ease;
        }
        .hn-hamburger.open span:nth-child(1) { transform:translateY(7.5px) rotate(45deg); }
        .hn-hamburger.open span:nth-child(2) { opacity:0; transform:scaleX(0); }
        .hn-hamburger.open span:nth-child(3) { transform:translateY(-7.5px) rotate(-45deg); }

        .hn-light-mode .hn-hamburger {
          background: rgba(255,255,255,0.8);
          border-color: rgba(70,23,143,0.18);
          box-shadow: 0 4px 14px rgba(70,23,143,0.08);
        }
        .hn-light-mode .hn-hamburger:hover { background: rgba(255,255,255,0.95); border-color: rgba(70,23,143,0.35); }
        .hn-light-mode .hn-hamburger span { background: #46178f; }
        .hn-light-mode .hn-avatar-btn { border-color: rgba(70,23,143,0.3); }

        .hn-nav {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 20px;
          max-width: 100%;
          box-sizing: border-box;
        }
        .hn-left, .hn-right {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .hn-left { position: relative; }
        .hn-brand-pill {
          display: flex;
          align-items: center;
          border-radius: 999px;
          padding: 5px 15px 5px 6px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .hn-brand-full { display: inline-flex; align-items: center; }
        .hn-brand-compact { display: none; align-items: center; }

        @media (max-width: 639px) {
          .hn-nav { padding: 10px 12px; gap: 8px; }
          .hn-left, .hn-right { gap: 6px; }
          .hn-hamburger { width: 38px; height: 38px; border-radius: 12px; }
          .hn-pill { padding: 7px 11px; font-size: 0.76rem; gap: 5px; }
          .hn-brand-pill { padding: 4px 12px 4px 5px; }
          .hn-dropdown { max-width: calc(100vw - 24px); }
        }

        @media (max-width: 479px) {
          .hn-brand-full { display: none; }
          .hn-brand-compact { display: inline-flex; }
          .hn-brand-pill { padding: 4px; }
        }
      `}</style>

      <nav
        aria-label="เมนูนำทางหลัก"
        className={`hn-nav ${isLightMode ? 'hn-light-mode' : ''}`}
      >
        {/* ── LEFT : Brand Emblem + Hamburger drawer ── */}
        <div className="hn-left" ref={menuRef}>
          <Link
            to="/"
            aria-label="PreExam หน้าแรก"
            className="hn-brand-pill transition-all duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            style={{
              background: isLightMode ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.14)',
              border: isLightMode ? '1.5px solid rgba(70,23,143,0.16)' : '1.5px solid rgba(255,255,255,0.28)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: isLightMode
                ? '0 6px 20px rgba(70,23,143,0.08)'
                : '0 6px 24px rgba(0,0,0,0.18)',
            }}
          >
            <span className="hn-brand-full">
              <BrandLogo variant={isLightMode ? 'light' : 'dark'} size="sm" aria-hidden="true" />
            </span>
            <span className="hn-brand-compact">
              <BrandLogo showText={false} variant={isLightMode ? 'light' : 'dark'} size="sm" aria-hidden="true" />
            </span>
          </Link>

          {/* Hamburger toggle */}
          <button
            type="button"
            className={`hn-hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'ปิดเมนูหลัก' : 'เปิดเมนูหลัก'}
            aria-expanded={menuOpen}
            title="เมนูหลัก"
          >
            <span style={{ width: menuOpen ? 20 : 21 }} />
            <span style={{ width: 15 }} />
            <span style={{ width: menuOpen ? 20 : 21 }} />
          </button>

          {/* Full Navigation Dropdown Drawer */}
          {menuOpen && (
            <div className="hn-dropdown" style={{ left: 0, minWidth: 256 }}>
              <div
                style={{
                  padding: '6px 12px',
                  color: 'rgba(255,255,255,0.48)',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                }}
              >
                เมนูหลัก
              </div>

              {NAV_LINKS.map((link) => {
                const IconComp = link.Icon;
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="hn-drop-link"
                    style={active ? { background: 'rgba(255,255,255,0.14)', color: '#fff' } : undefined}
                    onClick={() => {
                      setMenuOpen(false);
                      publicService.logActivity?.('BTN_NAV_CLICK', { label: link.label, path: link.path });
                    }}
                  >
                    <span
                      className="hn-icon-badge"
                      style={{
                        background: `${link.color}26`,
                        border: `1px solid ${link.color}55`,
                        color: link.color,
                        boxShadow: `0 0 12px ${link.color}30`,
                      }}
                    >
                      <IconComp size={15} strokeWidth={2.3} />
                    </span>
                    <span style={{ flex: 1 }}>{link.label}</span>
                    {active && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: link.color,
                          boxShadow: `0 0 8px ${link.color}`,
                        }}
                      />
                    )}
                  </Link>
                );
              })}

              <Link
                to="/pricing"
                className="hn-drop-link"
                style={
                  location.pathname.startsWith('/pricing')
                    ? { background: 'rgba(251,191,36,0.16)', color: '#fde047' }
                    : undefined
                }
                onClick={() => {
                  setMenuOpen(false);
                  publicService.logActivity?.('BTN_NAV_CLICK', { label: 'พรีเมียม', path: '/pricing' });
                }}
              >
                <span
                  className="hn-icon-badge"
                  style={{
                    background: 'rgba(251, 191, 36, 0.2)',
                    border: '1px solid rgba(251, 191, 36, 0.5)',
                    color: '#fbbf24',
                    boxShadow: '0 0 12px rgba(251, 191, 36, 0.35)',
                  }}
                >
                  <Crown size={15} strokeWidth={2.3} />
                </span>
                <span>พรีเมียม</span>
              </Link>

              {/* ── ช่วยเหลือ ── */}
              <div style={{ margin: '8px 0 0', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
              <div
                style={{
                  padding: '8px 12px 4px',
                  color: 'rgba(255,255,255,0.48)',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                }}
              >
                ช่วยเหลือ
              </div>
              {HELP_LINKS.map((link) => {
                const IconComp = link.Icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="hn-drop-link"
                    onClick={() => {
                      setMenuOpen(false);
                      publicService.logActivity?.('BTN_NAV_CLICK', { label: link.label, path: link.path });
                    }}
                  >
                    <span
                      className="hn-icon-badge"
                      style={{
                        background: `${link.color}22`,
                        border: `1px solid ${link.color}44`,
                        color: link.color,
                      }}
                    >
                      <IconComp size={15} strokeWidth={2.2} />
                    </span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* ── ติดตามเรา ── */}
              <div style={{ margin: '8px 0 0', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
              <div
                style={{
                  padding: '8px 12px 4px',
                  color: 'rgba(255,255,255,0.48)',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                }}
              >
                ติดตามเรา
              </div>
              {SOCIAL_LINKS.map((link) => {
                const IconComp = link.Icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="hn-drop-link"
                    onClick={() => {
                      setMenuOpen(false);
                      publicService.logActivity?.('BTN_NAV_CLICK', { label: link.label, path: link.href });
                    }}
                  >
                    <span
                      className="hn-icon-badge"
                      style={{
                        background: `${link.color}22`,
                        border: `1px solid ${link.color}44`,
                        color: link.color,
                      }}
                    >
                      <IconComp size={15} strokeWidth={2.2} />
                    </span>
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* ── CENTER : Desktop Quick-Nav Pills (lg+) ── */}
        <div
          className={`hidden lg:flex items-center gap-1 rounded-full p-1 backdrop-blur-xl transition-all duration-200 ${
            isLightMode
              ? 'bg-white/80 border border-purple-900/15 shadow-[0_6px_24px_rgba(70,23,143,0.08)]'
              : 'bg-white/12 border border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.18)]'
          }`}
        >
          {QUICK_NAV_LINKS.map((link) => {
            const IconComp = link.Icon;
            const isActive =
              location.pathname === link.path ||
              (link.path !== '/' && location.pathname.startsWith(link.path));

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => publicService.logActivity?.('BTN_NAV_CLICK', { label: link.label, path: link.path })}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                  isLightMode
                    ? isActive
                      ? 'bg-[#46178f] text-white shadow-sm'
                      : 'text-slate-700 hover:bg-purple-900/10 hover:text-[#46178f]'
                    : isActive
                      ? 'bg-white text-[#46178f] shadow-md'
                      : 'text-white/90 hover:bg-white/15 hover:text-white'
                }`}
                style={{ fontFamily: "'Sarabun','Nunito',sans-serif" }}
              >
                <IconComp
                  size={14}
                  strokeWidth={2.4}
                  style={{ color: isActive && !isLightMode ? '#6d28d9' : isActive ? '#fde047' : link.color }}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* ── RIGHT : Auth area ── */}
        <div className="hn-right">
          {user ? (
            /* ── Logged in: avatar + dropdown ── */
            <div style={{ position: 'relative' }} ref={profileRef}>
              <button
                type="button"
                className="hn-avatar-btn"
                onClick={() => setProfileOpen((v) => !v)}
                aria-label="เมนูโปรไฟล์ผู้ใช้"
                aria-expanded={profileOpen}
                style={{ position: 'relative' }}
              >
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
                  {avatar ? (
                    <img src={avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                      alt={displayName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>
                {isPremium && (
                  <div
                    title="สมาชิกพรีเมียม"
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-4px',
                      background: 'linear-gradient(135deg, #fde047 0%, #f59e0b 100%)',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.45)',
                      border: '1.5px solid #fff',
                      color: '#451a03',
                      zIndex: 10,
                    }}
                  >
                    <Crown size={10} strokeWidth={2.8} />
                  </div>
                )}
              </button>

              {profileOpen && (
                <div className="hn-dropdown" style={{ right: 0, minWidth: 230, animation: 'profileSlide 0.2s ease both' }}>
                  {/* user info */}
                  <div style={{ padding: '10px 12px 10px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 6 }}>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.94rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{displayName}</span>
                      {isPremium && (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 900,
                            padding: '2px 7px',
                            borderRadius: 999,
                            background: 'linear-gradient(135deg,#fde047,#f59e0b)',
                            color: '#1a0533',
                          }}
                        >
                          PRO
                        </span>
                      )}
                    </div>
                    {user.email && (
                      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.76rem', marginTop: 2 }}>{user.email}</div>
                    )}
                  </div>

                  <Link
                    to="/profile"
                    className="hn-drop-link"
                    onClick={() => {
                      setProfileOpen(false);
                      publicService.logActivity?.('BTN_NAV_CLICK', { label: 'โปรไฟล์ของฉัน', path: '/profile' });
                    }}
                  >
                    <span className="hn-icon-badge" style={{ background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.45)', color: '#c4b5fd' }}>
                      <User size={15} strokeWidth={2.3} />
                    </span>
                    <span>โปรไฟล์ของฉัน</span>
                  </Link>

                  <Link
                    to="/profile/questions"
                    className="hn-drop-link"
                    onClick={() => {
                      setProfileOpen(false);
                      publicService.logActivity?.('BTN_NAV_CLICK', { label: 'คลังข้อสอบส่วนตัว', path: '/profile/questions' });
                    }}
                  >
                    <span className="hn-icon-badge" style={{ background: 'rgba(56,189,248,0.2)', border: '1px solid rgba(56,189,248,0.45)', color: '#7dd3fc' }}>
                      <FolderKanban size={15} strokeWidth={2.3} />
                    </span>
                    <span>คลังข้อสอบส่วนตัว</span>
                  </Link>

                  <Link
                    to="/profile/settings"
                    className="hn-drop-link"
                    onClick={() => {
                      setProfileOpen(false);
                      publicService.logActivity?.('BTN_NAV_CLICK', { label: 'ตั้งค่า', path: '/profile/settings' });
                    }}
                  >
                    <span className="hn-icon-badge" style={{ background: 'rgba(52,211,153,0.2)', border: '1px solid rgba(52,211,153,0.45)', color: '#6ee7b7' }}>
                      <Settings size={15} strokeWidth={2.3} />
                    </span>
                    <span>ตั้งค่า</span>
                  </Link>

                  {!user.email?.startsWith('guest_') && (
                    <Link
                      to="/business/content"
                      className="hn-drop-link"
                      onClick={() => {
                        setProfileOpen(false);
                        publicService.logActivity?.('BTN_NAV_CLICK', { label: 'จัดการเพจ', path: '/business/content' });
                      }}
                    >
                      <span className="hn-icon-badge" style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.45)', color: '#fde047' }}>
                        <Building2 size={15} strokeWidth={2.3} />
                      </span>
                      <span>จัดการเพจ</span>
                    </Link>
                  )}

                  <div style={{ margin: '6px 0 4px', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
                  <button
                    type="button"
                    className="hn-drop-link"
                    onClick={handleLogout}
                    style={{ color: '#fda4af' }}
                  >
                    <span className="hn-icon-badge" style={{ background: 'rgba(244,63,94,0.22)', border: '1px solid rgba(244,63,94,0.45)', color: '#fb7185' }}>
                      <LogOut size={15} strokeWidth={2.3} />
                    </span>
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Not logged in: Login + Register pills ── */
            <>
              {isAuthPage ? (
                location.pathname.startsWith('/login') ? (
                  <Link
                    to="/register"
                    className="hn-pill"
                    style={{
                      background: 'linear-gradient(135deg,#fde047,#f59e0b)',
                      color: '#1a0533',
                      boxShadow: '0 6px 22px rgba(245,158,11,0.42)',
                    }}
                  >
                    <span>สมัครสมาชิก</span>
                    <Rocket size={15} strokeWidth={2.5} />
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="hn-pill"
                    style={{
                      background: isLightMode ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.14)',
                      border: isLightMode ? '1.5px solid rgba(70,23,143,0.2)' : '1.5px solid rgba(255,255,255,0.32)',
                      color: isLightMode ? '#46178f' : '#ffffff',
                      backdropFilter: 'blur(14px)',
                    }}
                  >
                    <LogIn size={15} strokeWidth={2.4} />
                    <span>เข้าสู่ระบบ</span>
                  </Link>
                )
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hn-pill"
                    style={{
                      background: isLightMode ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.14)',
                      border: isLightMode ? '1.5px solid rgba(70,23,143,0.2)' : '1.5px solid rgba(255,255,255,0.32)',
                      color: isLightMode ? '#46178f' : '#ffffff',
                      backdropFilter: 'blur(14px)',
                    }}
                  >
                    <LogIn size={15} strokeWidth={2.4} />
                    <span>เข้าสู่ระบบ</span>
                  </Link>
                  <Link
                    to="/register"
                    className="hn-pill"
                    style={{
                      background: 'linear-gradient(135deg,#fde047,#f59e0b)',
                      color: '#1a0533',
                      boxShadow: '0 6px 22px rgba(245,158,11,0.42)',
                    }}
                  >
                    <span>สมัครฟรี</span>
                    <Rocket size={15} strokeWidth={2.5} />
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </nav>
    </>
  );
}
