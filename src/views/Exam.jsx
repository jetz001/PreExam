import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import ExamConfig from '../components/ExamConfig';
import ExamTaking from '../components/ExamTaking';
import ExamResult from '../components/ExamResult';
import examService from '../services/examService';
import AdaptiveLottie from '../components/common/AdaptiveLottie';

const ExamCountdown = () => {
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed inset-0 z-[9999] overflow-hidden flex flex-col items-center justify-center px-4 text-white bg-gradient-to-br from-[#24064d] via-[#46178f] to-[#6d28d9] font-['Nunito','Sarabun',sans-serif]"
        >
            <style>{`
                @keyframes ecBounce {
                    0%, 100% { transform: translateY(0) scale(1); }
                    30% { transform: translateY(-10px) scale(1.06); }
                    60% { transform: translateY(-4px) scale(1.02); }
                }
                @keyframes ecSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes ecPulseRing {
                    0%, 100% { transform: scale(0.95); opacity: 0.45; }
                    50% { transform: scale(1.08); opacity: 0.85; }
                }
            `}</style>

            {/* Ambient glow blobs */}
            <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-fuchsia-500/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-amber-400/20 blur-3xl" />

            {/* Glass ring badge */}
            <div className="relative flex items-center justify-center w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-white/10 backdrop-blur-md border border-white/25 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                <div
                    className="pointer-events-none absolute -inset-3 rounded-full border-2 border-amber-300/35"
                    style={{ animation: 'ecPulseRing 1.4s ease-in-out infinite' }}
                />
                <div
                    style={{
                        fontSize: 'clamp(4.75rem, 22vw, 9.5rem)',
                        fontWeight: 900,
                        lineHeight: 1,
                        animation: 'ecBounce 1s infinite',
                        textShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 40px rgba(255,204,0,0.5)',
                        color: countdown <= 1 ? '#ffcc00' : '#ffffff',
                    }}
                >
                    {countdown > 0 ? countdown : 'ไป!'}
                </div>
            </div>

            <div
                className="mt-7 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-lg sm:text-2xl font-extrabold text-white/95 shadow-lg"
                style={{ animation: 'ecSlideUp 0.5s ease' }}
            >
                <Sparkles size={20} className="text-amber-300 shrink-0" aria-hidden="true" />
                <span>เตรียมตัวให้พร้อม...</span>
            </div>

            {/* Preload animations silently into cache so it doesn't stutter between questions */}
            <div style={{ position: 'absolute', opacity: 0.01, pointerEvents: 'none', width: '10px', height: '10px', overflow: 'hidden' }}>
                <AdaptiveLottie presetKey="examSkipFirstAnswer" />
                <AdaptiveLottie presetKey="examFinish" />
                <AdaptiveLottie presetKey="examResultPass" />
                <AdaptiveLottie presetKey="examResultFail" />
            </div>
        </div>
    );
};

const Exam = () => {
    const [step, setStep] = useState('config'); // config, taking, result
    const [questions, setQuestions] = useState([]);
    const [config, setConfig] = useState(null);
    const [result, setResult] = useState(null);
    const [sessionKey, setSessionKey] = useState(0);
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const isQuick = params.get('quick') === 'true';

        if (isQuick && step === 'config') {
            // Quick Test Configuration: Practice Mode, ALL Categories, 10 questions
            const quickConfig = {
                category: undefined,
                subject: undefined,
                exam_year: '',
                exam_set: '',
                limit: 10,
                mode: 'practice',
            };
            handleStart(quickConfig);
        }
    }, [location.search]);

    const handleStart = async (examConfig) => {
        try {
            setStep('countdown'); // Instantly show countdown!
            setSessionKey((prev) => prev + 1);
            setConfig(examConfig);
            setResult(null);

            // Fetch questions AND wait for countdown to finish (3.5s) simultaneously
            const dataPromise = examService.getQuestions({ ...examConfig, orderBy: 'random' });
            const timerPromise = new Promise(resolve => setTimeout(resolve, 3500));

            const [data] = await Promise.all([dataPromise, timerPromise]);

            const questionsList = Array.isArray(data.data) ? data.data : (data.data.rows || []);

            if (questionsList.length > 0) {
                if (questionsList.length === 1 && examConfig.limit > 1) {
                    console.warn(`Warning: Requested ${examConfig.limit} questions but only got ${questionsList.length}`);
                }
                setQuestions(questionsList);
                setStep('taking');
            } else {
                toast.error('ไม่พบข้อสอบในหมวดหมู่นี้ กรุณาลองเลือกเงื่อนไขอื่น');
                setStep('config');
            }
        } catch (error) {
            console.error('Error starting exam:', error);
            toast.error('เกิดข้อผิดพลาดในการเริ่มสอบ');
            setStep('config');
        }
    };

    const handleSubmit = async (answers, timeTaken) => {
        try {
            const resultData = await examService.submitExam({
                answers,
                mode: config.mode,
                total_time: timeTaken,
            });
            setResult(resultData.data);
            setStep('result');
        } catch (error) {
            console.error('Error submitting exam:', error);
            const message = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการส่งคำตอบ';
            toast.error(`Error: ${message}`);
        }
    };

    const handleRetry = () => {
        setStep('config');
        setQuestions([]);
        setResult(null);
        setConfig(null);
        setSessionKey((prev) => prev + 1);
    };

    useEffect(() => {
        if (step === 'result' && questions.length > 0 && (result?.questions?.length || result?.answers)) {
            setQuestions([]);
        }
    }, [questions.length, result, step]);

    return (
        <>
            {/* Config: full-screen Kahoot style — no wrapper */}
            {step === 'config' && <ExamConfig onStart={handleStart} />}

            {/* Full-screen Countdown Overlay */}
            {step === 'countdown' && <ExamCountdown />}

            {/* Taking / Result keep their own layout */}
            {step === 'taking' && (
                <ExamTaking
                    key={`exam-taking-${sessionKey}`}
                    questions={questions}
                    mode={config.mode}
                    onSubmit={handleSubmit}
                    config={config}
                />
            )}
            {step === 'result' && (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 sm:py-8">
                    <ExamResult key={`exam-result-${sessionKey}`} result={result} onRetry={handleRetry} config={config} />
                </div>
            )}
        </>
    );
};

export default Exam;
