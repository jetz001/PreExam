import React, { useState, useEffect } from 'react';
import {
    ChevronRight,
    Eye,
    CheckCircle2,
    Users,
    Lightbulb,
    Triangle,
    Diamond,
    Circle,
    Square,
    Loader2
} from 'lucide-react';
import DOMPurify from 'dompurify';

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

const ChoiceShape = ({ choice }) => {
    const props = { className: 'w-5 h-5 sm:w-6 sm:h-6 text-white fill-white/95', strokeWidth: 2.2 };
    switch (choice) {
        case 'A': return <Triangle {...props} />;
        case 'B': return <Diamond {...props} />;
        case 'C': return <Circle {...props} />;
        case 'D': return <Square {...props} />;
        default: return <span className="font-black text-white">{choice}</span>;
    }
};

const TutorView = ({ questions, socket, roomId, isHost, currentQuestionIndex, participantCount = 0, answerCounts = {}, onNavigateQuestion, onRevealAnswer }) => {
    const [localIndex, setLocalIndex] = useState(currentQuestionIndex || 0);
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

    useEffect(() => {
        setLocalIndex(currentQuestionIndex);
        setIsAnswerRevealed(false); // reset when index changes
    }, [currentQuestionIndex]);

    const handleNext = () => {
        if (isHost) {
            const newIndex = Math.min(questions.length - 1, localIndex + 1);
            setLocalIndex(newIndex);
            setIsAnswerRevealed(false);
            if (onNavigateQuestion) onNavigateQuestion(newIndex);
            else socket?.emit('tutor_navigate', { roomId, questionIndex: newIndex });
        }
    };

    const handleRevealAnswer = () => {
        if (isHost) {
            setIsAnswerRevealed(true);
            if (onRevealAnswer) onRevealAnswer(localIndex);
            else socket?.emit('tutor_show_answer', { roomId, questionIndex: localIndex });
        }
    };

    if (!questions || questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[260px] text-white text-center p-6">
                <Loader2 className="w-10 h-10 animate-spin text-amber-300 mb-3" />
                <p className="font-bold text-xl">กำลังโหลดชุดข้อสอบ...</p>
            </div>
        );
    }

    const currentQuestion = questions[localIndex];
    // Some questions have choices in an object or as choice_a, choice_b.
    const choices = currentQuestion.choices || {
        A: currentQuestion.choice_a || currentQuestion.choice_A,
        B: currentQuestion.choice_b || currentQuestion.choice_B,
        C: currentQuestion.choice_c || currentQuestion.choice_C,
        D: currentQuestion.choice_d || currentQuestion.choice_D,
    };
    const choiceColors = {
        A: 'bg-gradient-to-br from-[#e21b3c] to-[#c91835] shadow-[0_5px_0_#9f122a] border border-white/25',
        B: 'bg-gradient-to-br from-[#1368ce] to-[#0f54a8] shadow-[0_5px_0_#0b4082] border border-white/25',
        C: 'bg-gradient-to-br from-[#e5a600] to-[#c78f00] shadow-[0_5px_0_#9c6f00] border border-white/25',
        D: 'bg-gradient-to-br from-[#26890c] to-[#1e6e09] shadow-[0_5px_0_#155106] border border-white/25'
    };

    return (
        <div
            className="flex flex-col h-full bg-slate-50/95 backdrop-blur-md rounded-2xl border border-white/60 shadow-inner relative overflow-hidden"
            style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
        >
            {/* Header */}
            <div className="bg-white/95 backdrop-blur-md shadow-xs px-4 sm:px-6 py-3.5 flex flex-wrap justify-between items-center gap-3 z-10 border-b border-slate-200/80">
                <div className="text-lg sm:text-2xl font-black text-slate-800 flex items-center gap-2">
                    <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-3 py-1 rounded-xl shadow-xs">
                        {localIndex + 1}
                    </span>
                    <span className="text-slate-600 text-base sm:text-lg font-bold">/ {questions.length} ข้อ</span>
                </div>
                <div className="flex gap-3 items-center">
                    <div className="text-sm sm:text-base font-bold text-slate-700 bg-indigo-50 px-3.5 py-2 rounded-xl border border-indigo-200/80 flex items-center gap-2">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
                        <span>ผู้เล่นทั้งหมด:</span>
                        <span className="text-indigo-700 font-black">{participantCount}</span>
                    </div>
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center p-4 sm:p-6 md:p-8 z-10 w-full max-w-5xl mx-auto">
                <div className="bg-white px-5 sm:px-8 py-6 sm:py-8 w-full rounded-2xl sm:rounded-3xl shadow-md border border-slate-200/90 mb-5 sm:mb-7 text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 leading-relaxed break-words">
                        <div className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtml(currentQuestion.question_text || '')) }} />
                    </h2>
                </div>

                {currentQuestion.question_image && (
                    <img
                        src={currentQuestion.question_image}
                        alt="ภาพประกอบโจทย์"
                        className="mb-6 max-h-[30vh] object-contain rounded-2xl shadow-md border-4 border-white bg-white"
                    />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 w-full mt-auto">
                    {['A', 'B', 'C', 'D'].map((choice) => {
                        const correctNorm = currentQuestion.correct_answer ? String(currentQuestion.correct_answer).toUpperCase() : '';
                        const isCorrect = correctNorm === choice;
                        const opacityClass = isAnswerRevealed ? (isCorrect ? 'opacity-100 ring-4 ring-emerald-400' : 'opacity-40') : 'opacity-100';
                        const count = answerCounts[choice] || 0;

                        return (
                            <div
                                key={choice}
                                className={`${choiceColors[choice]} ${opacityClass} text-white text-left p-4 sm:p-5 rounded-2xl transition-all duration-300 relative flex items-center gap-3.5`}
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/25 flex items-center justify-center shrink-0">
                                    <ChoiceShape choice={choice} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="block text-[11px] font-black uppercase tracking-wider text-white/80">
                                        ตัวเลือก {choice}
                                    </span>
                                    <span className="text-base sm:text-xl font-bold drop-shadow-xs break-words block leading-snug">
                                        {choices[choice]}
                                    </span>
                                </div>
                                {isAnswerRevealed && (
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/15">
                                            <Users className="w-4 h-4" />
                                            <span className="text-sm sm:text-base font-black">{count}</span>
                                        </div>
                                        {isCorrect && (
                                            <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-md shrink-0" />
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {isAnswerRevealed && currentQuestion.explanation && (
                    <div className="w-full mt-6 bg-sky-50 border-2 border-sky-300 p-4 sm:p-6 rounded-2xl text-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-4 text-left">
                        <h4 className="text-base sm:text-lg font-black mb-1.5 flex items-center gap-2 text-sky-800">
                            <span className="w-8 h-8 rounded-xl bg-sky-200/80 text-sky-700 flex items-center justify-center shrink-0">
                                <Lightbulb className="w-4 h-4" strokeWidth={2.5} />
                            </span>
                            <span>คำอธิบาย (Explanation)</span>
                        </h4>
                        <p className="text-sm sm:text-base font-semibold text-slate-700 whitespace-pre-line leading-relaxed">
                            {currentQuestion.explanation}
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation (Host Only) */}
            {isHost && (
                <div className="bg-white/95 backdrop-blur-md px-4 sm:px-6 py-4 shadow-lg border-t border-slate-200/80 z-10 flex flex-wrap justify-between items-center gap-3">
                    <div className="text-slate-600 font-bold text-sm sm:text-base">
                        คุณคือโฮสต์ผู้ควบคุมเกม
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto justify-end">
                        {!isAnswerRevealed ? (
                            <button
                                type="button"
                                onClick={handleRevealAnswer}
                                className="w-full sm:w-auto bg-gradient-to-r from-[#1368ce] to-[#2563eb] hover:brightness-110 text-white px-6 py-3 rounded-xl font-black text-base sm:text-lg shadow-[0_4px_0_#0e55a3] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
                            >
                                <Eye size={20} /> เฉลยคำตอบ
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={localIndex === questions.length - 1}
                                className="w-full sm:w-auto bg-gradient-to-r from-[#26890c] to-[#16a34a] hover:brightness-110 text-white px-6 py-3 rounded-xl font-black text-base sm:text-lg shadow-[0_4px_0_#15803d] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
                            >
                                ถัดไป <ChevronRight size={20} />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutorView;
