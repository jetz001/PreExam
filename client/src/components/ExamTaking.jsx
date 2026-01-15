import React, { useState, useEffect } from 'react';
import { Clock, Flag, ChevronLeft, ChevronRight, AlertTriangle, Bookmark } from 'lucide-react';
import ReportModal from './exam/ReportModal';
import AmbiencePlayer from './exam/AmbiencePlayer';
import QuestionNote from './exam/QuestionNote';
import FontResizer from './exam/FontResizer';
import PermissionGate from './common/PermissionGate';
import useUserRole from '../hooks/useUserRole';
import PacingAlert from './exam/PacingAlert';
import bookmarkService from '../services/bookmarkService';
import toast from 'react-hot-toast';

const ExamTaking = ({ questions, mode, onSubmit }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState({});
    const [timeLeft, setTimeLeft] = useState(questions.length * 60); // 1 min per question
    const [startTime] = useState(Date.now()); // Track start time for accurate duration
    const [showReportModal, setShowReportModal] = useState(false);
    const [fontSizeScale, setFontSizeScale] = useState(1);
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
                title: currentQuestion.question_text.substring(0, 100) // Truncate if too long
            });
            toast.success('บันทึกข้อสอบแล้ว');
        } catch (error) {
            if (error.response && error.response.status === 400) {
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

    return (
        <div className="flex flex-col h-screen-minus-navbar">
            {/* Header */}
            <div className="bg-white shadow px-4 py-3 flex justify-between items-center sticky top-16 z-40">
                <div className="text-lg font-bold">
                    ข้อที่ {currentIndex + 1} / {questions.length}
                </div>
                {mode === 'simulation' && (
                    <div className={`flex items-center text-xl font-mono ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                        <Clock className="mr-2 h-5 w-5" />
                        {formatTime(timeLeft)}
                    </div>
                )}
                <button
                    onClick={handleSubmit}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    ส่งคำตอบ
                </button>
            </div>

            <div className="flex flex-grow overflow-hidden">
                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white p-8 rounded-lg shadow mb-6">
                            <div className="flex justify-between items-start mb-4">
                                <span className="font-bold mr-2">{currentIndex + 1}.</span>
                                {currentQuestion.question_text} <span className="text-gray-400 text-sm ml-2">#{currentQuestion.id}</span>
                            </h3>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleBookmark}
                                    className="p-2 rounded-full text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                    title="บันทึกข้อสอบ"
                                >
                                    <Bookmark className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setShowReportModal(true)}
                                    className="p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                    title="แจ้งปัญหา"
                                >
                                    <AlertTriangle className="h-5 w-5" />
                                </button>
                                <button onClick={toggleFlag} className={`p-2 rounded-full ${flagged[currentQuestion.id] ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:bg-gray-100'}`}>
                                    <Flag className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        {currentQuestion.question_image && (
                            <img src={currentQuestion.question_image} alt="Question" className="mb-4 max-w-full h-auto rounded" />
                        )}
                        <div className="space-y-3">
                            {['A', 'B', 'C', 'D'].map((choice) => (
                                <button
                                    key={choice}
                                    onClick={() => handleAnswer(choice)}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${answers[currentQuestion.id] === choice
                                        ? 'border-primary bg-blue-50 text-primary'
                                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-900'
                                        }`}
                                >
                                    <span className="font-bold mr-2" style={{ fontSize: `${1 * fontSizeScale}rem` }}>{choice}.</span>
                                    <span style={{ fontSize: `${1 * fontSizeScale}rem` }}>{currentQuestion[`choice_${choice.toLowerCase()}`]}</span>
                                </button>
                            ))}
                        </div>

                        {/* Premium Tools: Question Note */}
                        <PermissionGate requiredTier="premium" type="hide">
                            <QuestionNote questionId={currentQuestion.id} />
                        </PermissionGate>
                    </div>

                    {/* Explanation (Practice Mode Only) */}
                    {mode === 'practice' && isAnswered && (
                        <div className={`p-6 rounded-lg mb-6 ${answers[currentQuestion.id]?.toLowerCase() === currentQuestion.correct_answer?.toLowerCase() ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <h4 className={`font-bold mb-2 ${answers[currentQuestion.id]?.toLowerCase() === currentQuestion.correct_answer?.toLowerCase() ? 'text-green-800' : 'text-red-800'}`}>
                                {answers[currentQuestion.id]?.toLowerCase() === currentQuestion.correct_answer?.toLowerCase() ? 'ถูกต้อง!' : 'ผิด!'}
                            </h4>
                            <p className="text-gray-700">
                                <span className="font-bold">เฉลย: {currentQuestion.correct_answer}</span>
                                <br />
                                {currentQuestion.explanation}
                            </p>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                            disabled={currentIndex === 0}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" /> ก่อนหน้า
                        </button>
                        <button
                            onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                            disabled={currentIndex === questions.length - 1}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            ถัดไป <ChevronRight className="ml-2 h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar (Question Grid) */}
            <div className="w-64 bg-gray-50 border-l border-gray-200 overflow-y-auto p-4 hidden lg:block">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">ข้อสอบทั้งหมด</h4>
                <div className="grid grid-cols-4 gap-2">
                    {questions.map((q, idx) => (
                        <button
                            key={q.id}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-10 w-10 flex items-center justify-center rounded-md text-sm font-medium ${currentIndex === idx
                                ? 'ring-2 ring-primary ring-offset-2'
                                : ''
                                } ${flagged[q.id]
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : answers[q.id]
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>


            {/* Floating Tools */ }
            <FontResizer onResize={setFontSizeScale} currentSize={fontSizeScale} />

            <PermissionGate requiredTier="premium" type="hide">
                <AmbiencePlayer />
            </PermissionGate>

            <PacingAlert timeUsed={(questions.length * 60) - timeLeft} totalTime={questions.length * 60} />

    {
        showReportModal && (
            <ReportModal
                questionId={currentQuestion.id}
                onClose={() => setShowReportModal(false)}
            />
        )
    }
        </div >
    );
};

export default ExamTaking;
