import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Flag, ChevronLeft, ChevronRight, AlertTriangle, Bookmark, Type, MapPin } from 'lucide-react';
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
        emoji: '🌅',
        lottie: mainSceneBAnimation,
        bgGradient: 'linear-gradient(160deg, #1a0533 0%, #3b0764 40%, #7c2d12 80%, #92400e 100%)',
        overlayTint: 'rgba(120, 40, 20, 0.25)',
        accentColor: '#f97316',
    },
    {
        id: 'forest',
        name: 'ป่าลึก',
        emoji: '🌲',
        lottie: mainSceneCAnimation,
        bgGradient: 'linear-gradient(160deg, #052e16 0%, #14532d 35%, #166534 70%, #15803d 100%)',
        overlayTint: 'rgba(5, 46, 22, 0.35)',
        accentColor: '#4ade80',
    },
    {
        id: 'city',
        name: 'เมืองใหม่',
        emoji: '🏙️',
        lottie: mainSceneDAnimation,
        bgGradient: 'linear-gradient(160deg, #020617 0%, #0f172a 40%, #1e3a5f 80%, #1e40af 100%)',
        overlayTint: 'rgba(30, 64, 175, 0.2)',
        accentColor: '#60a5fa',
    },
    {
        id: 'summit',
        name: 'ยอดเขา',
        emoji: '🏔️',
        lottie: mainSceneBAnimation,
        bgGradient: 'linear-gradient(160deg, #0c0a09 0%, #1c1917 30%, #292524 60%, #44403c 100%)',
        overlayTint: 'rgba(120, 113, 108, 0.2)',
        accentColor: '#e2e8f0',
    },
];

// How many questions per scene
const QUESTIONS_PER_SCENE = 3;

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
    @keyframes float-up {
        0%   { transform: translateY(0) rotate(0deg);   opacity: 0.5; }
        50%  { transform: translateY(-24px) rotate(8deg); opacity: 0.9; }
        100% { transform: translateY(0) rotate(0deg);   opacity: 0.5; }
    }

    /* ─── Question slide ─── */
    @keyframes q-slide-in {
        from { opacity: 0; transform: translateY(18px) scale(0.98); }
        to   { opacity: 1; transform: translateY(0)    scale(1); }
    }
    @keyframes choice-pop-in {
        from { opacity: 0; transform: translateY(22px) scale(0.95); }
        to   { opacity: 1; transform: translateY(0)    scale(1); }
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
        transition: filter 0.1s ease, transform 0.07s ease;
    }
    .journey-btn:hover:not(:disabled) {
        filter: brightness(1.15);
        transform: translateY(-2px) scale(1.01);
    }
    .journey-btn:active:not(:disabled) {
        transform: translateY(5px) scale(0.98) !important;
        box-shadow: none !important;
        filter: brightness(0.9);
    }

    /* ─── Correct / wrong feedback ─── */
    @keyframes feedback-in {
        from { opacity: 0; transform: scale(0.88) translateY(10px); }
        to   { opacity: 1; transform: scale(1)    translateY(0); }
    }
    @keyframes shake-x {
        0%,100% { transform: translateX(0); }
        18%  { transform: translateX(-9px); }
        36%  { transform: translateX(7px); }
        54%  { transform: translateX(-5px); }
        72%  { transform: translateX(3px); }
    }
    @keyframes correct-pulse {
        0%,100% { box-shadow: 0 0 16px rgba(74,222,128,0.25); }
        50%      { box-shadow: 0 0 36px rgba(74,222,128,0.55); }
    }
    @keyframes wrong-pulse {
        0%,100% { box-shadow: 0 0 16px rgba(248,113,113,0.25); }
        50%      { box-shadow: 0 0 36px rgba(248,113,113,0.55); }
    }

    /* ─── Timer ─── */
    @keyframes timer-pulse {
        0%,100% { transform: scale(1); }
        50%      { transform: scale(1.06); }
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

    /* ─── Milestone badge ─── */
    @keyframes badge-pop {
        0%   { transform: scale(0) rotate(-12deg); opacity: 0; }
        60%  { transform: scale(1.18) rotate(4deg); opacity: 1; }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    .milestone-badge { animation: badge-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }

    /* ─── Number badge ─── */
    .choice-badge {
        min-width: 38px; height: 38px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.22);
        border: 2px solid rgba(255,255,255,0.38);
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

// ─── Choice colors ──────────────────────────────────────────────────────────
const CHOICE_CFG = {
    A: { bg: '#e21b3c', shadow: '#b3152d', num: '1' },
    B: { bg: '#1368ce', shadow: '#0e4e9c', num: '2' },
    C: { bg: '#d89e00', shadow: '#a87b00', num: '3' },
    D: { bg: '#26890c', shadow: '#1a5e08', num: '4' },
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
// Shows the running character sliding across the screen on scene change
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
    const [timeLeft, setTimeLeft] = useState(questions.length * 60);
    const [startTime] = useState(Date.now());
    const [showReportModal, setShowReportModal] = useState(false);
    const [fontSizeScale, setFontSizeScale] = useState(1);
    const [showFontMenu, setShowFontMenu] = useState(false);
    const [fullScreenImage, setFullScreenImage] = useState(null);
    const [transientAnimation, setTransientAnimation] = useState(null);
    const [questionKey, setQuestionKey] = useState(0);
    const [ripples, setRipples] = useState({});
    const [isRunning, setIsRunning] = useState(false);      // character running across
    const [isTransitioning, setIsTransitioning] = useState(false); // scene fade
    const [sceneIdx, setSceneIdx] = useState(0);
    const [showMilestone, setShowMilestone] = useState(null); // null | scene name

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
        const oldScene = Math.floor(currentIndex / QUESTIONS_PER_SCENE);
        const newScene = Math.floor(newIndex / QUESTIONS_PER_SCENE);

        setCurrentIndex(newIndex);
        setQuestionKey(k => k + 1);

        if (newScene !== oldScene) {
            // Scene change: character runs, background crossfades
            setIsRunning(true);
            setIsTransitioning(true);
            setTimeout(() => {
                setSceneIdx(newScene % activeScenes.length);
                const arrivedAt = activeScenes[newScene % activeScenes.length];
                setShowMilestone(arrivedAt.emoji + ' ' + arrivedAt.name);
                setTimeout(() => setShowMilestone(null), 2500);
            }, 800); // character is mid-run when scene swaps
            setTimeout(() => setIsTransitioning(false), 1400);
        }
    }, [currentIndex, activeScenes]);

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

    const currentQuestion = questions[currentIndex];
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
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            overflow: 'hidden',
            fontFamily: "'Nunito', 'Sarabun', sans-serif",
            display: 'flex',
            flexDirection: 'column',
        }}>
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
                        style={{
                            position: 'fixed',
                            top: 80,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 100,
                            background: 'rgba(0,0,0,0.75)',
                            backdropFilter: 'blur(16px)',
                            border: `1px solid ${currentScene.accentColor}55`,
                            borderRadius: 99,
                            padding: '10px 28px',
                            color: currentScene.accentColor,
                            fontWeight: 900,
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: `0 4px 24px ${currentScene.accentColor}44`,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <MapPin size={16} /> มาถึง {showMilestone} แล้ว!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Navbar ── */}
            <div style={{ position: 'relative', zIndex: 50 }}>
                <HomeNavbar />
            </div>

            {/* ── Main content ── */}
            <div style={{ position: 'relative', zIndex: 10, flexGrow: 1, display: 'flex', flexDirection: 'column', paddingTop: 80, paddingInline: 16, paddingBottom: 110 }}>

                {/* Top bar */}
                <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', marginBottom: 16 }}>
                    {/* Progress bar */}
                    <div style={{ height: 7, background: 'rgba(255,255,255,0.12)', borderRadius: 99, overflow: 'hidden', marginBottom: 10, border: '1px solid rgba(255,255,255,0.15)' }}>
                        <div className="progress-bar-fill" style={{ height: '100%', width: `${progressPct}%`, borderRadius: 99 }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        {/* Question counter + scene */}
                        <div style={{
                            background: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: 99,
                            padding: '6px 18px',
                            fontWeight: 800,
                            color: 'white',
                            fontSize: '0.95rem',
                            border: `1px solid ${currentScene.accentColor}55`,
                            display: 'flex', alignItems: 'center', gap: 8,
                            transition: 'border-color 0.5s',
                        }}>
                            <span style={{ color: currentScene.accentColor, transition: 'color 0.5s' }}>{currentScene.emoji}</span>
                            <span>{currentIndex + 1}</span>
                            <span style={{ opacity: 0.45 }}>/ {questions.length}</span>
                        </div>

                        {/* Timer */}
                        {mode === 'simulation' && (
                            <div style={{
                                background: isTimerUrgent ? 'rgba(185,28,28,0.45)' : 'rgba(0,0,0,0.4)',
                                backdropFilter: 'blur(12px)',
                                borderRadius: 99,
                                padding: '6px 20px',
                                display: 'flex', alignItems: 'center', gap: 7,
                                fontWeight: 900, fontSize: '1.1rem',
                                color: isTimerUrgent ? '#fca5a5' : 'white',
                                border: `1px solid ${isTimerUrgent ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.18)'}`,
                                animation: isTimerUrgent ? 'timer-pulse 1s ease-in-out infinite' : 'none',
                                letterSpacing: '0.05em',
                                transition: 'background 0.3s',
                            }}>
                                <Clock size={16} />
                                {formatTime(timeLeft)}
                            </div>
                        )}

                        {/* Font tool */}
                        <button
                            onClick={() => setShowFontMenu(!showFontMenu)}
                            aria-label="ปรับขนาดตัวอักษร"
                            style={{
                                background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.18)', borderRadius: '50%',
                                width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', cursor: 'pointer',
                            }}
                        >
                            <Type size={16} />
                        </button>
                    </div>
                </div>

                {/* Question card */}
                <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', marginBottom: 18 }}>
                    <motion.div
                        key={`q-${questionKey}`}
                        initial={{ opacity: 0, y: 16, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            background: 'rgba(0,0,0,0.45)',
                            backdropFilter: 'blur(24px)',
                            border: `1px solid ${currentScene.accentColor}33`,
                            borderRadius: '1.6rem',
                            padding: '1.8rem 2.2rem',
                            boxShadow: `0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)`,
                            position: 'relative',
                            transition: 'border-color 0.6s',
                        }}
                    >
                        {/* ID + actions */}
                        <div style={{ position: 'absolute', top: 12, left: 16, color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                            ID: {currentQuestion.id}
                        </div>
                        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 5 }}>
                            {[
                                { onClick: toggleFlag, icon: <Flag size={14} fill={flagged[currentQuestion.id] ? 'currentColor' : 'none'} />, active: flagged[currentQuestion.id], activeColor: '#fbbf24' },
                                { onClick: handleBookmark, icon: <Bookmark size={14} /> },
                                { onClick: () => setShowReportModal(true), icon: <AlertTriangle size={14} /> },
                            ].map((btn, i) => (
                                <button key={i} onClick={btn.onClick} style={{
                                    background: btn.active ? btn.activeColor : 'rgba(255,255,255,0.12)',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                    borderRadius: '50%',
                                    width: 30, height: 30,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: btn.active ? '#78350f' : 'white',
                                    cursor: 'pointer', transition: 'all 0.18s',
                                }}>
                                    {btn.icon}
                                </button>
                            ))}
                        </div>

                        <div
                            style={{
                                color: 'white', fontWeight: 800,
                                fontSize: `${1.25 * fontSizeScale}rem`,
                                lineHeight: 1.65, marginTop: '1.2rem',
                                textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                            }}
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtml(currentQuestion.question_text)) }}
                        />

                        {currentQuestion.question_image && (
                            <img
                                src={currentQuestion.question_image}
                                alt="Question"
                                onClick={() => setFullScreenImage(currentQuestion.question_image)}
                                style={{
                                    marginTop: 14, display: 'block', marginInline: 'auto',
                                    maxWidth: '100%', maxHeight: 220, objectFit: 'contain',
                                    borderRadius: 10, cursor: 'pointer',
                                    border: `1px solid ${currentScene.accentColor}44`,
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                                    transition: 'transform 0.2s',
                                }}
                            />
                        )}
                    </motion.div>
                </div>

                {/* Choice buttons */}
                <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 14 }}>
                    {['A', 'B', 'C', 'D'].map((choice, idx) => {
                        const cfg = CHOICE_CFG[choice];
                        const selected = answers[currentQuestion.id] === choice;
                        const ripple = ripples[choice];
                        return (
                            <motion.button
                                key={choice}
                                className={`journey-btn${selected ? ' selected' : ''}`}
                                onClick={(e) => handleAnswer(choice, e)}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: idx * 0.07, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                                style={{
                                    background: cfg.bg,
                                    borderRadius: '0.9rem',
                                    border: 'none',
                                    padding: '18px 22px',
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    cursor: 'pointer',
                                    boxShadow: selected
                                        ? `0 0 0 3px white, 0 0 0 6px rgba(255,255,255,0.25), 0 7px 0 ${cfg.shadow}`
                                        : `0 7px 0 ${cfg.shadow}`,
                                    transition: 'box-shadow 0.1s',
                                    textAlign: 'left', width: '100%',
                                }}
                            >
                                {ripple && <span key={ripple.id} className="choice-ripple" style={{ left: ripple.x, top: ripple.y }} />}
                                <span className="choice-badge">{cfg.num}</span>
                                <span style={{
                                    fontWeight: 800,
                                    color: 'white',
                                    fontSize: `${1.0 * fontSizeScale}rem`,
                                    lineHeight: 1.4,
                                    textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                                    flexGrow: 1,
                                }}>
                                    {currentQuestion[`choice_${choice.toLowerCase()}`]}
                                </span>
                                {selected && (
                                    <span style={{
                                        flexShrink: 0, width: 26, height: 26,
                                        background: 'rgba(255,255,255,0.28)',
                                        borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.9rem',
                                    }}>✓</span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

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
                                style={{ maxWidth: 900, margin: '18px auto 0', width: '100%' }}
                            >
                                <div style={{
                                    padding: '1.6rem 2rem',
                                    borderRadius: '1.4rem',
                                    background: correct
                                        ? 'linear-gradient(135deg,rgba(21,128,61,0.38),rgba(22,101,52,0.22))'
                                        : 'linear-gradient(135deg,rgba(185,28,28,0.38),rgba(153,27,27,0.22))',
                                    backdropFilter: 'blur(16px)',
                                    border: `1px solid ${correct ? 'rgba(74,222,128,0.35)' : 'rgba(248,113,113,0.35)'}`,
                                    animation: correct
                                        ? 'feedback-in 0.4s ease both, correct-pulse 2s 0.4s infinite'
                                        : 'feedback-in 0.3s ease both, shake-x 0.4s 0.1s, wrong-pulse 2s 0.5s infinite',
                                }}>
                                    <h4 style={{
                                        fontWeight: 900, fontSize: '1.5rem', marginBottom: '0.8rem',
                                        color: correct ? '#4ade80' : '#f87171',
                                        textShadow: correct ? '0 0 18px rgba(74,222,128,0.5)' : '0 0 18px rgba(248,113,113,0.5)',
                                    }}>
                                        {correct ? '🎉 สุดยอด! ตอบถูก' : '❌ ยังไม่ถูกนะ'}
                                    </h4>
                                    <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.7 }}>
                                        <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 7, padding: '3px 11px', marginRight: 8, fontWeight: 900 }}>
                                            เฉลย: {currentQuestion.correct_answer}
                                        </span>
                                        {currentQuestion.explanation && (
                                            <>
                                                <br /><br />
                                                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtml(currentQuestion.explanation)) }} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })()}
                </AnimatePresence>
            </div>

            {/* ── Bottom Nav ── */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(20px)',
                borderTop: `1px solid ${currentScene.accentColor}33`,
                padding: '10px 24px',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.35)',
                transition: 'border-color 0.5s',
            }}>
                <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        onClick={() => navigateToQuestion(Math.max(0, currentIndex - 1))}
                        disabled={currentIndex === 0}
                        style={{
                            width: 50, height: 50,
                            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                            opacity: currentIndex === 0 ? 0.3 : 1,
                            transition: 'opacity 0.2s',
                        }}
                    >
                        <ChevronLeft size={24} />
                    </button>

                    {/* Scene dots */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {JOURNEY_SCENES.map((s, i) => (
                            <div key={s.id} style={{
                                width: i === sceneIdx ? 22 : 7,
                                height: 7,
                                borderRadius: 99,
                                background: i === sceneIdx ? currentScene.accentColor : 'rgba(255,255,255,0.25)',
                                transition: 'all 0.4s ease',
                                boxShadow: i === sceneIdx ? `0 0 8px ${currentScene.accentColor}` : 'none',
                            }} />
                        ))}
                    </div>

                    <button
                        onClick={isReadyToSubmit ? handleSubmit : () => navigateToQuestion(Math.min(questions.length - 1, currentIndex + 1))}
                        style={{
                            background: isReadyToSubmit
                                ? `linear-gradient(135deg,#16a34a,#15803d)`
                                : 'rgba(255,255,255,0.95)',
                            color: isReadyToSubmit ? 'white' : '#111',
                            border: 'none', borderRadius: 99,
                            padding: isReadyToSubmit ? '12px 30px' : 0,
                            width: isReadyToSubmit ? 'auto' : 50, height: isReadyToSubmit ? 'auto' : 50,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, fontSize: isReadyToSubmit ? '1rem' : '1rem',
                            cursor: 'pointer',
                            boxShadow: isReadyToSubmit ? '0 5px 0 #14532d, 0 8px 18px rgba(22,163,74,0.4)' : '0 4px 0 rgba(0,0,0,0.2)',
                            transition: 'all 0.15s',
                        }}
                        onMouseDown={e => {
                            e.currentTarget.style.transform = 'translateY(4px)';
                            e.currentTarget.style.boxShadow = isReadyToSubmit ? '0 1px 0 #14532d' : 'none';
                        }}
                        onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                    >
                        {isReadyToSubmit ? '🚀 ส่งคำตอบ!' : <ChevronRight size={24} />}
                    </button>
                </div>
            </div>

            {/* Floating tools */}
            {showFontMenu && <FontResizer onResize={setFontSizeScale} currentSize={fontSizeScale} />}
            <PermissionGate requiredTier="premium" type="hide"><AmbiencePlayer /></PermissionGate>
            <PacingAlert timeUsed={(questions.length * 60) - timeLeft} totalTime={questions.length * 60} />
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setFullScreenImage(null)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 99999,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
                            cursor: 'pointer', padding: 16,
                        }}
                    >
                        <motion.img
                            src={fullScreenImage}
                            alt="Full"
                            initial={{ scale: 0.85 }}
                            animate={{ scale: 1 }}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 16, boxShadow: `0 0 60px ${currentScene.accentColor}66` }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExamTaking;
