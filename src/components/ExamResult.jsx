import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import DetailedSolution from './exam/DetailedSolution';
import AdSlot from './ads/AdSlot';
import HomeNavbar from './HomeNavbar';
import AdaptiveLottie from './common/AdaptiveLottie';
import publicService from '../services/publicService';
import { resolveAnimationPreset } from '../config/animationRuntime';

const ExamResult = ({ result, onRetry }) => {
    const score = result.score || 0;
    const totalScore = result.total_score || result.total_questions || (result.questions ? result.questions.length : 1);
    const percentage = totalScore > 0 ? (score / totalScore) * 100 : 0;
    const isPassed = percentage >= 60;
    const { data: publicSettingsResponse } = useQuery({
        queryKey: ['publicSystemSettings'],
        queryFn: publicService.getSystemSettings,
        staleTime: 60000
    });
    const runtimeAnimationSettings = publicSettingsResponse?.settings || {};
    const inlineAnimation = resolveAnimationPreset(isPassed ? 'examResultPass' : 'examResultFail', runtimeAnimationSettings);
    const introAnimation = resolveAnimationPreset('examFinish', runtimeAnimationSettings);
    const [showIntroAnimation, setShowIntroAnimation] = React.useState(true);

    React.useEffect(() => {
        setShowIntroAnimation(true);
        const parsedDuration = Number.parseFloat(String(introAnimation.durationText || '').replace(/[^0-9.]/g, ''));
        const introDurationMs = Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration * 1000 : 950;
        const timer = setTimeout(() => setShowIntroAnimation(false), introDurationMs);
        return () => clearTimeout(timer);
    }, [introAnimation.durationText, isPassed, result?.id]);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');

                @keyframes erBlobDrift {
                    0%,100% { transform:translate(0,0) scale(1); }
                    40%     { transform:translate(30px,-20px) scale(1.06); }
                    70%     { transform:translate(-15px,15px) scale(0.96); }
                }
                @keyframes erSlideUp {
                    from { opacity:0; transform:translateY(28px) scale(0.97); }
                    to   { opacity:1; transform:translateY(0) scale(1); }
                }
                @keyframes erBounce {
                    0%,100% { transform:translateY(0) scale(1); }
                    30%     { transform:translateY(-8px) scale(1.04); }
                    60%     { transform:translateY(-3px) scale(1.01); }
                }
                @keyframes erFloat {
                    0%   { transform:translateY(110vh) rotate(0deg); opacity:0.8; }
                    100% { transform:translateY(-10vh) rotate(720deg); opacity:0; }
                }

                .er-root {
                    min-height: 100vh;
                    background: ${isPassed ? '#16a34a' : '#ef5350'};
                    position: fixed;
                    inset: 0;
                    z-index: 50;
                    overflow-y: auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 16px 32px;
                    font-family: 'Sarabun','Nunito',sans-serif;
                    transition: background 0.8s ease;
                }
                .er-card {
                    position: relative; z-index: 10;
                    width: 100%; max-width: 600px;
                    animation: erSlideUp 0.5s ease both;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .er-title {
                    font-family: 'Nunito','Sarabun',sans-serif;
                    font-weight: 900;
                    font-size: clamp(2.2rem,7vw,3.2rem);
                    color: #fff;
                    text-align: center;
                    letter-spacing: -1.5px;
                    margin-bottom: 6px;
                    text-shadow: 0 6px 30px rgba(0,0,0,0.4);
                    ${isPassed ? 'animation: erBounce 2.5s ease-in-out infinite;' : ''}
                    display: inline-block;
                    width: 100%;
                }
                .er-sub {
                    text-align: center;
                    color: rgba(255,255,255,0.9);
                    font-size: 1.2rem;
                    font-weight: 700;
                    margin-bottom: 28px;
                    letter-spacing: 0.3px;
                }
                /* Big start button */
                .er-btn {
                    width: 100%;
                    padding: 20px;
                    border-radius: 20px;
                    border: none;
                    color: #1a0533;
                    font-weight: 900;
                    font-size: 1.25rem;
                    font-family: 'Nunito','Sarabun',sans-serif;
                    cursor: pointer;
                    transition: transform 0.18s cubic-bezier(.34,1.6,.64,1), box-shadow 0.18s, filter 0.18s;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    margin-bottom: 16px;
                    text-decoration: none;
                }
                .er-btn-primary {
                    background: #fff;
                    box-shadow: 0 8px 32px rgba(255,255,255,0.25);
                }
                .er-btn-primary:hover {
                    transform: translateY(-4px) scale(1.02);
                    box-shadow: 0 16px 48px rgba(255,255,255,0.4);
                }
                .er-btn-primary:active { transform: scale(0.97); }
                
                .er-btn-secondary {
                    background: rgba(255,255,255,0.2);
                    color: #fff;
                    box-shadow: none;
                    border: 2px solid rgba(255,255,255,0.3);
                }
                .er-btn-secondary:hover {
                    background: rgba(255,255,255,0.3);
                    transform: translateY(-4px) scale(1.02);
                }
                .er-btn-secondary:active { transform: scale(0.97); }

            `}</style>

            <div className="er-root">
                {/* Floating Transparent Navbar */}
                <HomeNavbar />

                {showIntroAnimation && !introAnimation.disabled && (introAnimation.animationData || introAnimation.animationUrl) && (
                    <AdaptiveLottie
                        key={`${introAnimation.key}-${isPassed ? 'pass' : 'fail'}`}
                        animationData={introAnimation.animationData}
                        animationUrl={introAnimation.animationUrl}
                        scale="full"
                        direction={introAnimation.direction}
                        speed={introAnimation.speed}
                        startPosition={introAnimation.startPosition}
                        endPosition={introAnimation.endPosition}
                        durationText={introAnimation.durationText}
                        delayMode={introAnimation.delayMode}
                        delayPercent={introAnimation.delayPercent}
                        useMotionPath
                        hideAfterDuration
                        display="overlay"
                    />
                )}

                {/* Background blobs */}
                <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
                    <div style={{ position:'absolute', top:'-15%', left:'-10%', width:'60vw', height:'60vw', maxWidth:600, maxHeight:600, borderRadius:'50%', background: isPassed ? 'radial-gradient(circle at 40% 40%,#22c55e 0%,#15803d 60%,transparent 100%)' : 'radial-gradient(circle at 40% 40%,#e53935 0%,#c62828 60%,transparent 100%)', animation:'erBlobDrift 14s ease-in-out infinite', willChange: 'transform' }}/>
                    <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'65vw', height:'65vw', maxWidth:660, maxHeight:660, borderRadius:'50%', background: isPassed ? 'radial-gradient(circle at 60% 60%,#4ade80 0%,#16a34a 55%,transparent 100%)' : 'radial-gradient(circle at 60% 60%,#ef9a9a 0%,#e53935 55%,transparent 100%)', animation:'erBlobDrift 18s ease-in-out infinite reverse', willChange: 'transform' }}/>
                </div>

                {/* Floating confetti dots */}
                {isPassed && [
                    { left:'8%',  delay:'0s',   dur:'7s',  size:10, color:'#ffcc00' },
                    { left:'20%', delay:'1.5s', dur:'9s',  size:7,  color:'#ff6b8a' },
                    { left:'35%', delay:'0.8s', dur:'6s',  size:12, color:'#fff' },
                    { left:'55%', delay:'2.2s', dur:'8s',  size:8,  color:'#00b4d8' },
                    { left:'70%', delay:'0.3s', dur:'10s', size:6,  color:'#fbbf24' },
                    { left:'85%', delay:'1.8s', dur:'7.5s',size:11, color:'#fff' },
                    { left:'92%', delay:'0.9s', dur:'8.5s',size:7,  color:'#ffcc00' },
                ].map((dot, i) => (
                    <div key={i} style={{
                        position:'absolute', bottom:'-20px', left:dot.left,
                        width:dot.size, height:dot.size, borderRadius:'50%',
                        background:dot.color, pointerEvents:'none',
                        animation:`erFloat ${dot.dur} ${dot.delay} ease-in infinite`,
                        willChange: 'transform, opacity',
                        opacity:0.8,
                    }}/>
                ))}


                <div className="er-card">
                    <div className="mb-2 flex w-full justify-center">
                        {!inlineAnimation.disabled && (inlineAnimation.animationData || inlineAnimation.animationUrl) && (
                            <AdaptiveLottie
                                animationData={inlineAnimation.animationData}
                                animationUrl={inlineAnimation.animationUrl}
                                scale={inlineAnimation.scale}
                                direction={inlineAnimation.direction}
                                speed={inlineAnimation.speed}
                                startPosition={inlineAnimation.startPosition}
                                endPosition={inlineAnimation.endPosition}
                                durationText={inlineAnimation.durationText}
                                delayMode={inlineAnimation.delayMode}
                                delayPercent={inlineAnimation.delayPercent}
                                useMotionPath
                                hideAfterDuration
                                display="inline"
                                className="mx-auto"
                            />
                        )}
                    </div>

                    <div className="er-title">
                        {isPassed ? 'สอบผ่านแล้ว!' : 'ยังไม่ผ่านเกณฑ์'}
                    </div>
                    <div className="er-sub">
                        {isPassed ? 'ยอดเยี่ยมมาก ทำได้ดีแล้วลุยต่อไป!' : 'ไม่เป็นไร ลองใหม่อีกครั้งนะ คุณทำได้แน่!'}
                    </div>

                    <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] p-6 shadow-xl mb-6">
                        <div className="text-center mb-6">
                            <div className="text-white/80 text-sm font-bold uppercase tracking-wider mb-2">คะแนนของคุณ</div>
                            <div className="text-7xl font-black text-white">
                                {score} <span className="text-3xl text-white/60">/ {totalScore}</span>
                            </div>
                            <div className="mt-3 inline-block bg-[#fbbf24]/20 border border-[#fbbf24]/40 rounded-full px-4 py-1 text-[#fbbf24] font-bold text-lg drop-shadow-md">
                                ✨ ได้รับ +{score * 10} EXP
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 rounded-[1.5rem] p-4 border border-white/20 text-center">
                                <div className="text-white/80 text-xs font-bold uppercase mb-1">เวลาที่ใช้</div>
                                <div className="text-xl font-bold text-white">{Math.floor(result.time_taken / 60)} น. {result.time_taken % 60} วิ.</div>
                            </div>
                            <div className="bg-white/10 rounded-[1.5rem] p-4 border border-white/20 text-center">
                                <div className="text-white/80 text-xs font-bold uppercase mb-1">ความแม่นยำ</div>
                                <div className="text-xl font-bold text-white">{percentage.toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Ad Injection for Single Exam Result */}
                    <div className="w-full mb-6">
                        <AdSlot placement="result" />
                    </div>

                    <div className="w-full flex flex-col sm:flex-row gap-4 mb-6">
                        <button
                            onClick={onRetry}
                            className="er-btn er-btn-primary flex-1"
                        >
                            🔄 ทำข้อสอบอีกครั้ง
                        </button>
                        <Link
                            to="/profile"
                            className="er-btn er-btn-secondary flex-1"
                        >
                            🏠 กลับสู่แดชบอร์ด
                        </Link>
                    </div>

                    {/* Detailed Solutions (Premium sees more) */}
                    {
                        result.questions && result.answers && (
                            <div className="w-full bg-white/95 backdrop-blur-md border border-white/20 rounded-[2rem] p-6 text-gray-800 text-left shadow-2xl">
                                <h3 className="text-xl font-bold mb-4 text-primary">เฉลยข้อสอบ</h3>
                                <div>
                                    <DetailedSolution questions={result.questions} answers={result.answers} />
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </>
    );
};

export default ExamResult;
