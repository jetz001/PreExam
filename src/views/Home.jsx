import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  BookOpenCheck,
  Trophy,
  Users,
  Gamepad2,
  Sparkles,
  ArrowRight,
  ChevronRight,
  BookOpen,
  MessageSquare,
  Newspaper,
  Crown,
} from 'lucide-react';
import HomeNavbar from '../components/HomeNavbar';
import BrandLogo from '../components/common/BrandLogo';
import publicService from '../services/publicService';

/* ── Confetti particle ── */
function useConfetti() {
  const [dots, setDots] = useState([]);
  useEffect(() => {
    const colors = ['#ff3366', '#ffcc00', '#00e5ff', '#66ff66', '#ff66ff', '#ff9900'];
    const shapes = ['circle', 'rect', 'triangle'];
    setDots(
      Array.from({ length: 34 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 30,
        size: 8 + Math.random() * 11,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        dur: 4.5 + Math.random() * 5,
        delay: Math.random() * 6,
        swing: (Math.random() - 0.5) * 120,
      }))
    );
  }, []);
  return dots;
}

function HeroBrandEmblem() {
  return (
    <div className="hero-emblem-wrap" aria-hidden="true">
      <div className="hero-emblem-glow" />
      <div className="hero-emblem-shell">
        <BrandLogo showText={false} size="xl" variant="dark" aria-hidden="true" />
      </div>
    </div>
  );
}

const DISCOVERY_LINKS = [
  {
    to: '/learning-center',
    label: 'ศูนย์เรียนรู้',
    sub: 'คลังความรู้และติวเตอร์',
    Icon: BookOpen,
    accent: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.28)',
  },
  {
    to: '/community',
    label: 'ชุมชนติวสอบ',
    sub: 'แลกเปลี่ยนแนวข้อสอบ',
    Icon: MessageSquare,
    accent: '#4ade80',
    glow: 'rgba(74, 222, 128, 0.28)',
  },
  {
    to: '/news',
    label: 'ข่าวสอบราชการ',
    sub: 'อัปเดตเปิดรับสมัคร',
    Icon: Newspaper,
    accent: '#60a5fa',
    glow: 'rgba(96, 165, 250, 0.28)',
  },
  {
    to: '/pricing',
    label: 'แพ็กเกจพรีเมียม',
    sub: 'ปลดล็อกฟีเจอร์พิเศษ',
    Icon: Crown,
    accent: '#f472b6',
    glow: 'rgba(244, 114, 182, 0.28)',
  },
];

const Home = () => {
  const [ready, setReady] = useState(false);
  const [soloHover, setSoloHover] = useState(false);
  const [groupHover, setGroupHover] = useState(false);
  const [arcadeHover, setArcadeHover] = useState(false);
  const dots = useConfetti();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Sarabun:wght@500;600;700;800&display=swap');

        @keyframes blobDrift1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(40px,-30px) scale(1.06); }
          66%      { transform: translate(-20px,20px) scale(0.96); }
        }
        @keyframes blobDrift2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(-50px,40px) scale(1.08); }
          70%      { transform: translate(30px,-20px) scale(0.94); }
        }
        @keyframes blobDrift3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(20px,50px) scale(1.1); }
        }
        @keyframes fall {
          0%   { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg) translateX(var(--swing)); opacity: 0; }
        }
        @keyframes titlePop {
          0%   { transform: scale(0.6) rotate(-4deg); opacity: 0; }
          70%  { transform: scale(1.06) rotate(1deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes subtitleFade {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes btnSlide {
          from { opacity:0; transform:translateY(28px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes emblemFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-7px) rotate(1.5deg); }
        }
        @keyframes emblemGlowPulse {
          0%, 100% { opacity: 0.55; transform: scale(0.96); }
          50%      { opacity: 0.9; transform: scale(1.08); }
        }
        @keyframes iconPop {
          0%   { transform: rotate(0deg) scale(1); }
          35%  { transform: rotate(-8deg) scale(1.08); }
          70%  { transform: rotate(6deg) scale(1.06); }
          100% { transform: rotate(0deg) scale(1); }
        }

        .hero-emblem-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          animation: titlePop 0.65s 0.05s cubic-bezier(.34,1.56,.64,1) both;
        }
        .hero-emblem-glow {
          position: absolute;
          inset: -12px;
          border-radius: 30px;
          background: radial-gradient(circle, rgba(253, 224, 71, 0.35) 0%, rgba(168, 85, 247, 0.25) 45%, transparent 72%);
          filter: blur(12px);
          animation: emblemGlowPulse 3.6s ease-in-out infinite;
          pointer-events: none;
        }
        .hero-emblem-shell {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          border-radius: 26px;
          background: linear-gradient(145deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06));
          border: 1.5px solid rgba(255,255,255,0.32);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 18px 40px rgba(15, 5, 36, 0.38), inset 0 1px 1px rgba(255,255,255,0.45);
          animation: emblemFloat 4.2s ease-in-out infinite;
        }

        .mode-card-base {
          display: flex;
          align-items: stretch;
          border-radius: 22px;
          overflow: hidden;
          text-decoration: none;
          border: 2px solid rgba(255,255,255,0.22);
          transition: transform 0.2s cubic-bezier(.34,1.6,.64,1), box-shadow 0.2s ease, border-color 0.2s ease;
          cursor: pointer;
        }
        .mode-card-base:focus-visible {
          outline: none;
          box-shadow: 0 0 0 4px rgba(253,224,71,0.85) !important;
        }

        .btn-solo {
          animation: btnSlide 0.55s 0.45s both;
        }
        .btn-solo:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 24px 60px rgba(244, 63, 94, 0.58) !important;
          border-color: rgba(255,255,255,0.42);
        }
        .btn-solo:active { transform: scale(0.98); }

        .btn-group {
          animation: btnSlide 0.55s 0.6s both;
        }
        .btn-group:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 24px 60px rgba(6, 182, 212, 0.52) !important;
          border-color: rgba(255,255,255,0.42);
        }
        .btn-group:active { transform: scale(0.98); }

        .btn-arcade {
          animation: btnSlide 0.55s 0.75s both;
        }
        .btn-arcade:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 24px 60px rgba(245, 158, 11, 0.52) !important;
          border-color: rgba(255,255,255,0.45);
        }
        .btn-arcade:active { transform: scale(0.98); }

        .mode-icon-3d {
          position: relative;
          width: 62px;
          height: 62px;
          border-radius: 18px;
          background: linear-gradient(145deg, rgba(255,255,255,0.28), rgba(255,255,255,0.1));
          border: 1.5px solid rgba(255,255,255,0.36);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #fff;
          box-shadow: 0 10px 24px rgba(0,0,0,0.22), inset 0 1px 1px rgba(255,255,255,0.5);
          transition: transform 0.25s cubic-bezier(.34,1.6,.64,1);
        }
        .mode-card-base:hover .mode-icon-3d {
          animation: iconPop 0.48s ease;
        }
        .mode-sub-badge {
          position: absolute;
          bottom: -5px;
          right: -5px;
          width: 24px;
          height: 24px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid rgba(255,255,255,0.55);
          box-shadow: 0 4px 10px rgba(0,0,0,0.28);
        }

        .discovery-bar {
          animation: btnSlide 0.55s 0.9s both;
        }
      `}</style>

      {/* ROOT */}
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at top center, #5b21b6 0%, #46178f 55%, #2e0f63 100%)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Sarabun', 'Nunito', sans-serif",
          padding: '28px 16px 40px',
        }}
      >
        <HomeNavbar />

        {/* ── Ambient Blobs ── */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              top: '-18%',
              left: '-12%',
              width: '65vw',
              height: '65vw',
              maxWidth: 700,
              maxHeight: 700,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 40%, #8b2fc9 0%, #6b21a8 60%, transparent 100%)',
              animation: 'blobDrift1 14s ease-in-out infinite',
              willChange: 'transform',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-20%',
              right: '-10%',
              width: '70vw',
              height: '70vw',
              maxWidth: 750,
              maxHeight: 750,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 60% 60%, #7c3aed 0%, #5b21b6 55%, transparent 100%)',
              animation: 'blobDrift2 17s ease-in-out infinite',
              willChange: 'transform',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '30%',
              right: '5%',
              width: '40vw',
              height: '40vw',
              maxWidth: 450,
              maxHeight: 450,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 50% 50%, #9333ea 0%, #7e22ce 50%, transparent 100%)',
              animation: 'blobDrift3 11s ease-in-out infinite',
              willChange: 'transform',
            }}
          />
        </div>

        {/* ── Confetti ── */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {dots.map((d) => (
            <div
              key={d.id}
              style={{
                position: 'absolute',
                left: `${d.x}%`,
                top: `${d.y}%`,
                width: d.size,
                height: d.size,
                background: d.shape !== 'triangle' ? d.color : 'transparent',
                borderRadius: d.shape === 'circle' ? '50%' : d.shape === 'rect' ? '3px' : 0,
                borderLeft: d.shape === 'triangle' ? `${d.size / 2}px solid transparent` : undefined,
                borderRight: d.shape === 'triangle' ? `${d.size / 2}px solid transparent` : undefined,
                borderBottom: d.shape === 'triangle' ? `${d.size}px solid ${d.color}` : undefined,
                '--swing': `${d.swing}px`,
                animation: `fall ${d.dur}s ${d.delay}s ease-in infinite`,
                willChange: 'transform, opacity',
                opacity: 0.78,
              }}
            />
          ))}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: 540,
            opacity: ready ? 1 : 0,
            transition: 'opacity 0.3s',
            paddingTop: 68,
          }}
        >
          {/* HERO LOGO & SUBTITLE */}
          <div style={{ textAlign: 'center', marginBottom: 34 }}>
            <HeroBrandEmblem />

            <h1
              style={{
                fontSize: 'clamp(2.9rem, 9.5vw, 4.75rem)',
                fontWeight: 900,
                fontFamily: "'Nunito', 'Sarabun', sans-serif",
                color: '#fff',
                letterSpacing: '-2px',
                lineHeight: 1,
                margin: 0,
                animation: 'titlePop 0.7s 0.1s cubic-bezier(.34,1.56,.64,1) both',
                textShadow: '0 6px 28px rgba(0,0,0,0.34), 0 0 60px rgba(255,255,255,0.16)',
              }}
            >
              PreExam
              <span
                style={{
                  color: '#fde047',
                  display: 'inline-block',
                  animation: 'titlePop 0.7s 0.2s cubic-bezier(.34,1.56,.64,1) both',
                }}
              >
                !
              </span>
            </h1>

            <div
              style={{
                marginTop: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 16px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.22)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: 'rgba(255,255,255,0.92)',
                fontSize: 'clamp(0.92rem, 2.8vw, 1.05rem)',
                fontWeight: 700,
                letterSpacing: 0.2,
                animation: 'subtitleFade 0.5s 0.38s both',
              }}
            >
              <Gamepad2 size={18} className="text-amber-300" />
              <span>เลือกโหมดแล้วลุยเลย!</span>
              <Sparkles size={15} className="text-fuchsia-300" />
            </div>
          </div>

          {/* 3 MAIN MODE CARDS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* ── Solo ── */}
            <Link
              to="/exam"
              id="btn-solo-exam"
              className="mode-card-base btn-solo"
              onClick={() => publicService.logActivity('BTN_HOME_SOLO', { label: 'สอบเดี่ยว' })}
              onMouseEnter={() => setSoloHover(true)}
              onMouseLeave={() => setSoloHover(false)}
              style={{
                boxShadow: '0 14px 40px rgba(244, 63, 94, 0.42)',
              }}
            >
              <div
                style={{
                  width: 10,
                  flexShrink: 0,
                  background: 'linear-gradient(180deg, #fda4af, #e11d48)',
                }}
              />
              <div
                style={{
                  flex: 1,
                  background: soloHover
                    ? 'linear-gradient(135deg, #fb7185 0%, #e11d48 52%, #be123c 100%)'
                    : 'linear-gradient(135deg, #f43f5e 0%, #e11d48 55%, #9f1239 100%)',
                  padding: '20px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="mode-icon-3d">
                    <FileCheck2 size={28} strokeWidth={2.2} />
                    <span
                      className="mode-sub-badge"
                      style={{ background: 'linear-gradient(135deg, #fb7185, #be123c)' }}
                    >
                      <BookOpenCheck size={12} strokeWidth={2.5} />
                    </span>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '1.45rem',
                        fontWeight: 900,
                        color: '#fff',
                        lineHeight: 1.15,
                        fontFamily: "'Nunito','Sarabun',sans-serif",
                      }}
                    >
                      สอบเดี่ยว
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: 600 }}>
                      Solo · ซ้อมทำข้อสอบคนเดียวพร้อมเฉลยละเอียด
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0,
                    transform: soloHover ? 'translateX(4px)' : 'translateX(0)',
                    transition: 'transform 0.2s cubic-bezier(.34,1.6,.64,1)',
                  }}
                >
                  <ArrowRight size={20} strokeWidth={2.6} />
                </div>
              </div>
            </Link>

            {/* ── Group ── */}
            <Link
              to="/lobby"
              id="btn-group-exam"
              className="mode-card-base btn-group"
              onClick={() => publicService.logActivity('BTN_HOME_LOBBY', { label: 'สอบกลุ่ม' })}
              onMouseEnter={() => setGroupHover(true)}
              onMouseLeave={() => setGroupHover(false)}
              style={{
                boxShadow: '0 14px 40px rgba(6, 182, 212, 0.36)',
              }}
            >
              <div
                style={{
                  width: 10,
                  flexShrink: 0,
                  background: 'linear-gradient(180deg, #67e8f9, #0284c7)',
                }}
              />
              <div
                style={{
                  flex: 1,
                  background: groupHover
                    ? 'linear-gradient(135deg, #22d3ee 0%, #0284c7 55%, #0369a1 100%)'
                    : 'linear-gradient(135deg, #06b6d4 0%, #0284c7 58%, #075985 100%)',
                  padding: '20px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="mode-icon-3d">
                    <Trophy size={28} strokeWidth={2.2} />
                    <span
                      className="mode-sub-badge"
                      style={{ background: 'linear-gradient(135deg, #38bdf8, #0369a1)' }}
                    >
                      <Users size={12} strokeWidth={2.5} />
                    </span>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '1.45rem',
                        fontWeight: 900,
                        color: '#fff',
                        lineHeight: 1.15,
                        fontFamily: "'Nunito','Sarabun',sans-serif",
                      }}
                    >
                      สอบกลุ่ม
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: 600 }}>
                      Lobby · แข่งขันแบบเรียลไทม์พร้อมเพื่อน
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0,
                    transform: groupHover ? 'translateX(4px)' : 'translateX(0)',
                    transition: 'transform 0.2s cubic-bezier(.34,1.6,.64,1)',
                  }}
                >
                  <ArrowRight size={20} strokeWidth={2.6} />
                </div>
              </div>
            </Link>

            {/* ── Arcade ── */}
            <Link
              id="btn-arcade"
              to="/arcade"
              className="mode-card-base btn-arcade"
              onMouseEnter={() => setArcadeHover(true)}
              onMouseLeave={() => setArcadeHover(false)}
              style={{
                boxShadow: '0 14px 40px rgba(245, 158, 11, 0.36)',
              }}
            >
              <div
                style={{
                  width: 10,
                  flexShrink: 0,
                  background: 'linear-gradient(180deg, #fde047, #ea580c)',
                }}
              />
              <div
                style={{
                  flex: 1,
                  background: arcadeHover
                    ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 48%, #ea580c 100%)'
                    : 'linear-gradient(135deg, #f59e0b 0%, #ea580c 60%, #c2410c 100%)',
                  padding: '20px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="mode-icon-3d">
                    <Gamepad2 size={28} strokeWidth={2.2} />
                    <span
                      className="mode-sub-badge"
                      style={{ background: 'linear-gradient(135deg, #fbbf24, #c2410c)' }}
                    >
                      <Sparkles size={12} strokeWidth={2.5} />
                    </span>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '1.45rem',
                        fontWeight: 900,
                        color: '#fff',
                        lineHeight: 1.15,
                        textShadow: '0 1px 6px rgba(124,45,18,0.35)',
                        fontFamily: "'Nunito','Sarabun',sans-serif",
                      }}
                    >
                      อาเขต
                    </div>
                    <div
                      style={{
                        fontSize: '0.84rem',
                        color: 'rgba(255,255,255,0.9)',
                        marginTop: 4,
                        fontWeight: 600,
                        textShadow: '0 1px 4px rgba(124,45,18,0.28)',
                      }}
                    >
                      Arcade · มินิเกมทบทวนความรู้สุดสนุก
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.22)',
                    border: '1px solid rgba(255,255,255,0.34)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0,
                    transform: arcadeHover ? 'translateX(4px)' : 'translateX(0)',
                    transition: 'transform 0.2s cubic-bezier(.34,1.6,.64,1)',
                  }}
                >
                  <ArrowRight size={20} strokeWidth={2.6} />
                </div>
              </div>
            </Link>
          </div>

          {/* ── QUICK DISCOVERY / FEATURE HIGHLIGHTS BAR ── */}
          <div className="discovery-bar mt-6 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl shadow-[0_12px_36px_rgba(12,4,34,0.32)]">
            <div className="mb-2.5 flex items-center justify-between px-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-white/75">
                <Sparkles size={13} className="text-amber-300" />
                สำรวจฟีเจอร์เพิ่มเติม
              </span>
              <span className="text-[11px] font-semibold text-white/55">PreExam Ecosystem</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DISCOVERY_LINKS.map(({ to, label, sub, Icon, accent, glow }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => publicService.logActivity?.('BTN_HOME_DISCOVERY', { label, path: to })}
                  className="group flex flex-col justify-between rounded-xl border border-white/15 bg-white/10 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/25 transition-transform duration-200 group-hover:scale-110"
                      style={{
                        background: glow,
                        color: accent,
                        boxShadow: `0 4px 12px ${glow}`,
                      }}
                    >
                      <Icon size={16} strokeWidth={2.3} />
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-white/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white"
                    />
                  </div>
                  <div className="mt-2.5">
                    <div className="text-xs font-extrabold text-white leading-snug">{label}</div>
                    <div className="mt-0.5 text-[11px] font-medium text-white/70 leading-tight line-clamp-1">
                      {sub}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
