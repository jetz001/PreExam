import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(70, 23, 143, 1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            color: '#fff',
            fontFamily: "'Nunito', 'Sarabun', sans-serif"
        }}>
            <style>{`
                @keyframes ecBounce {
                    0%, 100% { transform: translateY(0) scale(1); }
                    30% { transform: translateY(-10px) scale(1.05); }
                    60% { transform: translateY(-5px) scale(1.02); }
                }
                @keyframes ecSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <div style={{
                fontSize: '15rem',
                fontWeight: 900,
                animation: 'ecBounce 1s infinite',
                textShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 40px rgba(255,204,0,0.5)',
                color: countdown <= 1 ? '#ffcc00' : '#fff'
            }}>
                {countdown > 0 ? countdown : 'ไป!'}
            </div>
            <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                marginTop: '20px',
                opacity: 0.8,
                animation: 'ecSlideUp 0.5s ease'
            }}>
                เตรียมตัวให้พร้อม...
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
                alert('ไม่พบข้อสอบในหมวดหมู่นี้ กรุณาลองเลือกเงื่อนไขอื่น');
                setStep('config');
            }
        } catch (error) {
            console.error('Error starting exam:', error);
            alert('เกิดข้อผิดพลาดในการเริ่มสอบ');
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
            alert(`Error: ${message}`);
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
                <div className="min-h-screen bg-gray-50 py-8">
                    <ExamResult key={`exam-result-${sessionKey}`} result={result} onRetry={handleRetry} />
                </div>
            )}
        </>
    );
};

export default Exam;
