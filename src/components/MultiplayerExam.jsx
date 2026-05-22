import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import ReportModal from './exam/ReportModal';
import AmbiencePlayer from './exam/AmbiencePlayer';
import QuestionNote from './exam/QuestionNote';
import FontResizer from './exam/FontResizer';
import PermissionGate from './common/PermissionGate';
import useUserRole from '../hooks/useUserRole';
import PacingAlert from './exam/PacingAlert';

import DOMPurify from 'dompurify';

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
    'A': 'bg-[#e21b3c] hover:bg-[#c91835] shadow-[0_6px_0_#b3152d]', // Triangle (Red)
    'B': 'bg-[#1368ce] hover:bg-[#105bb5] shadow-[0_6px_0_#0e4e9c]', // Diamond (Blue)
    'C': 'bg-[#d89e00] hover:bg-[#c28e00] shadow-[0_6px_0_#a87b00]', // Circle (Yellow/Mustard)
    'D': 'bg-[#26890c] hover:bg-[#20750a] shadow-[0_6px_0_#1a5e08]'  // Square (Green)
};

// Helper shapes
const ShapeIcon = ({ choice }) => {
    switch (choice) {
        case 'A': return <svg viewBox="0 0 32 32" className="w-8 h-8 fill-white"><path d="M16 4L4 26h24L16 4z"/></svg>;
        case 'B': return <svg viewBox="0 0 32 32" className="w-8 h-8 fill-white"><path d="M16 4l12 12-12 12L4 16 16 4z"/></svg>;
        case 'C': return <svg viewBox="0 0 32 32" className="w-8 h-8 fill-white"><circle cx="16" cy="16" r="12"/></svg>;
        case 'D': return <svg viewBox="0 0 32 32" className="w-8 h-8 fill-white"><rect x="6" y="6" width="20" height="20" rx="3"/></svg>;
        default: return null;
    }
};

const MultiplayerExam = forwardRef(({ questions, socket, roomId, userId, onFinish, timeLimit }, ref) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(0);
    const initialTime = (timeLimit || questions.length) * 60;
    const [timeLeft, setTimeLeft] = useState(initialTime); // Default to 1 min/question if not set
    const [showReportModal, setShowReportModal] = useState(false);
    const [fontSizeScale, setFontSizeScale] = useState(1);
    const { isPremium } = useUserRole();

    useImperativeHandle(ref, () => ({
        submitExam: () => {
            handleFinish(score);
        }
    }));

    useEffect(() => {
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
    }, [onFinish, score, answers]);

    const handleFinish = (finalScore, answersOverride) => {
        const timeTaken = initialTime - timeLeft;
        const finalAnswers = answersOverride || answers;
        socket.emit('finish_exam', { roomId, userId, score: finalScore, timeTaken });
        onFinish(finalScore, finalAnswers);
    };

    const handleAnswer = (choice) => {
        const currentQuestion = questions[currentIndex];
        // Robust comparison
        const correctNorm = currentQuestion.correct_answer ? String(currentQuestion.correct_answer).trim().toUpperCase() : '';
        const isCorrect = choice === correctNorm;

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
        socket.emit('submit_score', { roomId, userId, score: newScore });

        // Auto advance after short delay
        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                handleFinish(newScore, newAnswers);
            }
        }, 500);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (!questions || questions.length === 0) return <div>Loading questions...</div>;

    const currentQuestion = questions[currentIndex];

    return (
        <div className="flex flex-col h-full overflow-hidden w-full max-w-5xl mx-auto font-['Nunito','Sarabun',sans-serif]">
            {/* Header */}
            <div className="bg-white/20 backdrop-blur-md rounded-full px-5 py-3 mb-6 shadow-lg border border-white/30 flex justify-between items-center w-full">
                <div className="text-xl font-black text-white">
                    ข้อที่ {currentIndex + 1} <span className="opacity-70">/ {questions.length}</span>
                </div>
                <div className={`flex items-center text-xl font-black ${timeLeft < 300 ? 'text-[#ff6b8a] animate-pulse' : 'text-white'}`}>
                    <Clock className="mr-2 h-6 w-6" />
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar pb-4 pr-2">
                {/* Question Area */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] p-6 md:p-12 shadow-xl relative w-full mb-6">
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
                            title="แจ้งปัญหา"
                        >
                            <AlertTriangle className="h-5 w-5" />
                        </button>
                    </div>

                    <h3 className="text-white font-black text-2xl md:text-4xl text-center leading-relaxed mt-4 mb-4 drop-shadow-md" style={{ fontSize: `${1.4 * fontSizeScale}rem` }}>
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtml(currentQuestion.question_text)) }} />
                        <span className="block text-sm text-white/50 font-normal mt-2">
                            #{currentQuestion.id}
                        </span>
                    </h3>
                    {currentQuestion.question_image && (
                        <img src={currentQuestion.question_image} alt="Question" className="mt-6 mx-auto max-w-full h-64 object-contain rounded-xl border border-white/20 shadow-lg" />
                    )}

                    {/* Premium Tools: Question Note */}
                    <PermissionGate requiredTier="premium" type="hide">
                        <QuestionNote questionId={currentQuestion.id} />
                    </PermissionGate>
                </div>

                {/* Choices (Kahoot Style 2x2 Grid) */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-8">
                    {['A', 'B', 'C', 'D'].map((choice) => {
                        const isSelected = answers[currentQuestion.id] === choice;
                        return (
                            <button
                                key={choice}
                                onClick={() => handleAnswer(choice)}
                                disabled={answers[currentQuestion.id]}
                                className={`relative p-6 md:p-8 rounded-[1rem] flex items-center transform transition-all duration-100 active:translate-y-[6px] active:shadow-none
                                    ${choiceStyles[choice]} 
                                    ${isSelected ? 'ring-4 ring-white ring-offset-4 ring-offset-[#46178f] scale-[1.02]' : 'hover:brightness-110'}
                                    ${answers[currentQuestion.id] && !isSelected ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                                `}
                            >
                                <div className="mr-6 flex-shrink-0">
                                    <ShapeIcon choice={choice} />
                                </div>
                                <span className="font-bold text-white text-xl md:text-2xl text-left drop-shadow-sm leading-tight" style={{ fontSize: `${1.2 * fontSizeScale}rem` }}>
                                    {currentQuestion[`choice_${choice.toLowerCase()}`]}
                                </span>
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
        </div >
    );
});

export default MultiplayerExam;
