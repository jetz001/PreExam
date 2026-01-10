import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import examService from '../services/examService';
import { ChevronLeft, Award, XCircle, CheckCircle, Clock } from 'lucide-react';
import AdSlot from '../components/ads/AdSlot';

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
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 transition mb-4">
                <ChevronLeft size={20} /> Back to Dashboard
            </button>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className={`p-8 text-center ${isPassed ? 'bg-gradient-to-b from-green-50 to-white dark:from-green-900/20 dark:to-slate-800' : 'bg-gradient-to-b from-red-50 to-white dark:from-red-900/20 dark:to-slate-800'}`}>
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white dark:bg-slate-700 shadow-md mb-4">
                        {isPassed ? <Award size={48} className="text-yellow-500" /> : <XCircle size={48} className="text-red-500" />}
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
                        {isPassed ? 'Congratulations!' : 'Keep Practicing!'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        You have {isPassed ? 'passed' : 'failed'} the {result.exam_set_name || 'Practice Exam'}.
                    </p>

                    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                        <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                            <span className="block text-sm text-gray-500 dark:text-gray-400">Score</span>
                            <span className={`block text-2xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                                {result.score} <span className="text-sm text-gray-400">/ {result.total_score}</span>
                            </span>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                            <span className="block text-sm text-gray-500 dark:text-gray-400">Time Taken</span>
                            <span className="block text-2xl font-bold text-gray-800 dark:text-white">
                                {result.time_taken ? `${Math.floor(result.time_taken / 60)}m` : 'N/A'}
                            </span>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                            <span className="block text-sm text-gray-500 dark:text-gray-400">Date</span>
                            <span className="block text-lg font-bold text-gray-800 dark:text-white mt-1">
                                {new Date(result.taken_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Ads Component */}
                <div className="p-8 pb-0 border-t dark:border-slate-700 bg-gray-50/50">
                    <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Recommended for you</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AdSlot placement="result-page-1" />
                        <AdSlot placement="result-page-2" />
                    </div>
                </div>

                {/* Question Breakdown Placeholder - Ideally logic to show answers */}
                {result.questions && (
                    <div className="p-8 border-t dark:border-slate-700">
                        <h3 className="text-xl font-bold mb-6">Detailed Analysis</h3>
                        <div className="space-y-4">
                            {result.questions.map((q, idx) => (
                                <div key={idx} className="p-6 rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                                    <div className="flex gap-4">
                                        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${q.is_correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {idx + 1}
                                        </span>
                                        <div className="flex-1">
                                            <p className="font-medium text-lg text-gray-800 dark:text-gray-200 mb-4">{q.question_text}</p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                {['a', 'b', 'c', 'd'].map((option) => {
                                                    const choiceKey = `choice_${option}`;
                                                    const choiceText = q[choiceKey];
                                                    let className = "p-3 rounded-lg border text-sm ";

                                                    // Highlighting logic
                                                    const choiceLower = option.toLowerCase();
                                                    const correctLower = q.correct_answer ? q.correct_answer.toString().trim().toLowerCase() : '';
                                                    const userLower = q.user_answer ? q.user_answer.toString().trim().toLowerCase() : '';

                                                    if (choiceLower === correctLower) {
                                                        className += "bg-green-50 border-green-200 text-green-800 font-medium ring-1 ring-green-400"; // Correct Answer
                                                    } else if (choiceLower === userLower && !q.is_correct) {
                                                        className += "bg-red-50 border-red-200 text-red-800 font-medium ring-1 ring-red-400"; // Wrong Answer
                                                    } else {
                                                        className += "bg-gray-50 border-gray-100 text-gray-600"; // Neutral
                                                    }

                                                    return (
                                                        <div key={option} className={className}>
                                                            <span className="font-bold uppercase mr-2">{option}.</span> {choiceText}
                                                            {choiceLower === userLower && <span className="float-right text-xs bg-gray-200 px-2 rounded-full">You</span>}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Explanation Section */}
                                            <div className={`mt-4 p-4 rounded-lg text-sm ${q.is_correct ? 'bg-blue-50 text-blue-800' : 'bg-orange-50 text-orange-800'}`}>
                                                <div className="font-bold mb-1 flex items-center">
                                                    <Clock size={16} className="mr-2" /> Explanation
                                                </div>
                                                <p>{q.explanation || "No explanation provided."}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamResult;
