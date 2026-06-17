import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
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
    'A': 'bg-[#e21b3c] hover:bg-[#c91835] shadow-[0_8px_0_#b3152d] active:translate-y-[8px] active:shadow-none',
    'B': 'bg-[#1368ce] hover:bg-[#105bb5] shadow-[0_8px_0_#0e4e9c] active:translate-y-[8px] active:shadow-none',
    'C': 'bg-[#d89e00] hover:bg-[#c28e00] shadow-[0_8px_0_#a87b00] active:translate-y-[8px] active:shadow-none',
    'D': 'bg-[#26890c] hover:bg-[#20750a] shadow-[0_8px_0_#1a5e08] active:translate-y-[8px] active:shadow-none'
};

const ShapeIcon = ({ choice }) => {
    switch (choice) {
        case 'A': return <svg viewBox="0 0 32 32" className="w-16 h-16 fill-white drop-shadow-md"><path d="M16 4L4 26h24L16 4z"/></svg>;
        case 'B': return <svg viewBox="0 0 32 32" className="w-16 h-16 fill-white drop-shadow-md"><path d="M16 4l12 12-12 12L4 16 16 4z"/></svg>;
        case 'C': return <svg viewBox="0 0 32 32" className="w-16 h-16 fill-white drop-shadow-md"><circle cx="16" cy="16" r="12"/></svg>;
        case 'D': return <svg viewBox="0 0 32 32" className="w-16 h-16 fill-white drop-shadow-md"><rect x="6" y="6" width="20" height="20" rx="3"/></svg>;
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
        <div className="flex flex-col h-full w-full bg-[#f2f2f2] font-sans p-4">
            <div className="bg-white p-4 rounded-xl shadow-md mb-4 flex justify-between items-center border-b-4 border-gray-200">
                <div className="text-xl font-black text-gray-800">
                    <span className="bg-[#2d0d6b] text-white px-3 py-1 rounded-lg mr-2">{localIndex + 1}</span>
                    / {questions.length}
                </div>
                <div className="text-xl font-black text-gray-800">
                    คะแนน: <span className="text-[#2d0d6b]">{score}</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-4xl w-full mx-auto">
                {!selectedChoice ? (
                    <>
                        <h2 className="text-left text-3xl font-black text-gray-800 mb-8 px-4 bg-white py-6 rounded-2xl shadow-lg border-b-4 border-gray-300">
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtml(currentQuestion.question_text || '')) }} />
                        </h2>
                        <div className="grid grid-cols-2 gap-4 w-full h-[60vh]">
                            {['A', 'B', 'C', 'D'].map(choice => (
                                <button
                                    key={choice}
                                    onClick={() => handleSelect(choice)}
                                    className={`${choiceStyles[choice]} rounded-2xl flex items-center justify-center transition-transform`}
                                >
                                    <ShapeIcon choice={choice} />
                                </button>
                            ))}
                        </div>
                    </>
                ) : !isAnswerRevealed ? (
                    <div className="flex flex-col items-center justify-center h-full animate-in fade-in zoom-in duration-300">
                        <div className="text-6xl mb-6 animate-bounce">⏳</div>
                        <h2 className="text-4xl font-black text-gray-800 text-center drop-shadow-sm">รอติวเตอร์เฉลย...</h2>
                        <p className="text-xl font-bold text-gray-500 mt-4">คุณเลือกตอบข้อ {selectedChoice}</p>
                    </div>
                ) : (
                    <div className={`flex flex-col items-center justify-center h-full p-8 rounded-3xl animate-in zoom-in duration-500 ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {isCorrect ? (
                            <CheckCircle2 size={120} className="mb-6 drop-shadow-lg" />
                        ) : (
                            <XCircle size={120} className="mb-6 drop-shadow-lg" />
                        )}
                        <h2 className="text-5xl font-black drop-shadow-md mb-4 text-center">
                            {isCorrect ? 'ถูกต้อง! เก่งมาก 🎉' : 'ผิดค๊าบบบ 😢'}
                        </h2>
                        <div className="bg-white/20 p-6 rounded-2xl border-2 border-white/40 mt-4 text-center">
                            <p className="text-2xl font-bold">คำตอบที่ถูกต้องคือ</p>
                            <p className="text-4xl font-black mt-2">ข้อ {currentQuestion.correct_answer}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TutorPlayerView;
