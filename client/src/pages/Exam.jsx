import React, { useState } from 'react';
import ExamConfig from '../components/ExamConfig';
import ExamTaking from '../components/ExamTaking';
import ExamResult from '../components/ExamResult';
import examService from '../services/examService';

const Exam = () => {
    const [step, setStep] = useState('config'); // config, taking, result
    const [questions, setQuestions] = useState([]);
    const [config, setConfig] = useState(null);
    const [result, setResult] = useState(null);

    const handleStart = async (examConfig) => {
        try {
            setConfig(examConfig);
            const data = await examService.getQuestions(examConfig);
            if (data.data && data.data.length > 0) {
                setQuestions(data.data);
                setStep('taking');
            } else {
                alert('ไม่พบข้อสอบในหมวดหมู่นี้');
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
