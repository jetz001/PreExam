import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
    Clock,
    AlertTriangle,
    Triangle,
    Diamond,
    Circle,
    Square,
    Loader2,
    Sparkles,
    ArrowLeft
} from 'lucide-react';
import ReportModal from './exam/ReportModal';
import AmbiencePlayer from './exam/AmbiencePlayer';
import QuestionNote from './exam/QuestionNote';
import FontResizer from './exam/FontResizer';
import PermissionGate from './common/PermissionGate';
import useUserRole from '../hooks/useUserRole';
import PacingAlert from './exam/PacingAlert';

import DOMPurify from 'dompurify';
import HomeNavbar from './HomeNavbar';

const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    let decoded = html;
    let limit = 5; // Max recursion depth to prevent infinite loops
    while (limit > 0 && decoded) {
        txt.innerHTML = decoded;
        const next = txt.value;
        if (next === decoded) break;
        decoded = next;
        limit--;
    }
    return decoded;
};

// Authentic Kahoot! brand colors & chunky shadows
const choiceStyles = {
    'A': 'bg-gradient-to-br from-[#e21b3c] to-[#c91835] hover:brightness-110 shadow-[0_6px_0_#9f122a] border border-white/25',
    'B': 'bg-gradient-to-br from-[#1368ce] to-[#0f54a8] hover:brightness-110 shadow-[0_6px_0_#0b4082] border border-white/25',
    'C': 'bg-gradient-to-br from-[#e5a600] to-[#c78f00] hover:brightness-110 shadow-[0_6px_0_#9c6f00] border border-white/25',
    'D': 'bg-gradient-to-br from-[#26890c] to-[#1e6e09] hover:brightness-110 shadow-[0_6px_0_#155106] border border-white/25'
};

// Helper geometric shape icons
const ShapeIcon = ({ choice }) => {
    const iconProps = { className: 'w-6 h-6 text-white fill-white/95 drop-shadow-sm', strokeWidth: 2.2 };
    switch (choice) {
        case 'A': return <Triangle {...iconProps} />;
        case 'B': return <Diamond {...iconProps} />;
        case 'C': return <Circle {...iconProps} />;
        case 'D': return <Square {...iconProps} />;
        default: return <span className="text-white text-xl font-black">{choice}</span>;
    }
};

const MultiplayerExam = forwardRef(({ questions, socket, roomId, userId, onFinish, onPersistFinish, onScoreChange, onProgressChange, timeLimit }, ref) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(0);
    const parsedTimeLimit = parseInt(timeLimit, 10);
    const validTimeLimit = (isNaN(parsedTimeLimit) || parsedTimeLimit <= 0) ? questions.length : parsedTimeLimit;
    const initialTime = validTimeLimit * 60;
    const [timeLeft, setTimeLeft] = useState(initialTime); // Default to 1 min/question if not set
    const [showReportModal, setShowReportModal] = useState(false);
    const [fontSizeScale, setFontSizeScale] = useState(1);
    const { isPremium } = useUserRole();
    const [isStarting, setIsStarting] = useState(true);
    const [countdown, setCountdown] = useState(3);

    useImperativeHandle(ref, () => ({
        submitExam: () => {
            handleFinish(score);
        }
    }));

    useEffect(() => {
        if (isStarting) {
            const countdownTimer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownTimer);
                        setTimeout(() => setIsStarting(false), 800); // Show "GO!" briefly
                        return "GO!";
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(countdownTimer);
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleFinish(score);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [onFinish, score, answers, isStarting]);

    const handleFinish = async (finalScore, answersOverride) => {
        const timeTaken = initialTime - timeLeft;
        const finalAnswers = answersOverride || answers;
        if (socket) {
            socket.emit('finish_exam', { roomId, userId, score: finalScore, timeTaken, answers: finalAnswers });
        } else if (onPersistFinish) {
            await onPersistFinish({ roomId, userId, score: finalScore, timeTaken, answers: finalAnswers });
        }
        onFinish(finalScore, finalAnswers);
    };

    const handleAnswer = (choice) => {
        const currentQuestion = questions[currentIndex];
        // Robust comparison: check if correct_answer matches the letter (A, B, C, D) OR the actual text of the choice
        const correctNorm = currentQuestion.correct_answer ? String(currentQuestion.correct_answer).trim().toUpperCase() : '';
        const choiceText = currentQuestion[`choice_${choice.toLowerCase()}`] ? String(currentQuestion[`choice_${choice.toLowerCase()}`]).trim().toUpperCase() : '';
        const isCorrect = (choice === correctNorm) || (choiceText === correctNorm);

        // Update local state
        const newAnswers = { ...answers, [currentQuestion.id]: choice };
        setAnswers(newAnswers);

        // Calculate new score
        let newScore = score;
        if (isCorrect) {
            newScore += 1;
            setScore(newScore);
        }

        // Emit score update to server
        if (socket) {
            socket.emit('submit_score', { roomId, userId, score: newScore });
        }
        onScoreChange?.(newScore);

        // Auto advance after short delay
        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                const nextIndex = currentIndex + 1;
                setCurrentIndex(nextIndex);
                if (socket) {
                    socket.emit('submit_progress', { roomId, userId, questionIndex: nextIndex });
                }
                onProgressChange?.(nextIndex);
            } else {
                if (socket) {
                    socket.emit('submit_progress', { roomId, userId, questionIndex: questions.length });
                }
                onProgressChange?.(questions.length);
                void handleFinish(newScore, newAnswers);
            }
        }, 500);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (!questions || questions.length === 0) return (
        <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#371172] via-[#46178f] to-[#1e1b4b] flex flex-col items-center justify-center p-4">
            <div className="absolute top-0 left-0 right-0 z-50">
                <HomeNavbar />
            </div>
            <div className="flex flex-col items-center justify-center text-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl max-w-md w-full">
                <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center mb-5">
                    <Loader2 className="w-8 h-8 text-amber-300 animate-spin" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6">กำลังโหลดชุดข้อสอบ...</h2>
                <button
                    onClick={() => window.location.href = '/lobby'}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-7 rounded-full shadow-lg border border-rose-300/40 flex items-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>กลับสู่ห้องรวม</span>
                </button>
            </div>
        </div>
    );

    if (isStarting) return (
        <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#371172] via-[#46178f] to-[#1e1b4b] flex flex-col items-center justify-center p-4">
            <div className="absolute top-0 left-0 right-0 z-50">
                <HomeNavbar />
            </div>
            <div className="flex flex-col items-center justify-center text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-amber-200 font-extrabold text-sm mb-6">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>เตรียมตัวให้พร้อม</span>
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-8 drop-shadow-lg tracking-tight">
                    Get Ready!
                </h2>
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-[2.5rem] bg-white/15 backdrop-blur-xl border-2 border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.45)] flex items-center justify-center animate-bounce">
                    <span className="text-7xl sm:text-8xl font-black text-amber-300 drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]">
                        {countdown}
                    </span>
                </div>
            </div>
        </div>
    );

    const currentQuestion = questions[currentIndex];
    const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

    return (
        <div className="flex flex-col h-full overflow-hidden w-full max-w-5xl mx-auto font-['Nunito','Sarabun',sans-serif]">
            {/* Header & Progress */}
            <div className="bg-slate-950/35 backdrop-blur-xl rounded-2xl px-4 sm:px-5 py-3 mb-4 sm:mb-5 shadow-lg border border-white/20 w-full">
                <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2.5 text-base sm:text-xl font-black text-white">
                        <span className="px-3 py-1 rounded-xl bg-white/15 border border-white/20 text-sm sm:text-base">
                            ข้อที่ {currentIndex + 1} <span className="text-white/75 font-bold">/ {questions.length}</span>
                        </span>
                    </div>
                    <div
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-base sm:text-lg font-black border ${
                            timeLeft < 300
                                ? 'bg-rose-500/25 border-rose-400/50 text-rose-200 animate-pulse'
                                : 'bg-white/15 border-white/20 text-white'
                        }`}
                    >
                        <Clock className="h-5 w-5 shrink-0" />
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                </div>
                <div className="mt-2.5 h-2 w-full bg-white/15 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-amber-300 via-yellow-400 to-emerald-400 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar pb-4 pr-1">
                {/* Question Area */}
                <div className="bg-slate-950/35 backdrop-blur-xl border border-white/25 rounded-3xl p-4 sm:p-7 md:p-9 shadow-2xl relative w-full mb-5">
                    {/* Non-overlapping Metadata & Actions Header */}
                    <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/15">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/12 border border-white/15 text-white/85 text-xs font-mono font-bold tracking-wider">
                            ID: #{currentQuestion.id}
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowReportModal(true)}
                            aria-label="แจ้งปัญหาข้อสอบ"
                            title="แจ้งปัญหา"
                            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-amber-200 border border-white/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer"
                        >
                            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                    </div>

                    <div
                        className="text-white font-bold text-left leading-relaxed drop-shadow-sm break-words"
                        style={{ fontSize: `${1.25 * fontSizeScale}rem` }}
                    >
                        <div
                            className="whitespace-pre-line"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtml(currentQuestion.question_text)) }}
                        />
                    </div>
                    {currentQuestion.question_image && (
                        <img
                            src={currentQuestion.question_image}
                            alt="ภาพประกอบโจทย์"
                            className="mt-5 mx-auto max-w-full max-h-64 object-contain rounded-2xl border border-white/25 shadow-lg bg-white/5"
                        />
                    )}

                    {/* Premium Tools: Question Note */}
                    <PermissionGate requiredTier="premium" type="hide">
                        <div className="mt-4">
                            <QuestionNote questionId={currentQuestion.id} />
                        </div>
                    </PermissionGate>
                </div>

                {/* Choices (Kahoot Style 2x2 Grid -> 1-col on mobile) */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 pb-6">
                    {['A', 'B', 'C', 'D'].map((choice) => {
                        const isSelected = answers[currentQuestion.id] === choice;
                        const isAnswered = Boolean(answers[currentQuestion.id]);
                        return (
                            <button
                                key={choice}
                                type="button"
                                onClick={() => handleAnswer(choice)}
                                disabled={isAnswered}
                                className={`relative p-4 sm:p-6 rounded-2xl flex items-center gap-4 text-left transform transition-all duration-150 active:translate-y-[5px] active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80 cursor-pointer
                                    ${choiceStyles[choice]}
                                    ${isSelected ? 'ring-4 ring-white ring-offset-2 ring-offset-[#3b1285] scale-[1.01]' : ''}
                                    ${isAnswered && !isSelected ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                                `}
                            >
                                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
                                    <ShapeIcon choice={choice} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="inline-block text-[11px] font-black uppercase tracking-wider text-white/80 mb-0.5">
                                        ตัวเลือก {choice}
                                    </span>
                                    <div
                                        className="font-bold text-white text-base sm:text-xl leading-snug break-words drop-shadow-xs"
                                        style={{ fontSize: `${1.1 * fontSizeScale}rem` }}
                                    >
                                        {currentQuestion[`choice_${choice.toLowerCase()}`]}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Floating Tools */}
            <FontResizer onResize={setFontSizeScale} currentSize={fontSizeScale} />

            <PermissionGate requiredTier="premium" type="hide">
                <AmbiencePlayer />
            </PermissionGate>

            <PacingAlert timeUsed={initialTime - timeLeft} totalTime={initialTime} />

            {
                showReportModal && (
                    <ReportModal
                        questionId={currentQuestion.id}
                        onClose={() => setShowReportModal(false)}
                    />
                )
            }
        </div>
    );
});

export default MultiplayerExam;
