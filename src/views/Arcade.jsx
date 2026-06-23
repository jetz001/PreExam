import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';

/* ─────────────────────────────────────────────
   Arcade Selection Page - Dedicated Route
───────────────────────────────────────────── */

export default function Arcade() {
    const navigate = useNavigate();

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');

                @keyframes ecBlobDrift {
                    0%,100% { transform:translate(0,0) scale(1); }
                    40%     { transform:translate(30px,-20px) scale(1.06); }
                    70%     { transform:translate(-15px,15px) scale(0.96); }
                }
                @keyframes ecSlideUp {
                    from { opacity:0; transform:translateY(28px) scale(0.97); }
                    to   { opacity:1; transform:translateY(0) scale(1); }
                }
                @keyframes ecBounce {
                    0%,100% { transform:translateY(0) scale(1); }
                    30%     { transform:translateY(-8px) scale(1.04); }
                    60%     { transform:translateY(-3px) scale(1.01); }
                }
                @keyframes ecFloat {
                    0%   { transform:translateY(110vh) rotate(0deg); opacity:0.8; }
                    100% { transform:translateY(-10vh) rotate(720deg); opacity:0; }
                }

                .ec-root {
                    min-height: 100vh;
                    background: #46178f;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 16px 32px;
                    font-family: 'Sarabun','Nunito',sans-serif;
                }
                .ec-card {
                    position: relative; z-index: 10;
                    width: 100%; max-width: 600px;
                    animation: ecSlideUp 0.5s ease both;
                }
                .ec-title {
                    font-family: 'Nunito','Sarabun',sans-serif;
                    font-weight: 900;
                    font-size: clamp(2.2rem,7vw,3.2rem);
                    color: #fff;
                    text-align: center;
                    letter-spacing: -1.5px;
                    margin-bottom: 6px;
                    text-shadow: 0 6px 30px rgba(0,0,0,0.4), 0 0 60px rgba(167,139,250,0.5);
                    animation: ecBounce 2.5s ease-in-out infinite;
                    display: inline-block;
                    width: 100%;
                }
                .ec-sub {
                    text-align: center;
                    color: rgba(255,255,255,0.65);
                    font-size: 1rem;
                    font-weight: 700;
                    margin-bottom: 40px;
                    letter-spacing: 0.3px;
                }
            `}</style>

            <div className="ec-root">
                {/* Floating Transparent Navbar */}
                <HomeNavbar />
                
                {/* Background blobs */}
                <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
                    <div style={{ position:'absolute', top:'-15%', left:'-10%', width:'60vw', height:'60vw', maxWidth:600, maxHeight:600, borderRadius:'50%', background:'radial-gradient(circle at 40% 40%,#8b2fc9 0%,#6b21a8 60%,transparent 100%)', animation:'ecBlobDrift 14s ease-in-out infinite', willChange: 'transform' }}/>
                    <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'65vw', height:'65vw', maxWidth:660, maxHeight:660, borderRadius:'50%', background:'radial-gradient(circle at 60% 60%,#7c3aed 0%,#5b21b6 55%,transparent 100%)', animation:'ecBlobDrift 18s ease-in-out infinite reverse', willChange: 'transform' }}/>
                </div>

                {/* Floating dots */}
                {[
                    { left:'8%',  delay:'0s',   dur:'7s',  size:10, color:'#ffcc00' },
                    { left:'20%', delay:'1.5s', dur:'9s',  size:7,  color:'#ff6b8a' },
                    { left:'35%', delay:'0.8s', dur:'6s',  size:12, color:'#22c55e' },
                    { left:'55%', delay:'2.2s', dur:'8s',  size:8,  color:'#00b4d8' },
                    { left:'70%', delay:'0.3s', dur:'10s', size:6,  color:'#fbbf24' },
                    { left:'85%', delay:'1.8s', dur:'7.5s',size:11, color:'#a855f7' },
                    { left:'92%', delay:'0.9s', dur:'8.5s',size:7,  color:'#ff9800' },
                ].map((dot, i) => (
                    <div key={i} style={{
                        position:'absolute', bottom:'-20px', left:dot.left,
                        width:dot.size, height:dot.size, borderRadius:'50%',
                        background:dot.color, pointerEvents:'none',
                        animation:`ecFloat ${dot.dur} ${dot.delay} ease-in infinite`,
                        willChange: 'transform, opacity',
                        opacity:0.75,
                    }}/>
                ))}

                <div className="ec-card">
                    {/* Title */}
                    <div className="ec-title">🕹️ เลือกโหมดอาเขต</div>
                    <div className="ec-sub">Arcade Mode — มินิเกมสนุกๆ รอคุณอยู่!</div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            to="/arcade?mode=solo"
                            className="group flex flex-col items-center justify-center p-8 rounded-3xl text-white relative"
                            style={{ 
                            background: '#10b981', // Emerald green
                            border: '4px solid white',
                            boxShadow: '0 8px 0 #059669, 0 15px 20px rgba(0,0,0,0.2)',
                            textDecoration: 'none',
                            transition: 'all 0.1s'
                            }}
                            onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(8px)'; e.currentTarget.style.boxShadow = '0 0px 0 #059669, 0 5px 10px rgba(0,0,0,0.2)'; }}
                            onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 8px 0 #059669, 0 15px 20px rgba(0,0,0,0.2)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 8px 0 #059669, 0 15px 20px rgba(0,0,0,0.2)'; }}
                        >
                            <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">👤</div>
                            <div className="font-black text-2xl mb-2 text-center">เล่นคนเดียว</div>
                            <div className="text-white/90 text-base font-bold text-center">ตะลุยเดี่ยว ฝึกสกิล</div>
                        </Link>

                        <Link 
                            to="/arcade?mode=multi"
                            className="group flex flex-col items-center justify-center p-8 rounded-3xl text-white relative"
                            style={{ 
                            background: '#f59e0b', // Amber orange
                            border: '4px solid white',
                            boxShadow: '0 8px 0 #d97706, 0 15px 20px rgba(0,0,0,0.2)',
                            textDecoration: 'none',
                            transition: 'all 0.1s'
                            }}
                            onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(8px)'; e.currentTarget.style.boxShadow = '0 0px 0 #d97706, 0 5px 10px rgba(0,0,0,0.2)'; }}
                            onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 8px 0 #d97706, 0 15px 20px rgba(0,0,0,0.2)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 8px 0 #d97706, 0 15px 20px rgba(0,0,0,0.2)'; }}
                        >
                            <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">👥</div>
                            <div className="font-black text-2xl mb-2 text-center">เล่นหลายคน</div>
                            <div className="text-white/90 text-base font-bold text-center">แข่งกับเพื่อน สนุกกว่า!</div>
                        </Link>
                    </div>

                    <div style={{ marginTop:40, textAlign:'center' }}>
                        <button 
                            onClick={() => navigate('/')}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '2px solid rgba(255,255,255,0.2)',
                                color: '#fff',
                                padding: '10px 24px',
                                borderRadius: '100px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            }}
                        >
                            กลับหน้าหลัก
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
