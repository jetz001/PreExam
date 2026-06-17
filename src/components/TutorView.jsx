import React, { useState, useEffect } from 'react';
import { ChevronRight, Eye, CheckCircle2 } from 'lucide-react';
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

const TutorView = ({ questions, socket, roomId, isHost, currentQuestionIndex, participantCount = 0, answerCounts = {} }) => {
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
            socket.emit('tutor_navigate', { roomId, questionIndex: newIndex });
        }
    };

    const handleRevealAnswer = () => {
        if (isHost) {
            setIsAnswerRevealed(true);
            socket.emit('tutor_show_answer', { roomId, questionIndex: localIndex });
        }
    };

    if (!questions || questions.length === 0) return <div className="text-white text-center mt-20 font-bold text-2xl">Loading questions...</div>;

    const currentQuestion = questions[localIndex];
    // Some questions have choices in an object or as choice_a, choice_b.
    const choices = currentQuestion.choices || {
        A: currentQuestion.choice_a || currentQuestion.choice_A,
        B: currentQuestion.choice_b || currentQuestion.choice_B,
        C: currentQuestion.choice_c || currentQuestion.choice_C,
        D: currentQuestion.choice_d || currentQuestion.choice_D,
    };
    const choiceColors = {
        A: 'bg-[#e21b3c] shadow-[0_6px_0_#b3142e]',
        B: 'bg-[#1368ce] shadow-[0_6px_0_#0e55a3]',
        C: 'bg-[#d89e00] shadow-[0_6px_0_#a87b00]',
        D: 'bg-[#26890c] shadow-[0_6px_0_#1d6b0a]'
    };
    const choiceIcons = { A: '▲', B: '◆', C: '●', D: '■' };

    return (
        <div className="flex flex-col h-full bg-[#f2f2f2] font-sans relative overflow-hidden">
            {/* Header */}
            <div className="bg-white shadow-md px-6 py-4 flex justify-between items-center z-10 border-b-4 border-gray-200">
                <div className="text-2xl font-black text-[#333]">
                    <span className="bg-[#2d0d6b] text-white px-3 py-1 rounded-lg mr-2">{localIndex + 1}</span> 
                    of {questions.length}
                </div>
                <div className="flex gap-4 items-center">
                    <div className="text-lg font-bold text-gray-600 bg-gray-100 px-4 py-2 rounded-xl border-2 border-gray-300">
                        👥 ผู้เล่นทั้งหมด: <span className="text-[#2d0d6b]">{participantCount}</span>
                    </div>
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 w-full max-w-6xl mx-auto">
                <div className="bg-white px-8 py-10 w-full rounded-2xl shadow-lg border-b-8 border-gray-300 mb-8 text-left">
                    <h2 className="text-3xl font-black text-gray-800 leading-relaxed">
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtml(currentQuestion.question_text || '')) }} />
                    </h2>
                </div>

                {currentQuestion.question_image && (
                    <img src={currentQuestion.question_image} alt="Question" className="mb-8 max-h-[30vh] object-contain rounded-xl shadow-md border-4 border-white" />
                )}

                <div className="grid grid-cols-2 gap-4 w-full mt-auto">
                    {['A', 'B', 'C', 'D'].map((choice) => {
                        const correctNorm = currentQuestion.correct_answer ? String(currentQuestion.correct_answer).toUpperCase() : '';
                        const isCorrect = correctNorm === choice;
                        const opacityClass = isAnswerRevealed ? (isCorrect ? 'opacity-100' : 'opacity-30') : 'opacity-100';
                        const count = answerCounts[choice] || 0;
                        
                        return (
                            <div
                                key={choice}
                                className={`${choiceColors[choice]} ${opacityClass} text-white text-left p-6 rounded-xl transition-all duration-300 relative flex flex-col justify-center`}
                            >
                                <div className="flex items-center">
                                    <span className="text-3xl font-black mr-4 drop-shadow-md">{choiceIcons[choice]}</span>
                                    <span className="text-2xl font-bold drop-shadow-md flex-1">{choices[choice]}</span>
                                    {isAnswerRevealed && (
                                        <div className="bg-black/20 px-4 py-2 rounded-lg ml-4 flex items-center shadow-inner border border-white/10">
                                            <span className="text-xl font-black">👥 {count}</span>
                                        </div>
                                    )}
                                </div>
                                {isAnswerRevealed && isCorrect && (
                                    <CheckCircle2 className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 text-white drop-shadow-md opacity-100" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {isAnswerRevealed && currentQuestion.explanation && (
                    <div className="w-full mt-6 bg-blue-100 border-4 border-blue-400 p-6 rounded-2xl text-blue-900 font-bold animate-in fade-in slide-in-from-bottom-4">
                        <h4 className="text-xl mb-2 flex items-center gap-2">💡 คำอธิบาย (Explanation)</h4>
                        <p className="text-lg">{currentQuestion.explanation}</p>
                    </div>
                )}
            </div>

            {/* Navigation (Host Only) */}
            {isHost && (
                <div className="bg-white p-6 shadow-lg border-t-4 border-gray-200 z-10 flex justify-between items-center">
                    <div className="text-gray-500 font-bold">
                        คุณคือโฮสต์ผู้ควบคุมเกม
                    </div>
                    <div className="flex gap-4">
                        {!isAnswerRevealed ? (
                            <button
                                onClick={handleRevealAnswer}
                                className="bg-[#1368ce] text-white px-8 py-4 rounded-xl font-black text-xl shadow-[0_6px_0_#0e55a3] hover:translate-y-1 hover:shadow-[0_2px_0_#0e55a3] transition-all flex items-center gap-2"
                            >
                                <Eye size={24} /> เฉลยคำตอบ
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={localIndex === questions.length - 1}
                                className="bg-[#26890c] text-white px-8 py-4 rounded-xl font-black text-xl shadow-[0_6px_0_#1d6b0a] hover:translate-y-1 hover:shadow-[0_2px_0_#1d6b0a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                ถัดไป <ChevronRight size={24} />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutorView;
