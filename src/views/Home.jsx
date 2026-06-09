import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';
import publicService from '../services/publicService';

/* ── Confetti particle ── */
function useConfetti() {
  const [dots, setDots] = useState([]);
  useEffect(() => {
    const colors = ['#ff3366', '#ffcc00', '#00e5ff', '#66ff66', '#ff66ff', '#ff9900'];
    const shapes = ['circle', 'rect', 'triangle'];
    setDots(
      Array.from({ length: 38 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 30,
        size: 8 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        dur: 4 + Math.random() * 5,
        delay: Math.random() * 6,
        swing: (Math.random() - 0.5) * 120,
        rot: Math.random() * 360,
      }))
    );
  }, []);
  return dots;
}

const Home = () => {
  const [ready, setReady] = useState(false);
  const [soloHover, setSoloHover] = useState(false);
  const [groupHover, setGroupHover] = useState(false);
  const dots = useConfetti();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Sarabun:wght@600;700;800&display=swap');

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
          0%   { transform: scale(0.5) rotate(-6deg); opacity: 0; }
          70%  { transform: scale(1.08) rotate(1deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes subtitleFade {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes btnSlide {
          from { opacity:0; transform:translateY(30px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes wiggle {
          0%,100% { transform:rotate(0deg); }
          25%      { transform:rotate(-8deg); }
          75%      { transform:rotate(8deg); }
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.35); }
          50%      { box-shadow: 0 0 0 18px rgba(255,255,255,0); }
        }

        .btn-solo {
          animation: btnSlide 0.55s 0.55s both;
          transition: transform 0.18s cubic-bezier(.34,1.6,.64,1), box-shadow 0.18s ease;
          cursor: pointer;
        }
        .btn-solo:hover {
          transform: translateY(-6px) scale(1.03) !important;
          box-shadow: 0 24px 64px rgba(255,51,102,0.65) !important;
        }
        .btn-solo:active { transform: scale(0.97) !important; }

        .btn-group {
          animation: btnSlide 0.55s 0.75s both;
          transition: transform 0.18s cubic-bezier(.34,1.6,.64,1), box-shadow 0.18s ease;
          cursor: pointer;
        }
        .btn-group:hover {
          transform: translateY(-6px) scale(1.03) !important;
          box-shadow: 0 24px 64px rgba(0,200,255,0.55) !important;
        }
        .btn-group:active { transform: scale(0.97) !important; }

        .emoji-icon {
          display:inline-block;
          transition: transform 0.2s;
        }
        .btn-solo:hover  .emoji-icon { animation: wiggle 0.4s ease; }
        .btn-group:hover .emoji-icon { animation: wiggle 0.4s ease; }
      `}</style>

      {/* ROOT */}
      <div style={{
        minHeight: '100vh',
        background: '#46178f',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Sarabun', 'Nunito', sans-serif",
        padding: '24px 16px',
      }}>
        <HomeNavbar />

        {/* ── Kahoot-style smooth blobs ── */}
        <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
          {/* top-left blob */}
          <div style={{
            position:'absolute', top:'-18%', left:'-12%',
            width:'65vw', height:'65vw', maxWidth:700, maxHeight:700,
            borderRadius:'50%',
            background:'radial-gradient(circle at 40% 40%, #8b2fc9 0%, #6b21a8 60%, transparent 100%)',
            animation:'blobDrift1 14s ease-in-out infinite',
            willChange: 'transform'
          }}/>
          {/* bottom-right blob */}
          <div style={{
            position:'absolute', bottom:'-20%', right:'-10%',
            width:'70vw', height:'70vw', maxWidth:750, maxHeight:750,
            borderRadius:'50%',
            background:'radial-gradient(circle at 60% 60%, #7c3aed 0%, #5b21b6 55%, transparent 100%)',
            animation:'blobDrift2 17s ease-in-out infinite',
            willChange: 'transform'
          }}/>
          {/* center accent */}
          <div style={{
            position:'absolute', top:'30%', right:'5%',
            width:'40vw', height:'40vw', maxWidth:450, maxHeight:450,
            borderRadius:'50%',
            background:'radial-gradient(circle at 50% 50%, #9333ea 0%, #7e22ce 50%, transparent 100%)',
            animation:'blobDrift3 11s ease-in-out infinite',
            willChange: 'transform'
          }}/>
        </div>

        {/* ── Confetti ── */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
          {dots.map(d => (
            <div key={d.id} style={{
              position:'absolute',
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.size,
              height: d.size,
              background: d.shape !== 'triangle' ? d.color : 'transparent',
              borderRadius: d.shape === 'circle' ? '50%' : d.shape === 'rect' ? '3px' : 0,
              borderLeft: d.shape === 'triangle' ? `${d.size/2}px solid transparent` : undefined,
              borderRight: d.shape === 'triangle' ? `${d.size/2}px solid transparent` : undefined,
              borderBottom: d.shape === 'triangle' ? `${d.size}px solid ${d.color}` : undefined,
              '--swing': `${d.swing}px`,
              animation: `fall ${d.dur}s ${d.delay}s ease-in infinite`,
              willChange: 'transform, opacity',
              opacity: 0.82,
            }}/>
          ))}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{
          position:'relative', zIndex:10,
          width:'100%', maxWidth:460,
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.3s',
          paddingTop: 80,
        }}>

          {/* LOGO */}
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <div style={{ fontSize:'clamp(3rem,10vw,5rem)', fontWeight:900,
              fontFamily:"'Nunito', sans-serif",
              color:'#fff',
              letterSpacing:'-2px',
              lineHeight:1,
              animation:'titlePop 0.7s 0.1s cubic-bezier(.34,1.56,.64,1) both',
              textShadow:'0 4px 24px rgba(0,0,0,0.3), 0 0 60px rgba(255,255,255,0.15)',
            }}>
              PreExam<span style={{ color:'#ffcc00', display:'inline-block',
                animation:'titlePop 0.7s 0.2s cubic-bezier(.34,1.56,.64,1) both' }}>!</span>
            </div>
            <div style={{
              marginTop:12, color:'rgba(255,255,255,0.82)',
              fontSize:'clamp(1rem,3vw,1.15rem)', fontWeight:700,
              letterSpacing:0.5,
              animation:'subtitleFade 0.5s 0.5s both',
            }}>
              🎮 &nbsp;เลือกโหมดแล้วลุยเลย!
            </div>
          </div>

          {/* BUTTONS */}
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

            {/* ── Solo ── */}
            <Link
              to="/exam"
              id="btn-solo-exam"
              className="btn-solo"
              onClick={() => publicService.logActivity('BTN_HOME_SOLO', { label: 'สอบเดี่ยว' })}
              onMouseEnter={() => setSoloHover(true)}
              onMouseLeave={() => setSoloHover(false)}
              style={{
                display:'flex', alignItems:'stretch',
                borderRadius:18,
                overflow:'hidden',
                textDecoration:'none',
                boxShadow:'0 10px 40px rgba(255,51,102,0.45)',
                border:'3px solid rgba(255,255,255,0.15)',
              }}
            >
              {/* color tab */}
              <div style={{
                width:10, flexShrink:0,
                background:'linear-gradient(180deg,#ff6b9d,#cc0044)',
              }}/>
              {/* body */}
              <div style={{
                flex:1,
                background: soloHover
                  ? 'linear-gradient(135deg,#ff3d6e 0%,#e91e63 100%)'
                  : 'linear-gradient(135deg,#ff1f5a 0%,#cc0040 100%)',
                padding:'22px 24px',
                display:'flex', alignItems:'center', justifyContent:'space-between',
                transition:'background 0.2s',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:18 }}>
                  <div style={{
                    width:58, height:58, borderRadius:16,
                    background:'rgba(255,255,255,0.18)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:32, flexShrink:0,
                    boxShadow:'inset 0 1px 0 rgba(255,255,255,0.3)',
                  }}>
                    <span className="emoji-icon">📝</span>
                  </div>
                  <div>
                    <div style={{ fontSize:'1.5rem', fontWeight:900, color:'#fff', lineHeight:1.1,
                      fontFamily:"'Nunito','Sarabun',sans-serif" }}>
                      สอบเดี่ยว
                    </div>
                    <div style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.75)', marginTop:4, fontWeight:600 }}>
                      Solo · ทำคนเดียว
                    </div>
                  </div>
                </div>
                <div style={{
                  width:36, height:36, borderRadius:12,
                  background:'rgba(255,255,255,0.2)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.2rem', color:'#fff', fontWeight:900,
                  transform: soloHover ? 'translateX(4px)' : 'translateX(0)',
                  transition:'transform 0.2s cubic-bezier(.34,1.6,.64,1)',
                }}>
                  ▶
                </div>
              </div>
            </Link>

            {/* ── Group ── */}
            <Link
              to="/lobby"
              id="btn-group-exam"
              className="btn-group"
              onClick={() => publicService.logActivity('BTN_HOME_LOBBY', { label: 'สอบกลุ่ม' })}
              onMouseEnter={() => setGroupHover(true)}
              onMouseLeave={() => setGroupHover(false)}
              style={{
                display:'flex', alignItems:'stretch',
                borderRadius:18,
                overflow:'hidden',
                textDecoration:'none',
                boxShadow:'0 10px 40px rgba(0,200,255,0.38)',
                border:'3px solid rgba(255,255,255,0.15)',
              }}
            >
              {/* color tab */}
              <div style={{
                width:10, flexShrink:0,
                background:'linear-gradient(180deg,#33ddff,#0077aa)',
              }}/>
              {/* body */}
              <div style={{
                flex:1,
                background: groupHover
                  ? 'linear-gradient(135deg,#00c6f0 0%,#0098cc 100%)'
                  : 'linear-gradient(135deg,#00b4d8 0%,#0077a8 100%)',
                padding:'22px 24px',
                display:'flex', alignItems:'center', justifyContent:'space-between',
                transition:'background 0.2s',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:18 }}>
                  <div style={{
                    width:58, height:58, borderRadius:16,
                    background:'rgba(255,255,255,0.18)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:32, flexShrink:0,
                    boxShadow:'inset 0 1px 0 rgba(255,255,255,0.3)',
                  }}>
                    <span className="emoji-icon">🏆</span>
                  </div>
                  <div>
                    <div style={{ fontSize:'1.5rem', fontWeight:900, color:'#fff', lineHeight:1.1,
                      fontFamily:"'Nunito','Sarabun',sans-serif" }}>
                      สอบกลุ่ม
                    </div>
                    <div style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.75)', marginTop:4, fontWeight:600 }}>
                      Lobby · เข้าร่วมห้องพร้อมกัน
                    </div>
                  </div>
                </div>
                <div style={{
                  width:36, height:36, borderRadius:12,
                  background:'rgba(255,255,255,0.2)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.2rem', color:'#fff', fontWeight:900,
                  transform: groupHover ? 'translateX(4px)' : 'translateX(0)',
                  transition:'transform 0.2s cubic-bezier(.34,1.6,.64,1)',
                }}>
                  ▶
                </div>
              </div>
            </Link>

          </div>{/* /buttons */}

        </div>

      </div>
    </>
  );
};

export default Home;
