import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Gamepad2,
    User,
    Users,
    ArrowLeft,
    Trophy,
    Play,
    X,
    Crown,
    Medal,
    Award,
    Loader2,
    Sparkles
} from 'lucide-react';
import HomeNavbar from '../components/HomeNavbar';
import api from '../services/api';
import AdaptiveLottie from '../components/common/AdaptiveLottie';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import ArcadeChat from '../components/ArcadeChat';
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
    const [leaderboardGame, setLeaderboardGame] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

    useEffect(() => {
        const handleMessage = async (event) => {
            if (event.data && event.data.type === 'GAME_OVER' && event.data.score !== undefined) {
                if (playingGame) {
                    try {
                        await api.post('/arcade/score', {
                            game_id: playingGame.id,
                            score: event.data.score
                        });
                    } catch (err) {
                        console.error('Failed to save score:', err);
                    }
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [playingGame]);

    useEffect(() => {
        if (!leaderboardGame) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') setLeaderboardGame(null);
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [leaderboardGame]);

    const fetchLeaderboard = async (game) => {
        setLeaderboardGame(game);
        setLoadingLeaderboard(true);
        try {
            const res = await api.get(`/arcade/${game.id}/leaderboard`);
            if (res.data.success) {
                setLeaderboardData(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err);
        } finally {
            setLoadingLeaderboard(false);
        }
    };

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
            <div className="flex justify-center mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/15 backdrop-blur-xl border border-white/30 shadow-[0_12px_36px_rgba(0,0,0,0.35)] flex items-center justify-center">
                    <Gamepad2 className="w-9 h-9 sm:w-11 sm:h-11 text-amber-300" strokeWidth={2.2} />
                </div>
            </div>
            {/* Title */}
            <h1 className="ec-title">เลือกโหมดอาเขต</h1>
            <p className="ec-sub flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Arcade Mode — มินิเกมสนุกๆ รอคุณอยู่!</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                <Link
                    to="/arcade?mode=solo"
                    className="group flex flex-col items-center justify-center p-7 sm:p-8 rounded-3xl text-white relative border-2 border-white/35 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_8px_0_#047857,0_18px_32px_rgba(0,0,0,0.28)] hover:-translate-y-1 active:translate-y-2 active:shadow-[0_0_0_#047857] transition-all duration-150 no-underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
                >
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform">
                        <User className="w-9 h-9 sm:w-10 sm:h-10 text-white" strokeWidth={2.4} />
                    </div>
                    <div className="font-black text-2xl mb-1.5 text-center">เล่นคนเดียว</div>
                    <div className="text-white/90 text-sm sm:text-base font-bold text-center">ตะลุยเดี่ยว ฝึกสกิล</div>
                </Link>

                <Link
                    to="/arcade?mode=multi"
                    className="group flex flex-col items-center justify-center p-7 sm:p-8 rounded-3xl text-white relative border-2 border-white/35 bg-gradient-to-br from-amber-500 to-orange-600 shadow-[0_8px_0_#b45309,0_18px_32px_rgba(0,0,0,0.28)] hover:-translate-y-1 active:translate-y-2 active:shadow-[0_0_0_#b45309] transition-all duration-150 no-underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
                >
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform">
                        <Users className="w-9 h-9 sm:w-10 sm:h-10 text-white" strokeWidth={2.4} />
                    </div>
                    <div className="font-black text-2xl mb-1.5 text-center">เล่นหลายคน</div>
                    <div className="text-white/90 text-sm sm:text-base font-bold text-center">แข่งกับเพื่อน สนุกกว่า!</div>
                </Link>
            </div>
        </div>
    );

    const renderGameList = () => (
        <div className="w-full max-w-5xl mx-auto z-10 px-3 sm:px-6 py-4" style={{ animation: 'ecSlideUp 0.5s ease both' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg shrink-0">
                        {mode === 'solo' ? (
                            <User className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-300" strokeWidth={2.4} />
                        ) : (
                            <Users className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300" strokeWidth={2.4} />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md leading-tight">
                            {mode === 'solo' ? 'โหมดเล่นคนเดียว' : 'โหมดเล่นหลายคน'}
                        </h2>
                        <p className="text-white/85 mt-1 font-bold text-sm sm:text-base">
                            เลือกเกมที่คุณต้องการเล่นได้เลย
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/arcade')}
                    className="self-start sm:self-auto bg-white/15 hover:bg-white/25 text-white px-5 py-2.5 rounded-full font-bold border border-white/25 backdrop-blur-md transition-all inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer shrink-0"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>กลับไปเลือกโหมด</span>
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-white bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-300 mb-3" />
                    <p className="text-lg font-bold">กำลังโหลดมินิเกม...</p>
                </div>
            ) : games.length === 0 ? (
                <div className="text-center py-16 px-6 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-md shadow-xl">
                    <div className="w-18 h-18 rounded-3xl bg-white/15 border border-white/25 flex items-center justify-center mx-auto mb-4">
                        <Gamepad2 className="w-9 h-9 text-amber-300" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">ยังไม่มีเกมในโหมดนี้</h3>
                    <p className="text-white/80 font-medium">กำลังอัปเดตมินิเกมใหม่ๆ เร็วๆ นี้ รอติดตามได้เลย!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {games.map(game => (
                        <div
                            key={game.id}
                            className="bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/50 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                        >
                            <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
                                {game.thumbnail_url ? (
                                    game.thumbnail_url.includes('.lottie') ? (
                                        <div className="w-full h-full flex items-center justify-center bg-[#1a1740]">
                                            <DotLottieReact src={game.thumbnail_url} loop autoplay style={{ width: '100%', height: '100%' }} />
                                        </div>
                                    ) : game.thumbnail_url.includes('.json') || game.thumbnail_url.includes('lottie') ? (
                                        <div className="w-full h-full flex items-center justify-center bg-[#1a1740]">
                                            <AdaptiveLottie animationUrl={game.thumbnail_url} scale="none" loop={true} autoplay={true} />
                                        </div>
                                    ) : (
                                        <img src={game.thumbnail_url} alt={game.title} className="w-full h-full object-cover" />
                                    )
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-indigo-900 to-violet-900 text-amber-300">
                                        <Gamepad2 className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            <div className="p-5 sm:p-6 flex flex-col flex-grow">
                                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 leading-tight">{game.title}</h3>
                                <p className="text-slate-600 text-sm sm:text-base mb-5 flex-grow leading-relaxed">{game.description}</p>
                                <div className="grid grid-cols-2 gap-2.5 w-full mt-auto">
                                    <button
                                        type="button"
                                        onClick={() => fetchLeaderboard(game)}
                                        className="py-2.5 px-3 rounded-xl text-amber-950 font-black text-sm sm:text-base bg-gradient-to-r from-amber-300 to-yellow-400 hover:brightness-105 shadow-md transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
                                    >
                                        <Trophy className="w-4 h-4 shrink-0" />
                                        <span>จัดอันดับ</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPlayingGame(game)}
                                        className="py-2.5 px-3 rounded-xl text-white font-black text-sm sm:text-base bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
                                    >
                                        <Play className="w-4 h-4 fill-current shrink-0" />
                                        <span>เล่นเกมนี้</span>
                                    </button>
                                </div>
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
                <div className="bg-slate-950/80 backdrop-blur-md text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-white/15 shadow-lg relative z-10">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                            <Gamepad2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-black text-base sm:text-xl leading-tight truncate">{playingGame.title}</h2>
                            <p className="text-white/75 text-xs sm:text-sm font-semibold">
                                {playingGame.mode === 'solo' ? 'โหมดเล่นคนเดียว' : 'โหมดเล่นหลายคน'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setPlayingGame(null)}
                        className="bg-white/12 hover:bg-rose-500 text-white px-4 sm:px-5 py-2 rounded-full font-bold text-sm border border-white/20 transition-all flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(239,68,68,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                        <span>ออกจากเกม</span>
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
            {/* Leaderboard Modal */}
            {leaderboardGame && (
                <div
                    className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-3.5 sm:p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="arcade-leaderboard-title"
                >
                    <div className="bg-gradient-to-b from-[#1e1b4b]/95 to-[#151236]/95 backdrop-blur-xl border border-indigo-400/40 rounded-3xl w-full max-w-lg shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[88vh]">
                        <div className="p-5 sm:p-6 border-b border-indigo-400/25 flex justify-between items-center gap-3 bg-indigo-950/50">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shrink-0">
                                    <Trophy className="w-5 h-5" />
                                </span>
                                <div className="min-w-0">
                                    <h3 id="arcade-leaderboard-title" className="text-xl sm:text-2xl font-black text-white leading-tight">
                                        Leaderboard
                                    </h3>
                                    <p className="text-indigo-200 text-xs sm:text-sm mt-0.5 truncate">{leaderboardGame.title}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setLeaderboardGame(null)}
                                aria-label="ปิดอันดับคะแนน"
                                className="text-white/75 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-full w-10 h-10 flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
                            {loadingLeaderboard ? (
                                <div className="flex flex-col items-center justify-center py-10 text-white font-bold">
                                    <Loader2 className="w-8 h-8 animate-spin text-amber-300 mb-2" />
                                    <span>กำลังโหลดข้อมูล...</span>
                                </div>
                            ) : leaderboardData.length === 0 ? (
                                <div className="text-center py-10 text-white/75 font-medium">
                                    ยังไม่มีใครทำคะแนนได้ในเกมนี้ มาเป็นคนแรกกันเถอะ!
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {leaderboardData.map((entry, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border transition-all ${
                                                idx === 0
                                                    ? 'bg-amber-500/20 border-amber-400/50'
                                                    : idx === 1
                                                    ? 'bg-slate-300/15 border-slate-300/35'
                                                    : idx === 2
                                                    ? 'bg-orange-500/20 border-orange-400/40'
                                                    : 'bg-white/8 border-white/10 hover:bg-white/12'
                                            }`}
                                        >
                                            <div
                                                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0 ${
                                                    idx === 0
                                                        ? 'bg-amber-400 text-amber-950'
                                                        : idx === 1
                                                        ? 'bg-slate-200 text-slate-900'
                                                        : idx === 2
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-white/15 text-white'
                                                }`}
                                            >
                                                {idx === 0 ? (
                                                    <Crown className="w-5 h-5" />
                                                ) : idx === 1 ? (
                                                    <Medal className="w-5 h-5" />
                                                ) : idx === 2 ? (
                                                    <Award className="w-5 h-5" />
                                                ) : (
                                                    idx + 1
                                                )}
                                            </div>
                                            <img
                                                src={entry.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + entry.display_name}
                                                alt={entry.display_name || 'Anonymous'}
                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 object-cover shrink-0 border border-white/20"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-white text-base sm:text-lg truncate">
                                                    {entry.display_name || 'Anonymous'}
                                                </div>
                                                <div className="text-white/70 text-xs sm:text-sm">
                                                    {new Date(entry.created_at).toLocaleDateString('th-TH')}
                                                </div>
                                            </div>
                                            <div className="font-black text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-400 shrink-0">
                                                {entry.score.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
                    30%     { transform:translateY(-6px) scale(1.02); }
                    60%     { transform:translateY(-2px) scale(1.01); }
                }
                @keyframes ecFloat {
                    0%   { transform:translateY(110vh) rotate(0deg); opacity:0.8; }
                    100% { transform:translateY(-10vh) rotate(720deg); opacity:0; }
                }

                .ec-root {
                    min-height: 100vh;
                    width: 100%;
                    background: radial-gradient(circle at 20% 15%, #5b21b6 0%, #46178f 48%, #240b4c 100%);
                    position: relative;
                    overflow-x: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 96px 16px 88px;
                    font-family: 'Sarabun','Nunito',sans-serif;
                }
                .ec-card {
                    position: relative; z-index: 10;
                    width: 100%; max-width: 640px;
                    animation: ecSlideUp 0.5s ease both;
                }
                .ec-title {
                    font-family: 'Nunito','Sarabun',sans-serif;
                    font-weight: 900;
                    font-size: clamp(2rem,7vw,3.1rem);
                    color: #fff;
                    text-align: center;
                    letter-spacing: -0.02em;
                    margin-bottom: 8px;
                    text-shadow: 0 6px 30px rgba(0,0,0,0.4), 0 0 50px rgba(167,139,250,0.45);
                    animation: ecBounce 3s ease-in-out infinite;
                    display: block;
                    width: 100%;
                }
                .ec-sub {
                    text-align: center;
                    color: rgba(255,255,255,0.82);
                    font-size: 0.98rem;
                    font-weight: 700;
                    margin-bottom: 34px;
                    letter-spacing: 0.2px;
                }
            `}</style>

            <div className="ec-root">
                {/* Floating Transparent Navbar */}
                <HomeNavbar />

                {/* Background blobs */}
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
                    <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '60vw', height: '60vw', maxWidth: 600, maxHeight: 600, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%,#8b2fc9 0%,#6b21a8 60%,transparent 100%)', animation: 'ecBlobDrift 14s ease-in-out infinite', willChange: 'transform' }} />
                    <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '65vw', height: '65vw', maxWidth: 660, maxHeight: 660, borderRadius: '50%', background: 'radial-gradient(circle at 60% 60%,#7c3aed 0%,#5b21b6 55%,transparent 100%)', animation: 'ecBlobDrift 18s ease-in-out infinite reverse', willChange: 'transform' }} />
                </div>

                {/* Floating dots */}
                {[
                    { left: '8%', delay: '0s', dur: '7s', size: 10, color: '#ffcc00' },
                    { left: '20%', delay: '1.5s', dur: '9s', size: 7, color: '#ff6b8a' },
                    { left: '35%', delay: '0.8s', dur: '6s', size: 12, color: '#22c55e' },
                    { left: '55%', delay: '2.2s', dur: '8s', size: 8, color: '#00b4d8' },
                    { left: '70%', delay: '0.3s', dur: '10s', size: 6, color: '#fbbf24' },
                    { left: '85%', delay: '1.8s', dur: '7.5s', size: 11, color: '#a855f7' },
                    { left: '92%', delay: '0.9s', dur: '8.5s', size: 7, color: '#ff9800' },
                ].map((dot, i) => (
                    <div
                        key={i}
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            bottom: '-20px',
                            left: dot.left,
                            width: dot.size,
                            height: dot.size,
                            borderRadius: '50%',
                            background: dot.color,
                            pointerEvents: 'none',
                            animation: `ecFloat ${dot.dur} ${dot.delay} ease-in infinite`,
                            willChange: 'transform, opacity',
                            opacity: 0.75,
                        }}
                    />
                ))}

                {mode ? renderGameList() : renderLobby()}

                <ArcadeChat />
            </div>
        </>
    );
}
