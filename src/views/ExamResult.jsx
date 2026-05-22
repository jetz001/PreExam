import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import examService from '../services/examService';
import { ChevronLeft, Award, XCircle, CheckCircle, Clock } from 'lucide-react';
import AdSlot from '../components/ads/AdSlot';
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

const ExamResult = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                // Mock data fallback if API fails with "not found" due to mock IDs
                const data = await examService.getResultById(id);
                setResult(data.data || data);
            } catch (err) {
                console.error(err);
                // Fallback for demo if API fails
                setError("Could not load exam details.");
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading Result...</div>;

    // Fallback UI or Error
    if (error || !result) return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 mb-4">
                <ChevronLeft /> Back
            </button>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg text-center">
                <h2 className="text-xl font-bold mb-2">Exam Result Not Found</h2>
                <p className="text-gray-500 mb-4">{error || "The requested exam result does not exist."}</p>
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg inline-block">
                    Note: Since this is mock data, only valid database IDs work.
                </div>
            </div>
        </div>
    );

    const isPassed = result.is_passed || (result.score >= (result.total_score || 100) * 0.6);

    return (
        <div className={`min-h-screen pt-12 pb-24 px-4 font-sans transition-colors duration-500 ${isPassed ? 'bg-[#26890c]' : 'bg-[#e21b3c]'}`}>
            <div className="max-w-3xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="text-center text-white animate-[titlePop_0.5s_ease-out_both]">
                    <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white/20 shadow-xl backdrop-blur-sm mb-6 border-4 border-white/40">
                        {isPassed ? <Award size={64} className="text-yellow-300 drop-shadow-md" /> : <XCircle size={64} className="text-white drop-shadow-md" />}
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black mb-3 drop-shadow-lg" style={{ fontFamily: 'var(--font-display)' }}>
                        {isPassed ? 'ยอดเยี่ยมมาก!' : 'น่าเสียดาย!'}
                    </h1>
                    <p className="text-xl md:text-2xl font-bold opacity-90 tracking-wide drop-shadow-md">
                        {isPassed ? 'คุณผ่านเกณฑ์การทดสอบ' : 'เสียใจด้วย คุณยังไม่ผ่านเกณฑ์'}
                    </p>
                </div>

                {/* Score Card */}
                <div className="playful-card bg-white p-8 md:p-10 text-center animate-[btnSlide_0.6s_0.2s_both] relative overflow-hidden">
                    {/* Confetti or shapes could go here */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-100 rounded-full opacity-50"></div>
                    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-100 rounded-full opacity-50"></div>
                    
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-2 relative z-10">คะแนนของคุณคือ</p>
                    <div className="text-[6rem] leading-none font-black text-[#46178f] relative z-10 drop-shadow-sm" style={{ fontFamily: 'var(--font-display)' }}>
                        {result.score} <span className="text-3xl text-gray-300">/ {result.total_score}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                        <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100">
                            <span className="block text-sm text-gray-400 font-bold uppercase mb-1">เวลาที่ใช้</span>
                            <span className="block text-xl font-black text-gray-700">
                                {result.time_taken ? `${Math.floor(result.time_taken / 60)} นาที ${result.time_taken % 60} วินาที` : 'N/A'}
                            </span>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100">
                            <span className="block text-sm text-gray-400 font-bold uppercase mb-1">ความแม่นยำ</span>
                            <span className="block text-xl font-black text-gray-700">
                                {Math.round((result.score / (result.total_score || 1)) * 100)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Ads Component */}
                <div className="playful-card bg-white p-6 animate-[btnSlide_0.6s_0.3s_both]">
                    <div className="grid grid-cols-1 gap-6">
                        <AdSlot placement="result-page-1" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 animate-[btnSlide_0.6s_0.4s_both]">
                    <button 
                        onClick={() => navigate('/exam')} 
                        className="playful-btn bg-[#1368ce] text-white px-8 py-4 text-xl w-full sm:w-auto"
                    >
                        ทำข้อสอบอีกครั้ง
                    </button>
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="playful-btn bg-white text-gray-800 border-2 border-gray-200 px-8 py-4 text-xl w-full sm:w-auto hover:bg-gray-50"
                    >
                        กลับสู่แดชบอร์ด
                    </button>
                </div>

                {/* Detailed Analysis (Hidden for simplicity unless needed, or shown playfully) */}
                {result.questions && (
                    <div className="mt-12 space-y-6 animate-[btnSlide_0.6s_0.5s_both]">
                        <h3 className="text-3xl font-black text-white text-center drop-shadow-md mb-8" style={{ fontFamily: 'var(--font-display)' }}>เฉลยคำตอบ</h3>
                        {result.questions.map((q, idx) => {
                            const isCorrect = q.is_correct;
                            return (
                                <div key={idx} className="playful-card bg-white p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-inner ${isCorrect ? 'bg-[#26890c] text-white' : 'bg-[#e21b3c] text-white'}`}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-xl text-gray-800 mb-4" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtml(q.question_text)) }} />

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {['a', 'b', 'c', 'd'].map((option) => {
                                                    const choiceKey = `choice_${option}`;
                                                    const choiceText = q[choiceKey];
                                                    let className = "p-4 rounded-xl border-4 text-left font-bold transition-transform duration-200 ";

                                                    const choiceLower = option.toLowerCase();
                                                    const correctLower = q.correct_answer ? q.correct_answer.toString().trim().toLowerCase() : '';
                                                    const userLower = q.user_answer ? q.user_answer.toString().trim().toLowerCase() : '';

                                                    if (choiceLower === correctLower) {
                                                        className += "bg-[#26890c]/10 border-[#26890c] text-[#26890c]"; // Correct 
                                                    } else if (choiceLower === userLower && !q.is_correct) {
                                                        className += "bg-[#e21b3c]/10 border-[#e21b3c] text-[#e21b3c]"; // Wrong User Answer
                                                    } else {
                                                        className += "bg-gray-50 border-gray-100 text-gray-600"; // Neutral
                                                    }

                                                    return (
                                                        <div key={option} className={className}>
                                                            <span className="uppercase mr-2 opacity-70">{option}.</span> {choiceText}
                                                            {choiceLower === userLower && <span className="float-right bg-current text-white px-2 py-1 rounded-md text-xs">คุณเลือก</span>}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {q.explanation && (
                                                <div className="mt-4 p-4 rounded-xl bg-blue-50 border-2 border-blue-100">
                                                    <div className="font-black text-[#1368ce] mb-1 uppercase tracking-wide text-sm flex items-center">
                                                        <Clock size={16} className="mr-2" /> คำอธิบาย
                                                    </div>
                                                    <p className="text-gray-700 font-medium">{q.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamResult;
