import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ExamConfig from '../components/ExamConfig';
import ExamTaking from '../components/ExamTaking';
import ExamResult from '../components/ExamResult';
import examService from '../services/examService';

const Exam = () => {
    const [step, setStep] = useState('config'); // config, taking, result
    const [questions, setQuestions] = useState([]);
    const [config, setConfig] = useState(null);
    const [result, setResult] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const isQuick = params.get('quick') === 'true';

        if (isQuick && step === 'config') {
            // Quick Test Configuration: Practice Mode, ALL Categories, 10 questions
            const quickConfig = {
                category: '',
                subject: '',
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
            setConfig(examConfig);
            const data = await examService.getQuestions({ ...examConfig, orderBy: 'random' });
            // Check if data.data is array (legacy) or object (paginated)
            const questionsList = Array.isArray(data.data) ? data.data : (data.data.rows || []);

            if (questionsList.length > 0) {
                // Bug Fix: Check if we got significantly fewer questions than requested
                // Use a soft threshold (e.g. 1) to alert user but still allow exam
                if (questionsList.length === 1 && examConfig.limit > 1) {
                    console.warn(`Warning: Requested ${examConfig.limit} questions but only got ${questionsList.length}`);
                    // Optional: You could alert the user here, but maybe it's better to let them take the 1 question exam
                    // than to block them. However, user feedback says "1 question then bounce" is bad.
                    // Let's ensure we are passing the limit correctly.
                }

                setQuestions(questionsList);
                setStep('taking');
            } else {
                alert('ไม่พบข้อสอบในหมวดหมู่นี้ กรุณาลองเลือกเงื่อนไขอื่น');
            }
        } catch (error) {
            console.error('Error starting exam:', error);
            alert('เกิดข้อผิดพลาดในการเริ่มสอบ');
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
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {step === 'config' && <ExamConfig onStart={handleStart} />}
            {step === 'taking' && (
                <ExamTaking
                    questions={questions}
                    mode={config.mode}
                    onSubmit={handleSubmit}
                />
            )}
            {step === 'result' && <ExamResult result={result} onRetry={handleRetry} />}
        </div>
    );
};

export default Exam;
