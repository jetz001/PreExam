import React, { useState, useEffect } from 'react';
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
import bookmarkService from '../services/bookmarkService';
import toast from 'react-hot-toast';
import HomeNavbar from './HomeNavbar'; // Import Navbar!
import Lottie from 'lottie-react';
import successAnimation from '../assets/97e2f756-37dc-459e-a539-eb11daa2cd1c.json';

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

const ExamTaking = ({ questions, mode, onSubmit }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState({});
    const [timeLeft, setTimeLeft] = useState(questions.length * 60);
    const [startTime] = useState(Date.now());
    const [showReportModal, setShowReportModal] = useState(false);
    const [fontSizeScale, setFontSizeScale] = useState(1);
    const [showFontMenu, setShowFontMenu] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const { isPremium } = useUserRole();

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

    const handleAnswer = (choice) => {
        setAnswers({ ...answers, [questions[currentIndex].id]: choice });
        setShowAnimation(true);
        
        setTimeout(() => {
            setShowAnimation(false);
            if (mode !== 'practice') {
                const unanswered = questions.map((_, i) => i).filter(i => i !== currentIndex && !answers[questions[i].id]);
                if (unanswered.length > 0) {
                    const randomIndex = unanswered[Math.floor(Math.random() * unanswered.length)];
                    setCurrentIndex(randomIndex);
                } else if (currentIndex < questions.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                }
            }
        }, 1200);
    };

    const toggleFlag = () => {
        setFlagged({ ...flagged, [questions[currentIndex].id]: !flagged[questions[currentIndex].id] });
    };

    const handleBookmark = async () => {
        const currentQuestion = questions[currentIndex];
        try {
            await bookmarkService.addBookmark({
                target_type: 'question',
                target_id: currentQuestion.id,
                title: currentQuestion.question_text.substring(0, 100)
            });
            toast.success('บันทึกข้อสอบแล้ว');
        } catch (error) {
            if (error.response?.status === 400) {
                toast.error('คุณบันทึกข้อสอบนี้ไปแล้ว');
            } else {
                toast.error('บันทึกข้อสอบล้มเหลว');
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

    const checkIsCorrect = (q, ansChoice) => {
        if (!ansChoice) return false;
        const correctNorm = q.correct_answer ? String(q.correct_answer).trim().toUpperCase() : '';
        const choiceText = q[`choice_${ansChoice.toLowerCase()}`] ? String(q[`choice_${ansChoice.toLowerCase()}`]).trim().toUpperCase() : '';
        return (ansChoice.toUpperCase() === correctNorm) || (choiceText === correctNorm);
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

    return (
        <div className="relative min-h-screen bg-[#46178f] overflow-hidden font-['Nunito','Sarabun',sans-serif] flex flex-col">
            <style>{`
                @keyframes floatShape1 {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    50% { transform: translate(150px, 100px) rotate(180deg); }
                    100% { transform: translate(0, 0) rotate(360deg); }
                }
                @keyframes floatShape2 {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    50% { transform: translate(-120px, 120px) rotate(-180deg); }
                    100% { transform: translate(0, 0) rotate(-360deg); }
                }
                @keyframes floatShape3 {
                    0% { transform: translate(0, 0) rotate(0deg) scale(1); }
                    50% { transform: translate(100px, -150px) rotate(90deg) scale(1.2); }
                    100% { transform: translate(0, 0) rotate(360deg) scale(1); }
                }
                @keyframes floatShape4 {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    50% { transform: translate(-150px, -100px) rotate(-90deg); }
                    100% { transform: translate(0, 0) rotate(-360deg); }
                }
            `}</style>
            
            {/* Floating Geometric Shapes (Kahoot Gameplay Style) */}
            <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex: 0 }}>
                {/* Big Background Gradient */}
                <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 50% 0%, #6b21a8 0%, transparent 80%)', opacity: 0.4 }}/>
                
                {/* Triangle */}
                <svg viewBox="0 0 100 100" style={{ position:'absolute', top:'10%', left:'10%', width:'250px', opacity:0.07, fill:'#fff', animation:'floatShape1 25s infinite ease-in-out' }}>
                    <polygon points="50,10 90,90 10,90" />
                </svg>

                {/* Diamond */}
                <svg viewBox="0 0 100 100" style={{ position:'absolute', top:'60%', right:'15%', width:'300px', opacity:0.07, fill:'#fff', animation:'floatShape2 30s infinite ease-in-out' }}>
                    <polygon points="50,10 90,50 50,90 10,50" />
                </svg>

                {/* Circle */}
                <svg viewBox="0 0 100 100" style={{ position:'absolute', bottom:'-5%', left:'20%', width:'280px', opacity:0.07, fill:'#fff', animation:'floatShape3 28s infinite ease-in-out' }}>
                    <circle cx="50" cy="50" r="40" />
                </svg>

                {/* Square */}
                <svg viewBox="0 0 100 100" style={{ position:'absolute', top:'20%', right:'5%', width:'200px', opacity:0.07, fill:'#fff', animation:'floatShape4 22s infinite ease-in-out' }}>
                    <rect x="15" y="15" width="70" height="70" rx="10" />
                </svg>
                
                {/* Extra Triangle */}
                <svg viewBox="0 0 100 100" style={{ position:'absolute', bottom:'30%', left:'-5%', width:'180px', opacity:0.05, fill:'#fff', animation:'floatShape1 20s infinite ease-in-out reverse' }}>
                    <polygon points="50,10 90,90 10,90" />
                </svg>
            </div>

            {/* Global Navbar (Transparent) */}
            <div className="relative z-50">
                <HomeNavbar />
            </div>

            {/* Main Content Area */}
            {showAnimation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <Lottie animationData={successAnimation} loop={false} style={{ width: 400, height: 400 }} />
                </div>
            )}
            <div className="relative z-10 flex-grow flex flex-col pt-20 px-4 md:px-8 pb-32">
                
                {/* Top Info Bar (Timer, Progress) */}
                <div className="max-w-5xl mx-auto w-full flex justify-between items-center mb-6">
                    <div className="bg-white/20 backdrop-blur-md rounded-full px-5 py-2 font-bold text-white text-lg shadow-lg border border-white/30">
                        {currentIndex + 1} <span className="opacity-70">/ {questions.length}</span>
                    </div>
                    
                    {mode === 'simulation' && (
                        <div className={`bg-white/20 backdrop-blur-md rounded-full px-6 py-2 flex items-center font-black text-xl shadow-lg border border-white/30 ${timeLeft < 300 ? 'text-[#ff6b8a] animate-pulse' : 'text-white'}`}>
                            <Clock className="mr-2 h-5 w-5" />
                            {formatTime(timeLeft)}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button onClick={() => setShowFontMenu(!showFontMenu)} className="bg-white/20 hover:bg-white/30 rounded-full p-2.5 text-white transition">
                            <Type className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Question Card (Translucent, Playful) */}
                <div className="max-w-5xl mx-auto w-full mb-6">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] p-6 md:p-12 shadow-xl relative">
                        {/* Quick actions on card */}
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button onClick={toggleFlag} className={`p-2 rounded-full ${flagged[currentQuestion.id] ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 text-white hover:bg-white/30'} transition`} title="ปักหมุดข้อนี้">
                                <Flag className="h-5 w-5" fill={flagged[currentQuestion.id] ? "currentColor" : "none"} />
                            </button>
                            <button onClick={handleBookmark} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition" title="เซฟข้อสอบ">
                                <Bookmark className="h-5 w-5" />
                            </button>
                            <button onClick={() => setShowReportModal(true)} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition" title="แจ้งปัญหา">
                                <AlertTriangle className="h-5 w-5" />
                            </button>
                        </div>

                        <h3 className="text-white font-black text-2xl md:text-4xl text-center leading-relaxed mt-4 mb-4 drop-shadow-md" style={{ fontSize: `${1.4 * fontSizeScale}rem` }}>
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtml(currentQuestion.question_text)) }} />
                        </h3>
                        {currentQuestion.question_image && (
                            <img src={currentQuestion.question_image} alt="Question" className="mt-6 mx-auto max-w-full h-64 object-contain rounded-xl border border-white/20 shadow-lg" />
                        )}
                    </div>
                </div>

                {/* Choices (Kahoot Style 2x2 Grid) */}
                <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {['A', 'B', 'C', 'D'].map((choice) => {
                        const isSelected = answers[currentQuestion.id] === choice;
                        return (
                            <button
                                key={choice}
                                onClick={() => handleAnswer(choice)}
                                className={`relative p-6 md:p-8 rounded-[1rem] flex items-center transform transition-all duration-100 active:translate-y-[6px] active:shadow-none
                                    ${choiceStyles[choice]} 
                                    ${isSelected ? 'ring-4 ring-white ring-offset-4 ring-offset-[#46178f] scale-[1.02]' : 'hover:brightness-110'}`}
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

                {/* Explanation in Practice Mode */}
                {mode === 'practice' && isAnswered && (
                    <div className="max-w-5xl mx-auto w-full mt-8">
                        <div className={`p-8 rounded-[2rem] shadow-xl border border-white/20 bg-white/10 backdrop-blur-md`}>
                            <h4 className={`font-black text-3xl mb-4 drop-shadow-md ${checkIsCorrect(currentQuestion, answers[currentQuestion.id]) ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                                {checkIsCorrect(currentQuestion, answers[currentQuestion.id]) ? '🎉 สุดยอด! ตอบถูก' : '❌ อ๊ะ! ยังไม่ถูกนะ'}
                            </h4>
                            <p className="text-white text-xl font-medium leading-relaxed drop-shadow-sm">
                                <span className="font-black text-white bg-white/20 px-3 py-1 rounded-lg mr-2 border border-white/30">เฉลย: {currentQuestion.correct_answer}</span>
                                <br/><br/>
                                {currentQuestion.explanation}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 p-4 z-50">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <button 
                        onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} 
                        disabled={currentIndex === 0} 
                        className="w-14 h-14 bg-white/20 hover:bg-white/30 border border-white/30 rounded-full flex items-center justify-center text-white disabled:opacity-30 shadow-lg transform active:scale-95 transition font-bold"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    
                    <button 
                        onClick={isReadyToSubmit ? handleSubmit : () => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))} 
                        className={`rounded-full font-black shadow-lg transform active:scale-95 transition flex items-center justify-center ${
                            isReadyToSubmit 
                            ? 'px-8 py-4 text-xl text-white bg-[#26890c] hover:bg-[#20750a] shadow-[0_6px_0_#1a5e08] active:translate-y-[6px] active:shadow-none' 
                            : 'w-14 h-14 text-[#46178f] bg-white hover:bg-gray-100'
                        }`}
                    >
                        {isReadyToSubmit ? 'ส่งคำตอบเลย!' : <ChevronRight className="w-8 h-8" />}
                    </button>
                </div>
            </div>

            {/* Floating Tools */}
            {showFontMenu && <FontResizer onResize={setFontSizeScale} currentSize={fontSizeScale} />}
            <PermissionGate requiredTier="premium" type="hide">
                <AmbiencePlayer />
            </PermissionGate>
            <PacingAlert timeUsed={(questions.length * 60) - timeLeft} totalTime={questions.length * 60} />
            {showReportModal && <ReportModal questionId={currentQuestion.id} onClose={() => setShowReportModal(false)} />}
        </div>
    );
};

export default ExamTaking;
