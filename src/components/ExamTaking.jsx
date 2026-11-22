import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Clock,
    Flag,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Bookmark,
    Type,
    MapPin,
    Grid,
    X,
    Sunrise,
    Trees,
    Building2,
    Mountain,
    Compass,
    Check,
    CheckCircle2,
    XCircle,
    Send,
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReportModal from './exam/ReportModal';
import AmbiencePlayer from './exam/AmbiencePlayer';
import FontResizer from './exam/FontResizer';
import PermissionGate from './common/PermissionGate';
import useUserRole from '../hooks/useUserRole';
import PacingAlert from './exam/PacingAlert';
import toast from 'react-hot-toast';
import bookmarkService from '../services/bookmarkService';
import HomeNavbar from './HomeNavbar';
import AdaptiveLottie from './common/AdaptiveLottie';
import publicService from '../services/publicService';
import { resolveAnimationPreset } from '../config/animationRuntime';

// Scene assets
import mainSceneBAnimation from '../assets/main-scene-b.json';
import mainSceneCAnimation from '../assets/main-scene-c.json';
import mainSceneDAnimation from '../assets/main-scene-d.json';
import runningAnimation from '../assets/boy-running.json';
import jumpingAnimation from '../assets/jumping.json';

// ─── Scene definitions — each "location" on the journey ───────────────────────
const JOURNEY_SCENES = [
    {
        id: 'dawn',
        name: 'รุ่งอรุณ',
        lottie: mainSceneBAnimation,
        bgGradient: 'linear-gradient(160deg, #1a0533 0%, #3b0764 40%, #7c2d12 80%, #92400e 100%)',
        overlayTint: 'rgba(120, 40, 20, 0.25)',
        accentColor: '#f97316',
    },
    {
        id: 'forest',
        name: 'ป่าลึก',
        lottie: mainSceneCAnimation,
        bgGradient: 'linear-gradient(160deg, #052e16 0%, #14532d 35%, #166534 70%, #15803d 100%)',
        overlayTint: 'rgba(5, 46, 22, 0.35)',
        accentColor: '#4ade80',
    },
    {
        id: 'city',
        name: 'เมืองใหม่',
        lottie: mainSceneDAnimation,
        bgGradient: 'linear-gradient(160deg, #020617 0%, #0f172a 40%, #1e3a5f 80%, #1e40af 100%)',
        overlayTint: 'rgba(30, 64, 175, 0.2)',
        accentColor: '#60a5fa',
    },
    {
        id: 'summit',
        name: 'ยอดเขา',
        lottie: mainSceneBAnimation,
        bgGradient: 'linear-gradient(160deg, #0c0a09 0%, #1c1917 30%, #292524 60%, #44403c 100%)',
        overlayTint: 'rgba(120, 113, 108, 0.2)',
        accentColor: '#e2e8f0',
    },
];

const SCENE_ICONS = {
    dawn: Sunrise,
    forest: Trees,
    city: Building2,
    summit: Mountain,
};

const getSceneIcon = (scene) => SCENE_ICONS[scene?.id] || Compass;

const EXAM_CSS = `
    /* ─── Scene crossfade ─── */
    @keyframes scene-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
    }

    /* ─── Character run across screen ─── */
    @keyframes char-run-through {
        0%   { transform: translateX(-280px) scaleX(1);  opacity: 0; }
        8%   { opacity: 1; }
        50%  { transform: translateX(0px) scaleX(1);     opacity: 1; }
        92%  { opacity: 1; }
        100% { transform: translateX(280px) scaleX(1);   opacity: 0; }
    }

    /* ─── Particles ─── */
    @keyframes particle-twinkle {
        0%, 100% { opacity: 0.15; transform: scale(0.7); }
        50%       { opacity: 0.9;  transform: scale(1.4); }
    }

    /* ─── Ripple ─── */
    @keyframes ripple-out {
        from { transform: scale(0); opacity: 0.55; }
        to   { transform: scale(4.5); opacity: 0; }
    }
    .choice-ripple {
        position: absolute;
        border-radius: 50%;
        width: 56px; height: 56px;
        margin-top: -28px; margin-left: -28px;
        background: rgba(255,255,255,0.45);
        animation: ripple-out 0.55s ease-out forwards;
        pointer-events: none;
    }

    /* ─── Button press ─── */
    .journey-btn {
        position: relative; overflow: hidden;
        transition: filter 0.14s ease, transform 0.1s ease, box-shadow 0.14s ease;
    }
    .journey-btn:hover:not(:disabled) {
        filter: brightness(1.08);
        transform: translateY(-2px) scale(1.01);
    }
    .journey-btn:active:not(:disabled) {
        transform: translateY(4px) scale(0.985) !important;
        box-shadow: none !important;
        filter: brightness(0.92);
    }

    /* ─── Correct / wrong feedback ─── */
    @keyframes feedback-in {
        from { opacity: 0; transform: scale(0.92) translateY(10px); }
        to   { opacity: 1; transform: scale(1)    translateY(0); }
    }
    @keyframes shake-x {
        0%,100% { transform: translateX(0); }
        18%  { transform: translateX(-8px); }
        36%  { transform: translateX(6px); }
        54%  { transform: translateX(-4px); }
        72%  { transform: translateX(2px); }
    }
    @keyframes correct-pulse {
        0%,100% { box-shadow: 0 0 16px rgba(74,222,128,0.25); }
        50%      { box-shadow: 0 0 34px rgba(74,222,128,0.5); }
    }
    @keyframes wrong-pulse {
        0%,100% { box-shadow: 0 0 16px rgba(248,113,113,0.25); }
        50%      { box-shadow: 0 0 34px rgba(248,113,113,0.5); }
    }

    /* ─── Timer ─── */
    @keyframes timer-pulse {
        0%,100% { transform: scale(1); }
        50%      { transform: scale(1.05); }
    }

    /* ─── Progress shimmer ─── */
    @keyframes shimmer-move {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
    .progress-bar-fill {
        transition: width 0.55s cubic-bezier(0.34,1.3,0.64,1);
        background: linear-gradient(90deg, #a855f7, #ec4899, #f59e0b, #a855f7);
        background-size: 300% 100%;
        animation: shimmer-move 3s linear infinite;
    }

    /* ─── Number badge ─── */
    .choice-badge {
        min-width: 38px; height: 38px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.25);
        border: 2px solid rgba(255,255,255,0.4);
        font-weight: 900; font-size: 1rem;
        color: white; flex-shrink: 0;
        transition: background 0.18s, border-color 0.18s;
    }
    .journey-btn.selected .choice-badge {
        background: rgba(255,255,255,0.28);
        border-color: white;
    }
`;

const decodeHtml = (html) => {
    const txt = document.createElement('textarea');
    let decoded = html;
    let limit = 5;
    while (limit > 0 && decoded) {
        txt.innerHTML = decoded;
        const next = txt.value;
        if (next === decoded) break;
        decoded = next;
        limit--;
    }
    return decoded;
};

const parseDurationMs = (input, fallback = 900) => {
    const parsed = Number.parseFloat(String(input || '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) && parsed > 0 ? parsed * 1000 : fallback;
};

// ─── Choice colors (WCAG AA compliant with white text) ───────────────────────
const CHOICE_CFG = {
    A: { bg: '#dc1a3a', shadow: '#9f1229', num: 'ก' },
    B: { bg: '#1368ce', shadow: '#0d4a94', num: 'ข' },
    C: { bg: '#b45309', shadow: '#78350f', num: 'ค' },
    D: { bg: '#1f7a09', shadow: '#145306', num: 'ง' },
};

// ─── BackgroundScene ─────────────────────────────────────────────────────────
const BackgroundScene = ({ scene, isTransitioning }) => (
    <motion.div
        key={scene.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.1, ease: 'easeInOut' }}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
    >
        {/* Base gradient */}
        <div style={{
            position: 'absolute', inset: 0,
            background: scene.bgGradient,
        }} />

        {/* Lottie scene — bottom-anchored, full-width, covers lower 50% */}
        <div style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            opacity: 0.55,
            filter: isTransitioning ? 'blur(4px)' : 'blur(0px)',
            transition: 'filter 0.4s ease',
        }}>
            {scene.animationUrl ? (
                <AdaptiveLottie
                    animationUrl={scene.animationUrl}
                    loop autoplay
                    scale="none"
                    className="w-full h-full"
                    style={{ objectFit: 'cover' }}
                />
            ) : (
                <Lottie
                    animationData={scene.lottie}
                    loop autoplay
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    rendererSettings={{ preserveAspectRatio: 'xMidYMax slice' }}
                />
            )}
        </div>

        {/* Overlay tint */}
        <div style={{ position: 'absolute', inset: 0, background: scene.overlayTint }} />

        {/* Vignette */}
        <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)',
        }} />

        {/* Particle stars */}
        {Array.from({ length: 18 }, (_, i) => {
            const sz = [2, 3, 2, 4, 2][i % 5];
            const dur = 2.5 + (i * 0.41) % 3.5;
            const delay = (i * 0.67) % 4;
            return (
                <div key={i} style={{
                    position: 'absolute',
                    width: sz, height: sz,
                    borderRadius: '50%',
                    background: i % 3 === 0 ? '#f0abfc' : i % 3 === 1 ? '#fde68a' : '#ffffff',
                    top: `${(i * 31 + 5) % 55}%`,
                    left: `${(i * 43 + 11) % 95}%`,
                    animation: `particle-twinkle ${dur}s ${delay}s infinite ease-in-out`,
                }} />
            );
        })}
    </motion.div>
);

// ─── TravelingCharacter ─────────────────────────────────────────────────────
const TravelingCharacter = ({ isRunning, onDone }) => {
    useEffect(() => {
        if (!isRunning) return;
        const t = setTimeout(onDone, 1600);
        return () => clearTimeout(t);
    }, [isRunning, onDone]);

    if (!isRunning) return null;
    return (
        <div style={{
            position: 'absolute',
            bottom: '42%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            width: 140, height: 140,
            animation: 'char-run-through 1.6s cubic-bezier(0.22,1,0.36,1) forwards',
            pointerEvents: 'none',
        }}>
            <Lottie
                animationData={runningAnimation}
                loop
                autoplay
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const ExamTaking = ({ questions, mode, onSubmit, config }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState({});

    // Timer calculation
    const totalTimeSeconds = config?.time_limit_minutes ? config.time_limit_minutes * 60 : (questions?.length || 0) * 60;
    const [timeLeft, setTimeLeft] = useState(totalTimeSeconds);
    const [startTime] = useState(Date.now());
    const [showReportModal, setShowReportModal] = useState(false);
    const [fontSizeScale, setFontSizeScale] = useState(1);
    const [showFontMenu, setShowFontMenu] = useState(false);
    const [fullScreenImage, setFullScreenImage] = useState(null);
    const [transientAnimation, setTransientAnimation] = useState(null);
    const [questionKey, setQuestionKey] = useState(0);
    const [ripples, setRipples] = useState({});
    const [isRunning, setIsRunning] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [sceneIdx, setSceneIdx] = useState(0);
    const [showMilestone, setShowMilestone] = useState(null); // null | scene name
    const [showGridModal, setShowGridModal] = useState(false);

    const { isPremium } = useUserRole();
    const answerAdvanceTimeoutRef = useRef(null);
    const transientAnimationTimeoutRef = useRef(null);

    const { data: publicSettingsResponse } = useQuery({
        queryKey: ['publicSystemSettings'],
        queryFn: publicService.getSystemSettings,
        staleTime: 60000,
    });
    const runtimeAnimationSettings = publicSettingsResponse?.settings || {};

    const activeScenes = useMemo(() => {
        const custom = runtimeAnimationSettings?.journey_scenes;
        if (custom && Array.isArray(custom) && custom.length > 0) return custom;
        return JOURNEY_SCENES;
    }, [runtimeAnimationSettings?.journey_scenes]);

    const currentScene = activeScenes[sceneIdx % activeScenes.length];
    const CurrentSceneIcon = getSceneIcon(currentScene);

    // Timer
    useEffect(() => {
        if (mode === 'simulation') {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [mode]);

    // Cleanup
    useEffect(() => () => {
        if (answerAdvanceTimeoutRef.current) clearTimeout(answerAdvanceTimeoutRef.current);
        if (transientAnimationTimeoutRef.current) clearTimeout(transientAnimationTimeoutRef.current);
    }, []);

    const showTransientAnimation = useCallback((presetKey, duration = 1500) => {
        if (config?.disable_animation) return;
        const preset = resolveAnimationPreset(presetKey, runtimeAnimationSettings);
        if (preset.disabled || (!preset.animationData && !preset.animationUrl)) return;
        const resolvedDuration = parseDurationMs(preset.durationText, duration);
        setTransientAnimation({ ...preset, durationMs: resolvedDuration, renderKey: `${preset.key}-${Date.now()}` });
        if (transientAnimationTimeoutRef.current) clearTimeout(transientAnimationTimeoutRef.current);
        transientAnimationTimeoutRef.current = setTimeout(() => setTransientAnimation(null), resolvedDuration);
    }, [runtimeAnimationSettings]);

    // Navigate to next question — trigger journey if crossing scene boundary
    const navigateToQuestion = useCallback((newIndex) => {
        const questionsPerScene = runtimeAnimationSettings?.questions_per_scene || 5;
        const oldScene = Math.floor(currentIndex / questionsPerScene);
        const newScene = Math.floor(newIndex / questionsPerScene);

        setCurrentIndex(newIndex);
        setQuestionKey(k => k + 1);

        if (newScene !== oldScene) {
            setIsRunning(true);
            setIsTransitioning(true);
            setTimeout(() => {
                setSceneIdx(newScene % activeScenes.length);
                const arrivedAt = activeScenes[newScene % activeScenes.length];
                setShowMilestone(arrivedAt.name);
                setTimeout(() => setShowMilestone(null), 2500);
            }, 800);
            setTimeout(() => setIsTransitioning(false), 1400);
        }
    }, [currentIndex, activeScenes, runtimeAnimationSettings?.questions_per_scene]);

    const handleRunDone = useCallback(() => setIsRunning(false), []);

    const handleAnswer = (choice, event) => {
        const qId = questions[currentIndex].id;
        const isFirstAnswer = !answers[qId];
        const nextAnswers = { ...answers, [qId]: choice };
        setAnswers(nextAnswers);

        // Ripple
        if (event) {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const rid = Date.now();
            setRipples(prev => ({ ...prev, [choice]: { x, y, id: rid } }));
            setTimeout(() => setRipples(prev => {
                const n = { ...prev };
                if (n[choice]?.id === rid) delete n[choice];
                return n;
            }), 650);
        }

        if (answerAdvanceTimeoutRef.current) clearTimeout(answerAdvanceTimeoutRef.current);

        if (isFirstAnswer) {
            showTransientAnimation('examSkipFirstAnswer', 850);

            if (mode !== 'practice') {
                answerAdvanceTimeoutRef.current = setTimeout(() => {
                    const unanswered = questions.map((_, i) => i).filter(i => i !== currentIndex && !nextAnswers[questions[i].id]);
                    if (currentIndex < questions.length - 1 && !nextAnswers[questions[currentIndex + 1].id]) {
                        navigateToQuestion(currentIndex + 1);
                    } else if (unanswered.length > 0) {
                        navigateToQuestion(unanswered.find(i => i > currentIndex) ?? unanswered[0]);
                    } else if (currentIndex < questions.length - 1) {
                        navigateToQuestion(currentIndex + 1);
                    }
                }, 520);
            }
        }
    };

    const toggleFlag = () => setFlagged({ ...flagged, [questions[currentIndex].id]: !flagged[questions[currentIndex].id] });

    const handleBookmark = async () => {
        const q = questions[currentIndex];
        try {
            if (!q) throw new Error('No question');
            await bookmarkService.addBookmark({ target_type: 'question', target_id: q.id, title: String(q.question_text || '').substring(0, 100) });
            toast.success('บันทึกข้อสอบแล้ว');
        } catch (err) {
            if (err.response?.status === 400) toast.error('คุณบันทึกข้อสอบนี้ไปแล้ว');
            else toast.error('บันทึกล้มเหลว ' + (err.message || ''));
        }
    };

    const handleSubmit = () => {
        const completeAnswers = { ...answers };
        questions.forEach(q => {
            if (!(q.id in completeAnswers)) {
                completeAnswers[q.id] = null;
            }
        });
        onSubmit(completeAnswers, Math.floor((Date.now() - startTime) / 1000));
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    const currentQuestion = questions?.[currentIndex];

    if (!questions || questions.length === 0 || !currentQuestion) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#2e0d63] via-[#46178f] to-[#5b21b6] font-['Sarabun','Nunito',sans-serif]">
                <HomeNavbar />
                <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/25 rounded-3xl p-8 text-center text-white shadow-2xl">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-amber-300">
                        <AlertTriangle size={28} aria-hidden="true" />
                    </div>
                    <h2 className="text-xl font-extrabold mb-2">ไม่พบข้อสอบในชุดนี้</h2>
                    <p className="text-sm text-white/80 mb-6">กรุณาลองเลือกหมวดหมู่หรือเงื่อนไขอื่นใหม่อีกครั้ง</p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 rounded-2xl bg-white text-indigo-950 font-extrabold text-sm hover:bg-white/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                    >
                        กลับไปเลือกข้อสอบ
                    </button>
                </div>
            </div>
        );
    }

    const isAnswered = answers[currentQuestion.id];
    const isLastQuestion = currentIndex === questions.length - 1;
    const allAnswered = Object.keys(answers).length === questions.length;
    const isReadyToSubmit = isLastQuestion || allAnswered;
    const progressPct = ((currentIndex + 1) / questions.length) * 100;
    const isTimerUrgent = mode === 'simulation' && timeLeft < 300;

    const checkIsCorrect = (q, ansChoice) => {
        if (!ansChoice) return false;
        const correctNorm = q.correct_answer ? String(q.correct_answer).trim().toUpperCase() : '';
        const choiceText = q[`choice_${ansChoice.toLowerCase()}`] ? String(q[`choice_${ansChoice.toLowerCase()}`]).trim().toUpperCase() : '';
        return (ansChoice.toUpperCase() === correctNorm) || (choiceText === correctNorm);
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden flex flex-col font-['Nunito','Sarabun',sans-serif]">
            <style>{EXAM_CSS}</style>

            {/* ── Background Scene (AnimatePresence for crossfade) ── */}
            <AnimatePresence mode="sync">
                <BackgroundScene
                    key={currentScene.id}
                    scene={currentScene}
                    isTransitioning={isTransitioning}
                />
            </AnimatePresence>

            {/* ── Traveling Character ── */}
            <TravelingCharacter isRunning={isRunning} onDone={handleRunDone} />

            {/* ── Milestone badge ── */}
            <AnimatePresence>
                {showMilestone && (
                    <motion.div
                        key="milestone"
                        initial={{ opacity: 0, y: -40, scale: 0.7 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.85 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-slate-950/85 backdrop-blur-xl rounded-full px-5 py-2.5 font-black text-sm sm:text-base flex items-center gap-2 whitespace-nowrap shadow-2xl max-w-[calc(100vw-24px)]"
                        style={{
                            border: `1px solid ${currentScene.accentColor}66`,
                            color: currentScene.accentColor,
                            boxShadow: `0 6px 26px ${currentScene.accentColor}44`,
                        }}
                    >
                        <MapPin size={16} aria-hidden="true" />
                        <CurrentSceneIcon size={16} aria-hidden="true" />
                        <span>มาถึง {showMilestone} แล้ว!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Navbar ── */}
            <div className="relative z-50">
                <HomeNavbar />
            </div>

            {/* ── Main content ── */}
            <div className="relative z-10 flex-1 flex flex-col pt-20 px-3 sm:px-5 pb-28">

                {/* Top bar */}
                <div className="max-w-[900px] mx-auto w-full mb-4">
                    {/* Progress bar */}
                    <div
                        className="h-2 bg-white/15 backdrop-blur-md rounded-full overflow-hidden mb-3 border border-white/20"
                        role="progressbar"
                        aria-valuenow={currentIndex + 1}
                        aria-valuemin={1}
                        aria-valuemax={questions.length}
                        aria-label={`ความคืบหน้าข้อสอบ ข้อ ${currentIndex + 1} จาก ${questions.length}`}
                    >
                        <div className="progress-bar-fill h-full rounded-full" style={{ width: `${progressPct}%` }} />
                    </div>

                    <div className="flex justify-between items-center gap-2 flex-wrap">
                        {/* Question counter + scene */}
                        <div
                            className="bg-slate-950/55 backdrop-blur-md rounded-full py-1.5 px-3.5 sm:px-4 font-extrabold text-white text-sm sm:text-base flex items-center gap-2 transition-colors shadow-lg"
                            style={{ border: `1px solid ${currentScene.accentColor}66` }}
                        >
                            <span
                                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                                style={{
                                    background: `${currentScene.accentColor}26`,
                                    color: currentScene.accentColor,
                                }}
                            >
                                <CurrentSceneIcon size={14} aria-hidden="true" />
                            </span>
                            <span>{currentIndex + 1}</span>
                            <span className="text-white/60">/ {questions.length}</span>
                        </div>

                        {/* Timer */}
                        {mode === 'simulation' && (
                            <div
                                role="timer"
                                aria-live="off"
                                className={`backdrop-blur-md rounded-full py-1.5 px-4 flex items-center gap-2 font-black text-base sm:text-lg tracking-wider transition-colors shadow-lg ${
                                    isTimerUrgent
                                        ? 'bg-red-800/70 text-red-100 border border-red-300/60'
                                        : 'bg-slate-950/55 text-white border border-white/20'
                                }`}
                                style={{
                                    animation: isTimerUrgent ? 'timer-pulse 1s ease-in-out infinite' : 'none',
                                }}
                            >
                                <Clock size={16} aria-hidden="true" />
                                <span>{formatTime(timeLeft)}</span>
                            </div>
                        )}

                        {/* Font tool */}
                        <button
                            type="button"
                            onClick={() => setShowFontMenu(!showFontMenu)}
                            aria-label="ปรับขนาดตัวอักษร"
                            aria-expanded={showFontMenu}
                            className={`bg-slate-950/55 hover:bg-slate-900/75 backdrop-blur-md border rounded-full w-10 h-10 flex items-center justify-center text-white cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-lg ${
                                showFontMenu ? 'border-indigo-300 bg-indigo-600/50' : 'border-white/25'
                            }`}
                        >
                            <Type size={16} aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {/* Question card */}
                <div className="max-w-[900px] mx-auto w-full mb-4">
                    <motion.div
                        key={`q-${questionKey}`}
                        initial={{ opacity: 0, y: 16, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-slate-950/55 backdrop-blur-xl rounded-3xl p-4 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.45)] relative transition-colors"
                        style={{
                            border: `1px solid ${currentScene.accentColor}44`,
                        }}
                    >
                        {/* ID + actions header */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white/75 text-[11px] font-mono tracking-wider">
                                ID: {currentQuestion.id}
                            </span>

                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={toggleFlag}
                                    aria-label={flagged[currentQuestion.id] ? 'ยกเลิกปักหมุดข้อนี้' : 'ปักหมุดข้อนี้'}
                                    aria-pressed={!!flagged[currentQuestion.id]}
                                    title="ปักหมุดข้อนี้"
                                    className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                                        flagged[currentQuestion.id]
                                            ? 'bg-amber-400 text-amber-950 border-amber-200 shadow-md shadow-amber-400/30'
                                            : 'bg-white/12 hover:bg-white/22 text-white border-white/20'
                                    }`}
                                >
                                    <Flag size={15} fill={flagged[currentQuestion.id] ? 'currentColor' : 'none'} aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBookmark}
                                    aria-label="บันทึกข้อสอบ"
                                    title="บันทึกข้อสอบ"
                                    className="w-9 h-9 rounded-full flex items-center justify-center bg-white/12 hover:bg-white/22 text-white border border-white/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    <Bookmark size={15} aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReportModal(true)}
                                    aria-label="แจ้งปัญหาข้อสอบ"
                                    title="แจ้งปัญหาข้อสอบ"
                                    className="w-9 h-9 rounded-full flex items-center justify-center bg-white/12 hover:bg-rose-500/35 text-white border border-white/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    <AlertTriangle size={15} aria-hidden="true" />
                                </button>
                            </div>
                        </div>

                        <div
                            className="text-white font-extrabold text-left break-words leading-relaxed whitespace-pre-line"
                            style={{
                                fontSize: `${1.2 * fontSizeScale}rem`,
                                textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                            }}
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtml(currentQuestion.question_text)) }}
                        />

                        {currentQuestion.question_image && (
                            <button
                                type="button"
                                onClick={() => setFullScreenImage(currentQuestion.question_image)}
                                aria-label="แตะเพื่อขยายรูปภาพข้อสอบ"
                                className="mt-4 block mx-auto rounded-2xl overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-transform hover:scale-[1.01]"
                            >
                                <img
                                    src={currentQuestion.question_image}
                                    alt="รูปภาพประกอบข้อสอบ"
                                    className="max-w-full max-h-56 object-contain rounded-2xl shadow-lg"
                                    style={{ border: `1px solid ${currentScene.accentColor}44` }}
                                />
                            </button>
                        )}
                    </motion.div>
                </div>

                {/* Choice buttons */}
                {(() => {
                    const allChoices = ['A', 'B', 'C', 'D'];
                    const getRealText = (c, i) => currentQuestion[`choice_${c.toLowerCase()}`] || currentQuestion.choices?.[c] || (Array.isArray(currentQuestion.choices) ? currentQuestion.choices[i] : '');
                    const hasAnyRealText = allChoices.some((c, i) => String(getRealText(c, i) || '').trim().length > 0);
                    const choicesToRender = allChoices.filter((c, i) => !hasAnyRealText || String(getRealText(c, i) || '').trim().length > 0);

                    return (
                        <div className="max-w-[900px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {choicesToRender.map((choice, idx) => {
                                const cfg = CHOICE_CFG[choice];
                                const selected = answers[currentQuestion.id] === choice;
                                const ripple = ripples[choice];
                                const originalIdx = allChoices.indexOf(choice);
                                const choiceText = getRealText(choice, originalIdx) || `${originalIdx + 1}`;

                                return (
                                    <motion.button
                                        key={choice}
                                        type="button"
                                        aria-pressed={selected}
                                        className={`journey-btn min-w-0 w-full text-left rounded-2xl p-4 sm:px-5 sm:py-4 flex items-center gap-3.5 cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${selected ? 'selected' : ''}`}
                                        onClick={(e) => handleAnswer(choice, e)}
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ delay: idx * 0.07, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                                        style={{
                                            background: cfg.bg,
                                            boxShadow: selected
                                                ? `0 0 0 3px white, 0 0 0 6px rgba(255,255,255,0.28), 0 6px 0 ${cfg.shadow}`
                                                : `0 6px 0 ${cfg.shadow}`,
                                        }}
                                    >
                                        {ripple && <span key={ripple.id} className="choice-ripple" style={{ left: ripple.x, top: ripple.y }} />}
                                        <span className="choice-badge" aria-hidden="true">{cfg.num}</span>
                                        <span
                                            className="font-extrabold text-white flex-1 min-w-0 break-words leading-snug"
                                            style={{
                                                fontSize: `${1.0 * fontSizeScale}rem`,
                                                textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                                            }}
                                        >
                                            {choiceText}
                                        </span>
                                        {selected && (
                                            <span
                                                aria-hidden="true"
                                                className="shrink-0 w-7 h-7 bg-white/30 rounded-full flex items-center justify-center text-white"
                                            >
                                                <Check size={15} strokeWidth={3} />
                                            </span>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    );
                })()}

                {/* Explanation (practice mode) */}
                <AnimatePresence>
                    {mode === 'practice' && isAnswered && (() => {
                        const correct = checkIsCorrect(currentQuestion, answers[currentQuestion.id]);
                        return (
                            <motion.div
                                key={`explain-${currentQuestion.id}`}
                                initial={{ opacity: 0, y: 16, scale: 0.94 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.94 }}
                                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                                className="max-w-[900px] mt-5 mx-auto w-full"
                            >
                                <div
                                    className="p-5 sm:p-6 rounded-3xl backdrop-blur-xl text-left"
                                    style={{
                                        background: correct
                                            ? 'linear-gradient(135deg, rgba(21,128,61,0.52), rgba(15,83,42,0.42))'
                                            : 'linear-gradient(135deg, rgba(185,28,28,0.52), rgba(127,29,29,0.42))',
                                        border: `1px solid ${correct ? 'rgba(74,222,128,0.45)' : 'rgba(248,113,113,0.45)'}`,
                                        animation: correct
                                            ? 'feedback-in 0.4s ease both, correct-pulse 2s 0.4s infinite'
                                            : 'feedback-in 0.3s ease both, shake-x 0.4s 0.1s, wrong-pulse 2s 0.5s infinite',
                                    }}
                                >
                                    <h4
                                        className="font-black text-xl sm:text-2xl mb-3 flex items-center gap-2.5"
                                        style={{
                                            color: correct ? '#86efac' : '#fca5a5',
                                            textShadow: correct ? '0 0 18px rgba(74,222,128,0.45)' : '0 0 18px rgba(248,113,113,0.45)',
                                        }}
                                    >
                                        <span
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                                correct
                                                    ? 'bg-emerald-500/25 border-emerald-400/50 text-emerald-300'
                                                    : 'bg-rose-500/25 border-rose-400/50 text-rose-300'
                                            }`}
                                        >
                                            {correct ? <CheckCircle2 size={20} aria-hidden="true" /> : <XCircle size={20} aria-hidden="true" />}
                                        </span>
                                        <span>{correct ? 'สุดยอด! ตอบถูก' : 'ยังไม่ถูกนะ'}</span>
                                    </h4>
                                    <div className="text-white/95 text-sm sm:text-base font-semibold leading-relaxed space-y-3">
                                        <div>
                                            <span className="inline-flex items-center bg-white/15 border border-white/30 rounded-xl px-3 py-1 font-black text-white">
                                                เฉลย: {currentQuestion.correct_answer}
                                            </span>
                                        </div>
                                        {currentQuestion.explanation && (
                                            <div
                                                className="whitespace-pre-line break-words"
                                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtml(currentQuestion.explanation)) }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })()}
                </AnimatePresence>
            </div>

            {/* ── Bottom Nav ── */}
            <div
                className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/75 backdrop-blur-xl px-3 sm:px-6 py-2.5 shadow-[0_-8px_32px_rgba(0,0,0,0.4)] transition-colors"
                style={{ borderTop: `1px solid ${currentScene.accentColor}44` }}
            >
                <div className="max-w-[900px] mx-auto flex justify-between items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigateToQuestion(Math.max(0, currentIndex - 1))}
                        disabled={currentIndex === 0}
                        aria-label="ข้อก่อนหน้า"
                        className="w-12 h-12 bg-white/12 hover:bg-white/22 border border-white/25 rounded-full flex items-center justify-center text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
                    >
                        <ChevronLeft size={24} aria-hidden="true" />
                    </button>

                    {/* Scene dots and Navigation Grid */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-1.5" aria-hidden="true">
                            {activeScenes.map((s, i) => {
                                const isCurrentScene = i === (sceneIdx % activeScenes.length);
                                return (
                                    <div
                                        key={s.id || i}
                                        style={{
                                            width: isCurrentScene ? 22 : 7,
                                            height: 7,
                                            borderRadius: 99,
                                            background: isCurrentScene ? currentScene.accentColor : 'rgba(255,255,255,0.28)',
                                            transition: 'all 0.4s ease',
                                            boxShadow: isCurrentScene ? `0 0 8px ${currentScene.accentColor}` : 'none',
                                        }}
                                    />
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowGridModal(true)}
                            aria-label="เปิดตารางเลือกข้อสอบ"
                            title="เลือกข้อสอบ"
                            className="w-11 h-11 bg-white/15 hover:bg-white/25 border border-white/30 rounded-full flex items-center justify-center text-white cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                            <Grid size={18} aria-hidden="true" />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={isReadyToSubmit ? handleSubmit : () => navigateToQuestion(Math.min(questions.length - 1, currentIndex + 1))}
                        aria-label={isReadyToSubmit ? 'ส่งคำตอบ' : 'ข้อถัดไป'}
                        className={`border-0 rounded-full flex items-center justify-center gap-2 font-black text-base cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0 ${
                            isReadyToSubmit
                                ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white px-5 sm:px-7 py-3 shadow-[0_5px_0_#14532d,0_8px_18px_rgba(22,163,74,0.4)] active:translate-y-1'
                                : 'bg-white/95 hover:bg-white text-slate-900 w-12 h-12 shadow-[0_4px_0_rgba(0,0,0,0.25)] active:translate-y-1'
                        }`}
                    >
                        {isReadyToSubmit ? (
                            <>
                                <Send size={17} aria-hidden="true" />
                                <span>ส่งคำตอบ!</span>
                            </>
                        ) : (
                            <ChevronRight size={24} aria-hidden="true" />
                        )}
                    </button>
                </div>
            </div>

            {/* Floating tools */}
            {showFontMenu && <FontResizer onResize={setFontSizeScale} currentSize={fontSizeScale} />}
            <PermissionGate requiredTier="premium" type="hide"><AmbiencePlayer /></PermissionGate>
            <PacingAlert timeUsed={totalTimeSeconds - timeLeft} totalTime={totalTimeSeconds} />
            {showReportModal && <ReportModal questionId={currentQuestion.id} onClose={() => setShowReportModal(false)} />}

            {/* Lottie overlay animation (existing system) */}
            {transientAnimation && !transientAnimation.disabled && (
                <AdaptiveLottie
                    key={transientAnimation.renderKey}
                    animationData={transientAnimation.animationData}
                    animationUrl={transientAnimation.animationUrl}
                    scale={transientAnimation.scale}
                    direction={transientAnimation.direction}
                    speed={transientAnimation.speed}
                    startPosition={transientAnimation.startPosition}
                    endPosition={transientAnimation.endPosition}
                    durationText={transientAnimation.durationText}
                    delayMode={transientAnimation.delayMode}
                    delayPercent={transientAnimation.delayPercent}
                    useMotionPath
                    hideAfterDuration
                    overlayOffsetY={170}
                    display="overlay"
                />
            )}

            {/* Fullscreen image */}
            <AnimatePresence>
                {fullScreenImage && (
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="ดูรูปภาพขนาดเต็ม"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setFullScreenImage(null)}
                        className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 cursor-pointer"
                    >
                        <button
                            type="button"
                            onClick={() => setFullScreenImage(null)}
                            aria-label="ปิดรูปภาพขยาย"
                            className="fixed top-4 right-4 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                        >
                            <X size={22} aria-hidden="true" />
                        </button>
                        <motion.img
                            src={fullScreenImage}
                            alt="รูปภาพประกอบข้อสอบขนาดขยาย"
                            initial={{ scale: 0.85 }}
                            animate={{ scale: 1 }}
                            onClick={(e) => e.stopPropagation()}
                            className="max-w-full max-h-full object-contain rounded-2xl cursor-default"
                            style={{ boxShadow: `0 0 60px ${currentScene.accentColor}66` }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Navigation Modal */}
            <AnimatePresence>
                {showGridModal && (
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="grid-modal-title"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-5"
                        onClick={() => setShowGridModal(false)}
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-[600px] max-h-[80vh] bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-3xl p-5 sm:p-6 overflow-y-auto custom-scrollbar shadow-2xl flex flex-col gap-4"
                        >
                            <div className="flex justify-between items-center">
                                <h3 id="grid-modal-title" className="text-white text-lg sm:text-xl font-extrabold m-0">
                                    ข้ามไปข้อที่...
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowGridModal(false)}
                                    aria-label="ปิดตารางเลือกข้อสอบ"
                                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    <X size={20} aria-hidden="true" />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-white/80 justify-center">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="w-3 h-3 bg-emerald-500 rounded-sm inline-block" aria-hidden="true" />
                                    ทำแล้ว
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="w-3 h-3 bg-white/15 border border-white/25 rounded-sm inline-block" aria-hidden="true" />
                                    ยังไม่ทำ
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="w-3 h-3 bg-amber-500 rounded-full inline-block" aria-hidden="true" />
                                    ปักหมุด
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center">
                                {questions.map((q, idx) => {
                                    const isAns = !!answers[q.id];
                                    const isCur = idx === currentIndex;
                                    const isFlag = !!flagged[q.id];
                                    return (
                                        <button
                                            key={q.id}
                                            type="button"
                                            aria-label={`ไปที่ข้อ ${idx + 1}${isAns ? ' (ทำแล้ว)' : ' (ยังไม่ทำ)'}${isFlag ? ' (ปักหมุด)' : ''}`}
                                            aria-current={isCur ? 'step' : undefined}
                                            onClick={() => { navigateToQuestion(idx); setShowGridModal(false); }}
                                            className={`w-11 h-11 rounded-xl font-extrabold text-sm sm:text-base relative cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                                                isCur
                                                    ? 'bg-blue-500 text-white border-2 border-white shadow-[0_0_14px_rgba(59,130,246,0.65)]'
                                                    : isAns
                                                        ? 'bg-emerald-500 hover:bg-emerald-400 text-white border border-emerald-300/40'
                                                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                                            }`}
                                        >
                                            {idx + 1}
                                            {isFlag && (
                                                <span
                                                    aria-hidden="true"
                                                    className="absolute -top-1 -right-1 bg-amber-400 w-3 h-3 rounded-full border-2 border-slate-900"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExamTaking;
