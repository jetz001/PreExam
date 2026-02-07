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
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-white shadow px-4 py-3 flex justify-between items-center mb-4 rounded-lg">
                <div className="text-lg font-bold">
                    ข้อที่ {currentIndex + 1} / {questions.length}
                </div>
                <div className={`flex items-center text-xl font-mono ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                    <Clock className="mr-2 h-5 w-5" />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Question Area */}
            <div className="bg-white p-6 rounded-lg shadow flex-1 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl text-gray-900 font-medium" style={{ fontSize: `${1.25 * fontSizeScale}rem`, lineHeight: '1.5' }}>
                        <div className="inline" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtml(currentQuestion.question_text)) }} />
                        <span className="inline-block text-xs text-gray-400 font-normal ml-2 bg-gray-100 px-2 py-0.5 rounded-full align-middle">
                            #{currentQuestion.id}
                        </span>
                    </h3>
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="แจ้งปัญหา"
                    >
                        <AlertTriangle className="h-5 w-5" />
                    </button>
                </div>

                {currentQuestion.question_image && (
                    <img src={currentQuestion.question_image} alt="Question" className="mb-4 max-w-full h-auto rounded" />
                )}

                <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((choice) => (
                        <button
                            key={choice}
                            onClick={() => handleAnswer(choice)}
                            disabled={answers[currentQuestion.id]}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${answers[currentQuestion.id] === choice
                                ? 'border-primary bg-blue-50 text-primary'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white text-gray-900'
                                }`}
                        >
                            <span className="font-bold mr-2" style={{ fontSize: `${1 * fontSizeScale}rem` }}>{choice}.</span>
                            <span style={{ fontSize: `${1 * fontSizeScale}rem` }}>{currentQuestion[`choice_${choice.toLowerCase()}`]}</span>
                        </button>
                    ))}
                </div>

                {/* Premium Tools: Question Note */}
                <PermissionGate requiredTier="premium" type="hide">
                    <QuestionNote questionId={currentQuestion.id} />
                </PermissionGate>
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
