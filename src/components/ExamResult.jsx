import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Sparkles, RotateCcw, Home, Trophy, Target, Clock, Award } from 'lucide-react';
import DetailedSolution from './exam/DetailedSolution';
import AdSlot from './ads/AdSlot';
import HomeNavbar from './HomeNavbar';
import AdaptiveLottie from './common/AdaptiveLottie';
import publicService from '../services/publicService';
import { resolveAnimationPreset } from '../config/animationRuntime';

import examService from '../services/examService';
import ExamResultKorPor from './ExamResultKorPor';

const ExamResult = ({ result, onRetry, config }) => {
    const score = result.score || 0;
    const totalScore = result.total_score || result.total_questions || (result.questions ? result.questions.length : 1);
    const percentage = totalScore > 0 ? (score / totalScore) * 100 : 0;
    const isPassed = percentage >= 60;
    const timeTaken = Number(result?.time_taken ?? result?.total_time ?? 0);

    const { data: publicSettingsResponse } = useQuery({
        queryKey: ['publicSystemSettings'],
        queryFn: publicService.getSystemSettings,
        staleTime: 60000
    });
    const runtimeAnimationSettings = publicSettingsResponse?.settings || {};
    const { data: metaRes } = useQuery({ queryKey: ['examSetsMetaResult'], queryFn: examService.getExamSetsMeta });
    const setsMeta = metaRes?.data || [];
    const isKorPor = setsMeta.find(s => s.name === config?.exam_set)?.is_korpor_format;

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

    if (isKorPor) return <ExamResultKorPor result={result} onRetry={onRetry} config={config} />;

    return (
        <>
            <style>{`
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
                    30%     { transform:translateY(-6px) scale(1.03); }
                    60%     { transform:translateY(-2px) scale(1.01); }
                }
                @keyframes erFloat {
                    0%   { transform:translateY(110vh) rotate(0deg); opacity:0.8; }
                    100% { transform:translateY(-10vh) rotate(720deg); opacity:0; }
                }

                .er-root {
                    min-height: 100vh;
                    background: ${isPassed
                        ? 'linear-gradient(155deg, #15803d 0%, #16a34a 52%, #059669 100%)'
                        : 'linear-gradient(155deg, #b91c1c 0%, #dc2626 52%, #e11d48 100%)'};
                    position: fixed;
                    inset: 0;
                    z-index: 50;
                    overflow-y: auto;
                    overflow-x: hidden;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    padding: 88px 16px 48px;
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
                    font-size: clamp(2rem, 6.5vw, 3.1rem);
                    color: #fff;
                    text-align: center;
                    letter-spacing: -1px;
                    margin-bottom: 6px;
                    text-shadow: 0 6px 30px rgba(0,0,0,0.35);
                    ${isPassed ? 'animation: erBounce 2.5s ease-in-out infinite;' : ''}
                    width: 100%;
                }
                .er-btn {
                    width: 100%;
                    padding: 16px 20px;
                    border-radius: 20px;
                    border: none;
                    font-weight: 900;
                    font-size: 1.08rem;
                    font-family: 'Nunito','Sarabun',sans-serif;
                    cursor: pointer;
                    transition: transform 0.18s cubic-bezier(.34,1.6,.64,1), box-shadow 0.18s, background 0.18s;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    text-decoration: none;
                }
                .er-btn-primary {
                    background: #fff;
                    color: #1e1b4b;
                    box-shadow: 0 8px 28px rgba(0,0,0,0.18);
                }
                .er-btn-primary:hover {
                    transform: translateY(-3px) scale(1.015);
                    box-shadow: 0 14px 36px rgba(0,0,0,0.26);
                }
                .er-btn-primary:active { transform: scale(0.98); }

                .er-btn-secondary {
                    background: rgba(255,255,255,0.16);
                    backdrop-filter: blur(12px);
                    color: #fff;
                    border: 1.5px solid rgba(255,255,255,0.35);
                }
                .er-btn-secondary:hover {
                    background: rgba(255,255,255,0.26);
                    transform: translateY(-3px) scale(1.015);
                }
                .er-btn-secondary:active { transform: scale(0.98); }
            `}</style>

            <div className="er-root custom-scrollbar">
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
                <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none', zIndex: 0 }}>
                    <div style={{ position:'absolute', top:'-15%', left:'-10%', width:'60vw', height:'60vw', maxWidth:600, maxHeight:600, borderRadius:'50%', background: isPassed ? 'radial-gradient(circle at 40% 40%,#22c55e 0%,#15803d 60%,transparent 100%)' : 'radial-gradient(circle at 40% 40%,#ef4444 0%,#991b1b 60%,transparent 100%)', animation:'erBlobDrift 14s ease-in-out infinite', willChange: 'transform' }}/>
                    <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'65vw', height:'65vw', maxWidth:660, maxHeight:660, borderRadius:'50%', background: isPassed ? 'radial-gradient(circle at 60% 60%,#4ade80 0%,#16a34a 55%,transparent 100%)' : 'radial-gradient(circle at 60% 60%,#fb7185 0%,#be123c 55%,transparent 100%)', animation:'erBlobDrift 18s ease-in-out infinite reverse', willChange: 'transform' }}/>
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
                        position:'fixed', bottom:'-20px', left:dot.left,
                        width:dot.size, height:dot.size, borderRadius:'50%',
                        background:dot.color, pointerEvents:'none',
                        animation:`erFloat ${dot.dur} ${dot.delay} ease-in infinite`,
                        willChange: 'transform, opacity',
                        opacity:0.8,
                        zIndex: 1,
                    }}/>
                ))}

                {!showIntroAnimation && (
                    <div className="er-card my-auto">
                        <div className="mb-3 flex w-full justify-center">
                            {!inlineAnimation.disabled && (inlineAnimation.animationData || inlineAnimation.animationUrl) ? (
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
                            ) : (
                                <div className="w-16 h-16 rounded-3xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xl">
                                    {isPassed ? <Trophy size={34} className="text-amber-200" aria-hidden="true" /> : <Target size={34} className="text-white" aria-hidden="true" />}
                                </div>
                            )}
                        </div>

                        <h1 className="er-title">
                            {isPassed ? 'สอบผ่านแล้ว!' : 'ยังไม่ผ่านเกณฑ์'}
                        </h1>
                        <p className="text-center text-white/95 text-base sm:text-lg font-bold mb-6 tracking-wide">
                            {isPassed ? 'ยอดเยี่ยมมาก ทำได้ดีแล้วลุยต่อไป!' : 'ไม่เป็นไร ลองใหม่อีกครั้งนะ คุณทำได้แน่!'}
                        </p>

                        <div className="w-full bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-5 sm:p-7 shadow-2xl mb-6">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-1.5 text-white/90 text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-2">
                                    <Award size={15} aria-hidden="true" />
                                    <span>คะแนนของคุณ</span>
                                </div>
                                <div className="text-5xl sm:text-7xl font-black text-white leading-none">
                                    {score}{' '}
                                    <span className="text-2xl sm:text-3xl text-white/75 font-extrabold">
                                        / {totalScore}
                                    </span>
                                </div>
                                <div className="mt-4 inline-flex items-center gap-2 bg-slate-950/35 border border-amber-300/45 rounded-full px-4 py-1.5 text-amber-200 font-extrabold text-sm sm:text-base shadow-md backdrop-blur-md">
                                    <Sparkles size={16} className="text-amber-300 shrink-0" aria-hidden="true" />
                                    <span>ได้รับ +{score * 10} EXP</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="bg-slate-950/20 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/20 text-center">
                                    <div className="inline-flex items-center justify-center gap-1.5 text-white/85 text-xs font-bold uppercase mb-1">
                                        <Clock size={13} aria-hidden="true" />
                                        <span>เวลาที่ใช้</span>
                                    </div>
                                    <div className="text-lg sm:text-xl font-extrabold text-white">
                                        {Math.floor(timeTaken / 60)} น. {timeTaken % 60} วิ.
                                    </div>
                                </div>
                                <div className="bg-slate-950/20 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/20 text-center">
                                    <div className="inline-flex items-center justify-center gap-1.5 text-white/85 text-xs font-bold uppercase mb-1">
                                        <Target size={13} aria-hidden="true" />
                                        <span>ความแม่นยำ</span>
                                    </div>
                                    <div className="text-lg sm:text-xl font-extrabold text-white">
                                        {percentage.toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ad Injection for Single Exam Result */}
                        <div className="w-full mb-6">
                            <AdSlot placement="result" />
                        </div>

                        <div className="w-full flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                            <button
                                type="button"
                                onClick={onRetry}
                                className="er-btn er-btn-primary flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                            >
                                <RotateCcw size={19} aria-hidden="true" />
                                <span>ทำข้อสอบอีกครั้ง</span>
                            </button>
                            <Link
                                to="/profile"
                                className="er-btn er-btn-secondary flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                            >
                                <Home size={19} aria-hidden="true" />
                                <span>กลับสู่แดชบอร์ด</span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Detailed Solutions (Premium sees more) */}
                {!showIntroAnimation && result.questions && result.answers && (
                    <div className="relative z-10 w-full max-w-[680px] mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/30 dark:border-slate-700/70 rounded-3xl p-4 sm:p-6 text-slate-800 dark:text-slate-100 text-left shadow-2xl">
                        <h3 className="text-lg sm:text-xl font-extrabold mb-4 text-indigo-700 dark:text-indigo-300">
                            เฉลยข้อสอบ
                        </h3>
                        <DetailedSolution questions={result.questions} answers={result.answers} />
                    </div>
                )}
            </div>
        </>
    );
};

export default ExamResult;
