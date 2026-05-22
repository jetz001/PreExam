import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import DetailedSolution from './exam/DetailedSolution';
import AdSlot from './ads/AdSlot';

const ExamResult = ({ result, onRetry }) => {
    const percentage = (result.score / (result.total_score || 1)) * 100;
    const isPassed = percentage >= 60;
    const [showSolutions, setShowSolutions] = useState(false);

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto transition-colors duration-1000 ${isPassed ? 'bg-[#26890c]' : 'bg-[#e21b3c]'}`}>
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
                @keyframes floatUp { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
                @keyframes slideDown { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }
            `}</style>
            
            {/* Floating Geometric Shapes */}
            <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex: 0 }}>
                {/* Big Background Gradient */}
                <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 50% 0%, rgba(0,0,0,0.2) 0%, transparent 80%)', opacity: 0.8 }}/>
                
                {/* Triangle */}
                <svg viewBox="0 0 100 100" style={{ position:'absolute', top:'10%', left:'10%', width:'250px', opacity:0.1, fill:'#fff', animation:'floatShape1 25s infinite ease-in-out' }}>
                    <polygon points="50,10 90,90 10,90" />
                </svg>

                {/* Diamond */}
                <svg viewBox="0 0 100 100" style={{ position:'absolute', top:'60%', right:'15%', width:'300px', opacity:0.1, fill:'#fff', animation:'floatShape2 30s infinite ease-in-out' }}>
                    <polygon points="50,10 90,50 50,90 10,50" />
                </svg>

                {/* Circle */}
                <svg viewBox="0 0 100 100" style={{ position:'absolute', bottom:'-5%', left:'20%', width:'280px', opacity:0.1, fill:'#fff', animation:'floatShape3 28s infinite ease-in-out' }}>
                    <circle cx="50" cy="50" r="40" />
                </svg>

                {/* Square */}
                <svg viewBox="0 0 100 100" style={{ position:'absolute', top:'20%', right:'5%', width:'200px', opacity:0.1, fill:'#fff', animation:'floatShape4 22s infinite ease-in-out' }}>
                    <rect x="15" y="15" width="70" height="70" rx="10" />
                </svg>
            </div>

            <div className="w-full max-w-4xl mx-auto px-4 py-12 relative flex flex-col items-center min-h-full justify-center z-10" style={{ animation: 'floatUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
                
                {/* Floating Alert Icon */}
                <div className="w-32 h-32 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md shadow-xl mb-6 border-4 border-white/30">
                    {isPassed ? <CheckCircle size={80} className="text-white drop-shadow-md" /> : <AlertCircle size={80} className="text-white drop-shadow-md" />}
                </div>

                {/* Text Alert */}
                <div className="text-center mb-8 w-full">
                    <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg tracking-wide mb-2">
                        {isPassed ? 'ยอดเยี่ยมมาก!' : 'อ๊ะ! ยังไม่ผ่านเกณฑ์'}
                    </h1>
                    <p className="text-xl md:text-3xl font-medium text-white/90 drop-shadow-sm">
                        {isPassed ? 'คุณทำคะแนนได้ดีเยี่ยม ยินดีด้วยครับ' : 'ไม่เป็นไรนะ ลองทบทวนแล้วทำใหม่อีกครั้ง'}
                    </p>
                </div>

                {/* Score Card - Glassmorphism */}
                <div className="w-full text-center p-8 md:p-12 relative overflow-hidden mb-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] shadow-xl">
                    <div className="text-white/70 font-bold text-xl uppercase tracking-wider mb-2">คะแนนของคุณ</div>
                    <div className="text-[7rem] leading-none font-black text-white mb-6 drop-shadow-md">
                        {result.score} <span className="text-5xl text-white/50">/ {result.total_score}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-8">
                        <div className="bg-white/10 rounded-[1.5rem] p-6 border border-white/20">
                            <span className="block text-sm md:text-lg text-white/70 font-bold uppercase mb-1">เวลาที่ใช้</span>
                            <span className="block text-2xl md:text-4xl font-black text-white">
                                {Math.floor(result.time_taken / 60)} น. {result.time_taken % 60} วิ.
                            </span>
                        </div>
                        <div className="bg-white/10 rounded-[1.5rem] p-6 border border-white/20">
                            <span className="block text-sm md:text-lg text-white/70 font-bold uppercase mb-1">ความแม่นยำ</span>
                            <span className="block text-2xl md:text-4xl font-black text-white">
                                {isNaN(percentage) ? 0 : percentage.toFixed(0)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Ad Injection */}
                <div className="w-full mb-8 bg-white/10 backdrop-blur-md p-4 rounded-[2rem] border border-white/20 shadow-xl">
                    <AdSlot placement="result" />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12 w-full pb-12">
                    <button
                        onClick={onRetry}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-2xl px-12 py-6 rounded-full shadow-lg border border-white/30 hover:-translate-y-1 active:translate-y-0 transition-all w-full sm:w-auto text-center"
                    >
                        ทำข้อสอบอีกครั้ง
                    </button>
                    <Link
                        to="/profile"
                        className="bg-[#46178f] hover:bg-[#320d6b] text-white font-bold text-2xl px-12 py-6 rounded-full shadow-[0_6px_0_#2b0761] hover:translate-y-1 hover:shadow-none active:translate-y-2 active:shadow-none transition-all w-full sm:w-auto text-center"
                    >
                        กลับแดชบอร์ด
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ExamResult;
