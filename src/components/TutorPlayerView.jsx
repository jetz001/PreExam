import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Hourglass, Trophy, PartyPopper, Frown } from 'lucide-react';
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

const choiceStyles = {
    'A': 'bg-gradient-to-br from-[#e21b3c] to-[#c91835] hover:brightness-110 shadow-[0_7px_0_#9f122a] active:translate-y-[6px] active:shadow-none border border-white/25',
    'B': 'bg-gradient-to-br from-[#1368ce] to-[#0f54a8] hover:brightness-110 shadow-[0_7px_0_#0b4082] active:translate-y-[6px] active:shadow-none border border-white/25',
    'C': 'bg-gradient-to-br from-[#e5a600] to-[#c78f00] hover:brightness-110 shadow-[0_7px_0_#9c6f00] active:translate-y-[6px] active:shadow-none border border-white/25',
    'D': 'bg-gradient-to-br from-[#26890c] to-[#1e6e09] hover:brightness-110 shadow-[0_7px_0_#155106] active:translate-y-[6px] active:shadow-none border border-white/25'
};

const ShapeIcon = ({ choice }) => {
    switch (choice) {
        case 'A': return <svg viewBox="0 0 32 32" className="w-12 h-12 sm:w-14 sm:h-14 fill-white drop-shadow-md" aria-hidden="true"><path d="M16 4L4 26h24L16 4z" /></svg>;
        case 'B': return <svg viewBox="0 0 32 32" className="w-12 h-12 sm:w-14 sm:h-14 fill-white drop-shadow-md" aria-hidden="true"><path d="M16 4l12 12-12 12L4 16 16 4z" /></svg>;
        case 'C': return <svg viewBox="0 0 32 32" className="w-12 h-12 sm:w-14 sm:h-14 fill-white drop-shadow-md" aria-hidden="true"><circle cx="16" cy="16" r="12" /></svg>;
        case 'D': return <svg viewBox="0 0 32 32" className="w-12 h-12 sm:w-14 sm:h-14 fill-white drop-shadow-md" aria-hidden="true"><rect x="6" y="6" width="20" height="20" rx="3" /></svg>;
        default: return null;
    }
};

const TutorPlayerView = ({ questions, currentQuestionIndex, isAnswerRevealed, onAnswer, score }) => {
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [localIndex, setLocalIndex] = useState(currentQuestionIndex);

    useEffect(() => {
        if (currentQuestionIndex !== localIndex) {
            setSelectedChoice(null);
            setLocalIndex(currentQuestionIndex);
        }
    }, [currentQuestionIndex, localIndex]);

    if (!questions || questions.length === 0) return null;

    const currentQuestion = questions[localIndex];
    const correctNorm = currentQuestion.correct_answer ? String(currentQuestion.correct_answer).toUpperCase() : '';
    const isCorrect = selectedChoice === correctNorm;

    const handleSelect = (choice) => {
        if (selectedChoice || isAnswerRevealed) return;
        setSelectedChoice(choice);
        const correct = choice === correctNorm;
        onAnswer(currentQuestion.id, choice, correct);
    };

    return (
        <div
            className="flex flex-col h-full w-full bg-slate-50/95 backdrop-blur-md rounded-2xl border border-white/60 p-3.5 sm:p-5 overflow-y-auto custom-scrollbar"
            style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
        >
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm mb-4 flex flex-wrap justify-between items-center gap-2 border border-slate-200/80">
                <div className="text-base sm:text-xl font-black text-slate-800 flex items-center gap-2">
                    <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-3 py-1 rounded-xl shadow-xs">
                        {localIndex + 1}
                    </span>
                    <span className="text-slate-600 text-sm sm:text-base font-bold">/ {questions.length} ข้อ</span>
                </div>
                <div className="text-base sm:text-lg font-black text-slate-800 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                    <span>คะแนน:</span>
                    <span className="text-indigo-700">{score}</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-4xl w-full mx-auto">
                {!selectedChoice ? (
                    <>
                        <div className="text-left text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 mb-5 sm:mb-7 px-4 sm:px-6 bg-white py-5 sm:py-6 rounded-2xl shadow-md border border-slate-200/90 leading-relaxed break-words">
                            <div className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtml(currentQuestion.question_text || '')) }} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 w-full min-h-[260px] sm:h-[52vh]">
                            {['A', 'B', 'C', 'D'].map(choice => (
                                <button
                                    key={choice}
                                    type="button"
                                    onClick={() => handleSelect(choice)}
                                    aria-label={`เลือกคำตอบข้อ ${choice}`}
                                    className={`${choiceStyles[choice]} rounded-2xl flex flex-col items-center justify-center gap-1.5 p-4 min-h-[96px] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 cursor-pointer`}
                                >
                                    <ShapeIcon choice={choice} />
                                    <span className="text-xs font-black uppercase tracking-widest text-white/85">
                                        ข้อ {choice}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </>
                ) : !isAnswerRevealed ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[280px] p-6 animate-in fade-in zoom-in duration-300 text-center">
                        <div className="w-24 h-24 rounded-3xl bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center mb-5 shadow-md">
                            <Hourglass className="w-12 h-12 text-indigo-600 animate-pulse" />
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-800 drop-shadow-xs">
                            รอติวเตอร์เฉลย...
                        </h2>
                        <p className="text-base sm:text-xl font-bold text-slate-600 mt-3 bg-white px-5 py-2 rounded-full border border-slate-200 shadow-xs">
                            คุณเลือกตอบข้อ <span className="text-indigo-700 font-black">{selectedChoice}</span>
                        </p>
                    </div>
                ) : (
                    <div
                        className={`flex flex-col items-center justify-center h-full min-h-[300px] p-6 sm:p-8 rounded-3xl animate-in zoom-in duration-500 shadow-xl ${
                            isCorrect
                                ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white'
                                : 'bg-gradient-to-br from-rose-500 to-red-600 text-white'
                        }`}
                    >
                        {isCorrect ? (
                            <CheckCircle2 className="w-20 h-20 sm:w-24 sm:h-24 mb-5 drop-shadow-lg" />
                        ) : (
                            <XCircle className="w-20 h-20 sm:w-24 sm:h-24 mb-5 drop-shadow-lg" />
                        )}
                        <h2 className="text-3xl sm:text-5xl font-black drop-shadow-md mb-4 text-center flex items-center justify-center gap-3 flex-wrap">
                            {isCorrect ? (
                                <>
                                    <PartyPopper className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
                                    <span>ถูกต้อง! เก่งมาก</span>
                                </>
                            ) : (
                                <>
                                    <Frown className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
                                    <span>ผิดค๊าบบบ</span>
                                </>
                            )}
                        </h2>
                        <div className="bg-white/20 backdrop-blur-md px-6 py-5 rounded-2xl border border-white/35 mt-3 text-center shadow-inner">
                            <p className="text-lg sm:text-xl font-bold text-white/95">คำตอบที่ถูกต้องคือ</p>
                            <p className="text-3xl sm:text-4xl font-black mt-1.5">ข้อ {currentQuestion.correct_answer}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TutorPlayerView;
