import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Flag, ChevronLeft, ChevronRight, AlertTriangle, Bookmark, Share2, Type } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import ReportModal from './exam/ReportModal';
import AmbiencePlayer from './exam/AmbiencePlayer';
import QuestionNote from './exam/QuestionNote';
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

const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
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

const AAA_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');

    /* ─── Particles ─── */
    @keyframes particle-float {
        0%   { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.6; }
        25%  { transform: translateY(-30px) translateX(8px) scale(1.1); opacity: 1; }
        50%  { transform: translateY(-15px) translateX(-5px) scale(0.9); opacity: 0.7; }
        75%  { transform: translateY(-40px) translateX(10px) scale(1.05); opacity: 0.9; }
        100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.6; }
    }
    @keyframes particle-twinkle {
        0%, 100% { opacity: 0.2; transform: scale(0.8); }
        50%       { opacity: 1;   transform: scale(1.3); }
    }

    /* ─── Background shapes ─── */
    @keyframes bg-drift-1 {
        0%   { transform: translate(0, 0) rotate(0deg) scale(1); }
        33%  { transform: translate(40px, -60px) rotate(60deg) scale(1.1); }
        66%  { transform: translate(-30px, 40px) rotate(120deg) scale(0.95); }
        100% { transform: translate(0, 0) rotate(180deg) scale(1); }
    }
    @keyframes bg-drift-2 {
        0%   { transform: translate(0, 0) rotate(0deg); }
        50%  { transform: translate(-50px, -40px) rotate(-90deg); }
        100% { transform: translate(0, 0) rotate(-180deg); }
    }
    @keyframes bg-drift-3 {
        0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
        40%  { transform: translate(30px, -50px) scale(1.2) rotate(45deg); }
        80%  { transform: translate(-20px, 30px) scale(0.85) rotate(90deg); }
        100% { transform: translate(0, 0) scale(1) rotate(135deg); }
    }
    @keyframes bg-pulse-glow {
        0%, 100% { opacity: 0.06; }
        50%       { opacity: 0.14; }
    }

    /* ─── Question card slide ─── */
    @keyframes slide-in-right {
        from { opacity: 0; transform: translateX(60px) scale(0.97); }
        to   { opacity: 1; transform: translateX(0) scale(1); }
    }
    @keyframes slide-in-left {
        from { opacity: 0; transform: translateX(-60px) scale(0.97); }
        to   { opacity: 1; transform: translateX(0) scale(1); }
    }

    /* ─── Choice buttons ─── */
    @keyframes choice-stagger-in {
        from { opacity: 0; transform: translateY(24px) scale(0.95); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes ripple-out {
        from { transform: scale(0); opacity: 0.6; }
        to   { transform: scale(4); opacity: 0; }
    }
    @keyframes btn-selected-pulse {
        0%   { box-shadow: 0 0 0 0px rgba(255,255,255,0.7), 0 8px 0 var(--btn-shadow); }
        50%  { box-shadow: 0 0 0 12px rgba(255,255,255,0), 0 8px 0 var(--btn-shadow); }
        100% { box-shadow: 0 0 0 0px rgba(255,255,255,0.0), 0 8px 0 var(--btn-shadow); }
    }
    @keyframes btn-bounce-in {
        0%   { transform: scale(0.9) translateY(4px); }
        50%  { transform: scale(1.06) translateY(-4px); }
        75%  { transform: scale(0.98) translateY(1px); }
        100% { transform: scale(1) translateY(0); }
    }
    .choice-btn {
        position: relative;
        overflow: hidden;
        transition: filter 0.12s ease, transform 0.08s ease;
    }
    .choice-btn:hover:not(:disabled) {
        filter: brightness(1.15);
        transform: translateY(-2px) scale(1.01);
    }
    .choice-btn:active:not(:disabled) {
        transform: translateY(6px) scale(0.98) !important;
        box-shadow: none !important;
        filter: brightness(0.95);
    }
    .choice-btn.selected {
        animation: btn-bounce-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
                   btn-selected-pulse 0.6s ease-out 0.1s forwards;
    }
    .choice-ripple {
        position: absolute;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        margin-top: -30px;
        margin-left: -30px;
        background: rgba(255,255,255,0.5);
        animation: ripple-out 0.6s ease-out forwards;
        pointer-events: none;
    }

    /* ─── Number badge ─── */
    .choice-badge {
        min-width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.25);
        border: 2px solid rgba(255,255,255,0.4);
        font-weight: 900;
        font-size: 1.1rem;
        color: white;
        flex-shrink: 0;
        transition: background 0.2s;
    }
    .choice-btn.selected .choice-badge {
        background: rgba(255,255,255,0.3);
        border-color: white;
    }

    /* ─── Progress bar ─── */
    @keyframes progress-fill {
        from { width: var(--progress-from); }
        to   { width: var(--progress-to); }
    }
    .progress-fill {
        transition: width 0.5s cubic-bezier(0.34, 1.3, 0.64, 1);
        background: linear-gradient(90deg, #a855f7, #ec4899, #f59e0b);
        background-size: 200% 100%;
        animation: shimmer 2s linear infinite;
    }
    @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }

    /* ─── Explanation feedback ─── */
    @keyframes feedback-scale-in {
        from { opacity: 0; transform: scale(0.85) translateY(10px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        15%  { transform: translateX(-10px); }
        30%  { transform: translateX(8px); }
        45%  { transform: translateX(-6px); }
        60%  { transform: translateX(4px); }
        75%  { transform: translateX(-2px); }
    }
    @keyframes correct-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(74, 222, 128, 0.3), inset 0 0 20px rgba(74,222,128,0.05); }
        50%       { box-shadow: 0 0 40px rgba(74, 222, 128, 0.6), inset 0 0 30px rgba(74,222,128,0.1); }
    }
    @keyframes wrong-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(248, 113, 113, 0.3); }
        50%       { box-shadow: 0 0 40px rgba(248, 113, 113, 0.6); }
    }

    /* ─── Timer urgency ─── */
    @keyframes timer-urgent {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,107,138,0.5); }
        50%       { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(255,107,138,0); }
    }

    /* ─── Stagger helper ─── */
    .stagger-0 { animation-delay: 0ms; }
    .stagger-1 { animation-delay: 80ms; }
    .stagger-2 { animation-delay: 160ms; }
    .stagger-3 { animation-delay: 240ms; }
`;

const ExamTaking = ({ questions, mode, onSubmit, config }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState({});
    const [timeLeft, setTimeLeft] = useState(questions.length * 60);
    const [startTime] = useState(Date.now());
    const [showReportModal, setShowReportModal] = useState(false);
    const [fontSizeScale, setFontSizeScale] = useState(1);
    const [showFontMenu, setShowFontMenu] = useState(false);
    const [fullScreenImage, setFullScreenImage] = useState(null);
    const [transientAnimation, setTransientAnimation] = useState(null);
    const [questionKey, setQuestionKey] = useState(0); // triggers slide animation
    const [ripples, setRipples] = useState({}); // { choice: { x, y, id } }
    const { isPremium } = useUserRole();
    const answerAdvanceTimeoutRef = useRef(null);
    const transientAnimationTimeoutRef = useRef(null);
    const { data: publicSettingsResponse } = useQuery({
        queryKey: ['publicSystemSettings'],
        queryFn: publicService.getSystemSettings,
        staleTime: 60000
    });
    const runtimeAnimationSettings = publicSettingsResponse?.settings || {};

    useEffect(() => {
        if (mode === 'simulation') {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [mode]);

    useEffect(() => () => {
        if (answerAdvanceTimeoutRef.current) clearTimeout(answerAdvanceTimeoutRef.current);
        if (transientAnimationTimeoutRef.current) clearTimeout(transientAnimationTimeoutRef.current);
    }, []);

    const showTransientAnimation = useCallback((presetKey, duration = 1500) => {
        if (config?.disable_animation) return;
        const preset = resolveAnimationPreset(presetKey, runtimeAnimationSettings);
        if (preset.disabled || (!preset.animationData && !preset.animationUrl)) return;
        const resolvedDuration = parseDurationMs(preset.durationText, duration);
        setTransientAnimation({
            ...preset,
            durationMs: resolvedDuration,
            renderKey: `${preset.key}-${Date.now()}`
        });

        if (transientAnimationTimeoutRef.current) clearTimeout(transientAnimationTimeoutRef.current);
        transientAnimationTimeoutRef.current = setTimeout(() => {
            setTransientAnimation(null);
        }, resolvedDuration);
    }, [runtimeAnimationSettings]);

    const navigateToQuestion = useCallback((newIndex) => {
        setCurrentIndex(newIndex);
        setQuestionKey(k => k + 1);
    }, []);

    const handleAnswer = (choice, event) => {
        const currentQuestionId = questions[currentIndex].id;
        const isFirstAnswer = !answers[currentQuestionId];
        const nextAnswers = { ...answers, [currentQuestionId]: choice };

        setAnswers(nextAnswers);

        // Ripple effect
        if (event) {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const rippleId = Date.now();
            setRipples(prev => ({ ...prev, [choice]: { x, y, id: rippleId } }));
            setTimeout(() => {
                setRipples(prev => {
                    const next = { ...prev };
                    if (next[choice]?.id === rippleId) delete next[choice];
                    return next;
                });
            }, 700);
        }

        if (answerAdvanceTimeoutRef.current) clearTimeout(answerAdvanceTimeoutRef.current);

        if (isFirstAnswer) {
            showTransientAnimation('examSkipFirstAnswer', 850);

            if (mode !== 'practice') {
                answerAdvanceTimeoutRef.current = setTimeout(() => {
                    const unanswered = questions
                        .map((_, i) => i)
                        .filter((i) => i !== currentIndex && !nextAnswers[questions[i].id]);

                    if (currentIndex < questions.length - 1 && !nextAnswers[questions[currentIndex + 1].id]) {
                        navigateToQuestion(currentIndex + 1);
                    } else if (unanswered.length > 0) {
                        const nextUnanswered = unanswered.find((i) => i > currentIndex) ?? unanswered[0];
                        navigateToQuestion(nextUnanswered);
                    } else if (currentIndex < questions.length - 1) {
                        navigateToQuestion(currentIndex + 1);
                    }
                }, 520);
            }
        }
    };

    const toggleFlag = () => {
        setFlagged({ ...flagged, [questions[currentIndex].id]: !flagged[questions[currentIndex].id] });
    };

    const handleBookmark = async () => {
        const currentQuestion = questions[currentIndex];
        try {
            if (!currentQuestion) throw new Error("No current question");
            let title = 'Untitled Question';
            if (currentQuestion.question_text) {
                title = String(currentQuestion.question_text).substring(0, 100);
            }
            await bookmarkService.addBookmark({
                target_type: 'question',
                target_id: currentQuestion.id,
                title: title
            });
            toast.success('บันทึกข้อสอบแล้ว');
        } catch (error) {
            console.error("Bookmark error:", error);
            if (error.response?.status === 400) {
                toast.error('คุณบันทึกข้อสอบนี้ไปแล้ว');
            } else if (error.response?.data?.message) {
                toast.error('ล้มเหลว: ' + error.response.data.message);
            } else {
                toast.error('บันทึกข้อสอบล้มเหลว ' + (error.message || ''));
            }
        }
    };

    const handleSubmit = () => {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        onSubmit(answers, timeTaken);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const currentQuestion = questions[currentIndex];
    const isAnswered = answers[currentQuestion.id];
    const isLastQuestion = currentIndex === questions.length - 1;
    const allAnswered = Object.keys(answers).length === questions.length;
    const isReadyToSubmit = isLastQuestion || allAnswered;
    const progressPct = ((currentIndex + 1) / questions.length) * 100;

    const checkIsCorrect = (q, ansChoice) => {
        if (!ansChoice) return false;
        const correctNorm = q.correct_answer ? String(q.correct_answer).trim().toUpperCase() : '';
        const choiceText = q[`choice_${ansChoice.toLowerCase()}`] ? String(q[`choice_${ansChoice.toLowerCase()}`]).trim().toUpperCase() : '';
        return (ansChoice.toUpperCase() === correctNorm) || (choiceText === correctNorm);
    };

    const choiceConfig = {
        'A': {
            bg: 'bg-[#e21b3c]',
            shadow: '#b3152d',
            shadowHex: '--btn-shadow:#b3152d',
            num: '1'
        },
        'B': {
            bg: 'bg-[#1368ce]',
            shadow: '#0e4e9c',
            shadowHex: '--btn-shadow:#0e4e9c',
            num: '2'
        },
        'C': {
            bg: 'bg-[#d89e00]',
            shadow: '#a87b00',
            shadowHex: '--btn-shadow:#a87b00',
            num: '3'
        },
        'D': {
            bg: 'bg-[#26890c]',
            shadow: '#1a5e08',
            shadowHex: '--btn-shadow:#1a5e08',
            num: '4'
        },
    };

    const isTimerUrgent = mode === 'simulation' && timeLeft < 300;

    return (
        <div className="relative min-h-screen bg-[#46178f] overflow-hidden font-['Nunito','Sarabun',sans-serif] flex flex-col">
            <style>{AAA_CSS}</style>

            {/* ── Dynamic Background ── */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                {/* Multi-layer gradient */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse at 50% -10%, #7c3aed 0%, #46178f 50%, #2d0f6b 100%)'
                }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse at 90% 80%, rgba(99,5,178,0.5) 0%, transparent 60%)'
                }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse at 10% 20%, rgba(124,58,237,0.35) 0%, transparent 50%)'
                }} />

                {/* Floating blurred blobs */}
                {[
                    { w: 340, h: 340, top: '5%', left: '8%', bg: 'rgba(167,51,255,0.18)', blur: 80, anim: 'bg-drift-1 18s infinite ease-in-out' },
                    { w: 280, h: 280, top: '55%', right: '6%', bg: 'rgba(236,72,153,0.15)', blur: 70, anim: 'bg-drift-2 22s infinite ease-in-out' },
                    { w: 240, h: 240, bottom: '10%', left: '15%', bg: 'rgba(139,92,246,0.2)', blur: 60, anim: 'bg-drift-3 16s infinite ease-in-out' },
                    { w: 200, h: 200, top: '30%', right: '25%', bg: 'rgba(251,191,36,0.08)', blur: 50, anim: 'bg-drift-1 28s infinite ease-in-out reverse' },
                ].map((b, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        width: b.w, height: b.h,
                        top: b.top, left: b.left, right: b.right, bottom: b.bottom,
                        background: b.bg,
                        borderRadius: '50%',
                        filter: `blur(${b.blur}px)`,
                        animation: b.anim
                    }} />
                ))}

                {/* Geometric shapes — faster, with glow pulse */}
                <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: '8%', left: '7%', width: 220, opacity: 0.09, fill: '#fff', animation: 'bg-drift-1 12s infinite ease-in-out, bg-pulse-glow 4s infinite ease-in-out' }}>
                    <polygon points="50,8 92,88 8,88" />
                </svg>
                <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: '55%', right: '12%', width: 280, opacity: 0.07, fill: '#fff', animation: 'bg-drift-2 15s infinite ease-in-out, bg-pulse-glow 5s 1s infinite ease-in-out' }}>
                    <polygon points="50,8 92,50 50,92 8,50" />
                </svg>
                <svg viewBox="0 0 100 100" style={{ position: 'absolute', bottom: '5%', left: '18%', width: 260, opacity: 0.07, fill: '#fff', animation: 'bg-drift-3 13s infinite ease-in-out, bg-pulse-glow 3.5s 0.5s infinite ease-in-out' }}>
                    <circle cx="50" cy="50" r="40" />
                </svg>
                <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: '18%', right: '4%', width: 190, opacity: 0.06, fill: '#fff', animation: 'bg-drift-1 17s infinite ease-in-out reverse, bg-pulse-glow 6s 2s infinite ease-in-out' }}>
                    <rect x="14" y="14" width="72" height="72" rx="12" />
                </svg>
                <svg viewBox="0 0 100 100" style={{ position: 'absolute', bottom: '28%', left: '-3%', width: 160, opacity: 0.05, fill: '#fff', animation: 'bg-drift-2 10s infinite ease-in-out reverse' }}>
                    <polygon points="50,8 92,88 8,88" />
                </svg>

                {/* Particle stars */}
                {Array.from({ length: 22 }, (_, i) => {
                    const sizes = [2, 3, 4, 2, 3];
                    const sz = sizes[i % sizes.length];
                    const duration = 3 + (i * 0.37) % 4;
                    const delay = (i * 0.53) % 5;
                    return (
                        <div key={`p${i}`} style={{
                            position: 'absolute',
                            width: sz, height: sz,
                            borderRadius: '50%',
                            background: i % 3 === 0 ? '#f0abfc' : i % 3 === 1 ? '#fde68a' : '#ffffff',
                            top: `${(i * 29 + 7) % 95}%`,
                            left: `${(i * 41 + 13) % 95}%`,
                            animation: `particle-twinkle ${duration}s ${delay}s infinite ease-in-out`
                        }} />
                    );
                })}
            </div>

            {/* Global Navbar */}
            <div className="relative z-50">
                <HomeNavbar />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-grow flex flex-col pt-20 px-4 md:px-8 pb-36">

                {/* ── Top Bar ── */}
                <div className="max-w-5xl mx-auto w-full mb-5">
                    {/* Progress bar */}
                    <div style={{
                        background: 'rgba(255,255,255,0.12)',
                        borderRadius: 99,
                        height: 8,
                        overflow: 'hidden',
                        marginBottom: 10,
                        border: '1px solid rgba(255,255,255,0.15)'
                    }}>
                        <div className="progress-fill" style={{
                            height: '100%',
                            width: `${progressPct}%`,
                            borderRadius: 99,
                        }} />
                    </div>

                    <div className="flex justify-between items-center">
                        {/* Progress text */}
                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: 99,
                            padding: '6px 18px',
                            fontWeight: 800,
                            color: 'white',
                            fontSize: '1rem',
                            border: '1px solid rgba(255,255,255,0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <span style={{ color: '#f0abfc' }}>✦</span>
                            <span>{currentIndex + 1}</span>
                            <span style={{ opacity: 0.5 }}>/ {questions.length}</span>
                        </div>

                        {/* Timer */}
                        {mode === 'simulation' && (
                            <div style={{
                                background: isTimerUrgent ? 'rgba(220,38,38,0.4)' : 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(12px)',
                                borderRadius: 99,
                                padding: '6px 22px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                fontWeight: 900,
                                fontSize: '1.2rem',
                                color: isTimerUrgent ? '#fca5a5' : 'white',
                                border: `1px solid ${isTimerUrgent ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.25)'}`,
                                animation: isTimerUrgent ? 'timer-urgent 1s ease-in-out infinite' : 'none',
                                letterSpacing: '0.05em'
                            }}>
                                <Clock style={{ width: 18, height: 18 }} />
                                {formatTime(timeLeft)}
                            </div>
                        )}

                        {/* Tools */}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setShowFontMenu(!showFontMenu)} style={{
                                background: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.25)',
                                borderRadius: '50%',
                                width: 40, height: 40,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', cursor: 'pointer',
                                transition: 'background 0.2s'
                            }} aria-label="ปรับขนาดตัวอักษร">
                                <Type style={{ width: 18, height: 18 }} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Question Card ── */}
                <div className="max-w-5xl mx-auto w-full mb-6">
                    <div key={`q-${questionKey}`} style={{
                        animation: 'slide-in-right 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                        background: 'rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        borderRadius: '1.75rem',
                        padding: '2rem 2.5rem',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
                        position: 'relative'
                    }}>
                        {/* Question ID */}
                        <div style={{ position: 'absolute', top: 16, left: 20, color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.1em' }}>
                            ID: {currentQuestion.id}
                        </div>
                        {/* Quick actions */}
                        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
                            {[
                                {
                                    onClick: toggleFlag,
                                    active: flagged[currentQuestion.id],
                                    icon: <Flag style={{ width: 16, height: 16 }} fill={flagged[currentQuestion.id] ? "currentColor" : "none"} />,
                                    activeStyle: { background: '#fbbf24', color: '#78350f' },
                                    title: 'ปักหมุด'
                                },
                                {
                                    onClick: handleBookmark,
                                    icon: <Bookmark style={{ width: 16, height: 16 }} />,
                                    title: 'บันทึก'
                                },
                                {
                                    onClick: () => setShowReportModal(true),
                                    icon: <AlertTriangle style={{ width: 16, height: 16 }} />,
                                    title: 'แจ้งปัญหา'
                                }
                            ].map((btn, i) => (
                                <button key={i} onClick={btn.onClick} title={btn.title} style={{
                                    background: btn.active && btn.activeStyle ? btn.activeStyle.background : 'rgba(255,255,255,0.15)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '50%',
                                    width: 34, height: 34,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: btn.active && btn.activeStyle ? btn.activeStyle.color : 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    ...(btn.active && btn.activeStyle ? btn.activeStyle : {})
                                }}>
                                    {btn.icon}
                                </button>
                            ))}
                        </div>

                        <h3 style={{
                            color: 'white',
                            fontWeight: 900,
                            fontSize: `${1.35 * fontSizeScale}rem`,
                            lineHeight: 1.6,
                            marginTop: '1.5rem',
                            marginBottom: '0.5rem',
                            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}>
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtml(currentQuestion.question_text)) }} />
                        </h3>
                        {currentQuestion.question_image && (
                            <img
                                src={currentQuestion.question_image}
                                alt="Question"
                                onClick={() => setFullScreenImage(currentQuestion.question_image)}
                                style={{
                                    marginTop: 16,
                                    marginInline: 'auto',
                                    maxWidth: '100%',
                                    maxHeight: 240,
                                    objectFit: 'contain',
                                    borderRadius: 12,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                    cursor: 'pointer',
                                    display: 'block',
                                    transition: 'transform 0.2s'
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* ── Choice Buttons ── */}
                <div key={`choices-${questionKey}`} className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {['A', 'B', 'C', 'D'].map((choice, idx) => {
                        const cfg = choiceConfig[choice];
                        const isSelected = answers[currentQuestion.id] === choice;
                        const ripple = ripples[choice];
                        return (
                            <button
                                key={choice}
                                onClick={(e) => handleAnswer(choice, e)}
                                className={`choice-btn ${cfg.bg} ${isSelected ? 'selected' : ''} stagger-${idx}`}
                                style={{
                                    animation: `choice-stagger-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both`,
                                    animationDelay: `${idx * 80}ms`,
                                    padding: '20px 24px',
                                    borderRadius: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 16,
                                    boxShadow: isSelected
                                        ? `0 0 0 3px white, 0 0 0 6px rgba(255,255,255,0.3), 0 8px 0 ${cfg.shadow}`
                                        : `0 8px 0 ${cfg.shadow}`,
                                    border: 'none',
                                    cursor: 'pointer',
                                    ['--btn-shadow']: cfg.shadow,
                                    transition: 'box-shadow 0.12s ease',
                                    textAlign: 'left',
                                    width: '100%',
                                }}
                            >
                                {/* Ripple */}
                                {ripple && (
                                    <span key={ripple.id} className="choice-ripple" style={{ left: ripple.x, top: ripple.y }} />
                                )}
                                {/* Number badge */}
                                <span className="choice-badge">{cfg.num}</span>
                                {/* Text */}
                                <span style={{
                                    fontWeight: 800,
                                    color: 'white',
                                    fontSize: `${1.05 * fontSizeScale}rem`,
                                    lineHeight: 1.4,
                                    textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                                    flexGrow: 1
                                }}>
                                    {currentQuestion[`choice_${choice.toLowerCase()}`]}
                                </span>
                                {/* Selected checkmark */}
                                {isSelected && (
                                    <span style={{
                                        flexShrink: 0,
                                        width: 28, height: 28,
                                        background: 'rgba(255,255,255,0.3)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1rem'
                                    }}>✓</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── Explanation (Practice Mode) ── */}
                {mode === 'practice' && isAnswered && (() => {
                    const correct = checkIsCorrect(currentQuestion, answers[currentQuestion.id]);
                    return (
                        <div className="max-w-5xl mx-auto w-full mt-8">
                            <div style={{
                                padding: '2rem',
                                borderRadius: '1.75rem',
                                background: correct
                                    ? 'linear-gradient(135deg, rgba(21,128,61,0.35) 0%, rgba(22,101,52,0.2) 100%)'
                                    : 'linear-gradient(135deg, rgba(185,28,28,0.35) 0%, rgba(153,27,27,0.2) 100%)',
                                backdropFilter: 'blur(16px)',
                                border: `1px solid ${correct ? 'rgba(74,222,128,0.35)' : 'rgba(248,113,113,0.35)'}`,
                                animation: correct
                                    ? 'feedback-scale-in 0.4s cubic-bezier(0.22,1,0.36,1) both, correct-glow 2s ease-in-out infinite'
                                    : 'feedback-scale-in 0.3s ease both, shake 0.4s ease 0.1s, wrong-glow 2s ease-in-out infinite',
                            }}>
                                <h4 style={{
                                    fontWeight: 900,
                                    fontSize: '1.6rem',
                                    marginBottom: '1rem',
                                    color: correct ? '#4ade80' : '#f87171',
                                    textShadow: correct ? '0 0 20px rgba(74,222,128,0.5)' : '0 0 20px rgba(248,113,113,0.5)',
                                    letterSpacing: '0.01em'
                                }}>
                                    {correct ? '🎉 สุดยอด! ตอบถูก' : '❌ อ๊ะ! ยังไม่ถูกนะ'}
                                </h4>
                                <div style={{ color: 'white', fontSize: '1rem', fontWeight: 600, lineHeight: 1.7 }}>
                                    <span style={{
                                        background: 'rgba(255,255,255,0.18)',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        borderRadius: 8,
                                        padding: '4px 12px',
                                        marginRight: 8,
                                        fontWeight: 900,
                                        letterSpacing: '0.05em'
                                    }}>
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
                        </div>
                    );
                })()}
            </div>

            {/* ── Bottom Navigation ── */}
            <div style={{
                position: 'fixed',
                bottom: 0, left: 0, right: 0,
                background: 'rgba(30,10,70,0.6)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255,255,255,0.12)',
                padding: '12px 24px',
                zIndex: 50,
                boxShadow: '0 -8px 32px rgba(0,0,0,0.3)'
            }}>
                <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        onClick={() => navigateToQuestion(Math.max(0, currentIndex - 1))}
                        disabled={currentIndex === 0}
                        style={{
                            width: 52, height: 52,
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white',
                            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                            opacity: currentIndex === 0 ? 0.3 : 1,
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}
                    >
                        <ChevronLeft style={{ width: 26, height: 26 }} />
                    </button>

                    <button
                        onClick={isReadyToSubmit ? handleSubmit : () => navigateToQuestion(Math.min(questions.length - 1, currentIndex + 1))}
                        style={{
                            background: isReadyToSubmit
                                ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                                : 'rgba(255,255,255,0.95)',
                            color: isReadyToSubmit ? 'white' : '#46178f',
                            border: 'none',
                            borderRadius: 99,
                            padding: isReadyToSubmit ? '14px 36px' : '0',
                            width: isReadyToSubmit ? 'auto' : 52,
                            height: isReadyToSubmit ? 'auto' : 52,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: isReadyToSubmit ? '1.1rem' : '1rem',
                            cursor: 'pointer',
                            boxShadow: isReadyToSubmit
                                ? '0 6px 0 #14532d, 0 8px 20px rgba(22,163,74,0.4)'
                                : '0 4px 0 rgba(0,0,0,0.2)',
                            transition: 'all 0.15s',
                            letterSpacing: isReadyToSubmit ? '0.02em' : 0
                        }}
                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                        onMouseLeave={e => e.currentTarget.style.filter = ''}
                        onMouseDown={e => {
                            e.currentTarget.style.transform = 'translateY(5px)';
                            e.currentTarget.style.boxShadow = isReadyToSubmit ? '0 1px 0 #14532d' : '0 0 0 rgba(0,0,0,0.2)';
                        }}
                        onMouseUp={e => {
                            e.currentTarget.style.transform = '';
                            e.currentTarget.style.boxShadow = isReadyToSubmit ? '0 6px 0 #14532d, 0 8px 20px rgba(22,163,74,0.4)' : '0 4px 0 rgba(0,0,0,0.2)';
                        }}
                    >
                        {isReadyToSubmit ? '🚀 ส่งคำตอบเลย!' : <ChevronRight style={{ width: 26, height: 26 }} />}
                    </button>
                </div>
            </div>

            {/* Floating tools */}
            {showFontMenu && <FontResizer onResize={setFontSizeScale} currentSize={fontSizeScale} />}
            <PermissionGate requiredTier="premium" type="hide">
                <AmbiencePlayer />
            </PermissionGate>
            <PacingAlert timeUsed={(questions.length * 60) - timeLeft} totalTime={questions.length * 60} />
            {showReportModal && <ReportModal questionId={currentQuestion.id} onClose={() => setShowReportModal(false)} />}

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

            {/* Full Screen Image */}
            {fullScreenImage && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 99999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.92)',
                        backdropFilter: 'blur(8px)',
                        cursor: 'pointer',
                        padding: 16,
                        animation: 'feedback-scale-in 0.25s ease both'
                    }}
                    onClick={() => setFullScreenImage(null)}
                >
                    <img src={fullScreenImage} alt="Full Screen Question" style={{
                        maxWidth: '100%', maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: 16,
                        boxShadow: '0 0 60px rgba(167,51,255,0.4)'
                    }} />
                </div>
            )}
        </div>
    );
};

export default ExamTaking;
