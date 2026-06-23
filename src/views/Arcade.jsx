import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';
import api from '../services/api';
import AdaptiveLottie from '../components/common/AdaptiveLottie';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
/* ─────────────────────────────────────────────
   Arcade Selection Page - Dedicated Route
───────────────────────────────────────────── */

export default function Arcade() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode');
    
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [playingGame, setPlayingGame] = useState(null);

    useEffect(() => {
        if (mode) {
            fetchGames(mode);
        }
    }, [mode]);

    const fetchGames = async (gameMode) => {
        setLoading(true);
        try {
            const res = await api.get(`/arcade?mode=${gameMode}`);
            if (res.data.success) {
                setGames(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch arcade games:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderLobby = () => (
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
        </div>
    );

    const renderGameList = () => (
        <div className="w-full max-w-5xl mx-auto z-10 p-4" style={{ animation: 'ecSlideUp 0.5s ease both' }}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-4xl font-black text-white drop-shadow-md">
                        {mode === 'solo' ? '👤 โหมดเล่นคนเดียว' : '👥 โหมดเล่นหลายคน'}
                    </h2>
                    <p className="text-white/80 mt-2 font-bold text-lg">เลือกเกมที่คุณต้องการเล่นได้เลย</p>
                </div>
                <button 
                    onClick={() => navigate('/arcade')}
                    className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-bold backdrop-blur-sm transition-all"
                >
                    &larr; กลับไปเลือกโหมด
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-white text-xl font-bold">กำลังโหลดมินิเกม...</div>
            ) : games.length === 0 ? (
                <div className="text-center py-20 bg-black/20 rounded-3xl backdrop-blur-sm">
                    <div className="text-6xl mb-4">🎮</div>
                    <h3 className="text-2xl font-bold text-white mb-2">ยังไม่มีเกมในโหมดนี้</h3>
                    <p className="text-white/70">กำลังอัปเดตมินิเกมใหม่ๆ เร็วๆ นี้ รอติดตามได้เลย!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {games.map(game => (
                        <div key={game.id} className="bg-white rounded-3xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300 flex flex-col">
                            <div className="h-48 w-full bg-gray-200 relative">
                                {game.thumbnail_url ? (
                                    game.thumbnail_url.includes('.lottie') ? (
                                        <div className="w-full h-full flex items-center justify-center bg-[#1a1740]">
                                            <DotLottieReact src={game.thumbnail_url} loop autoplay />
                                        </div>
                                    ) : game.thumbnail_url.includes('.json') || game.thumbnail_url.includes('lottie') ? (
                                        <div className="w-full h-full flex items-center justify-center bg-[#1a1740]">
                                            <AdaptiveLottie animationUrl={game.thumbnail_url} scale="card" loop={true} autoplay={true} />
                                        </div>
                                    ) : (
                                        <img src={game.thumbnail_url} alt={game.title} className="w-full h-full object-cover" />
                                    )
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-4xl">🎮</div>
                                )}
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-2xl font-black text-gray-800 mb-2">{game.title}</h3>
                                <p className="text-gray-600 mb-6 flex-grow">{game.description}</p>
                                <button 
                                    onClick={() => setPlayingGame(game)}
                                    className="w-full text-center py-3 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-indigo-500/30 transition-all"
                                >
                                    เล่นเกมนี้ &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
    if (playingGame) {
        return (
            <div className="fixed inset-0 z-50 bg-[#1e1b4b] flex flex-col">
                <div className="bg-[#1e1b4b]/80 backdrop-blur-md text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shadow-lg relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl shadow-lg">🎮</div>
                        <div>
                            <h2 className="font-black text-xl leading-tight">{playingGame.title}</h2>
                            <p className="text-white/60 text-sm font-semibold">{playingGame.mode === 'solo' ? 'โหมดเล่นคนเดียว' : 'โหมดเล่นหลายคน'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setPlayingGame(null)}
                        className="bg-white/10 hover:bg-red-500/90 text-white px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                    >
                        <span>&times;</span> ออกจากเกม
                    </button>
                </div>
                <iframe 
                    src={playingGame.game_url} 
                    className="w-full flex-grow border-none"
                    title={playingGame.title}
                />
            </div>
        );
    }

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

                {mode ? renderGameList() : renderLobby()}
                
            </div>
        </>
    );
}
