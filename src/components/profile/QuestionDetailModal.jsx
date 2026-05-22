import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import examService from '../../services/examService';

const QuestionDetailModal = ({ questionId, onClose }) => {
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const res = await examService.getQuestionById(questionId);
                setQuestion(res.data);
            } catch (error) {
                console.error("Failed to load question");
            } finally {
                setLoading(false);
            }
        };
        if (questionId) fetchQuestion();
    }, [questionId]);


    if (!questionId) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">Bookmark Detail</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[80vh]">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader className="animate-spin text-blue-500" size={32} />
                        </div>
                    ) : question ? (
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{question.question_text}</h4>
                                {question.question_image && (
                                    <img src={question.question_image} alt="Question" className="rounded-lg max-h-64 object-contain mb-4 bg-gray-50" />
                                )}
                                <div className="flex gap-2">
                                    <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{question.subject}</span>
                                    {question.skill && <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">{question.skill}</span>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                {['A', 'B', 'C', 'D'].map(choice => (
                                    <div
                                        key={choice}
                                        className={`p-3 rounded-lg border-2 flex items-center
                                            ${question.correct_answer?.toLowerCase() === choice.toLowerCase()
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                                : 'border-gray-200 dark:border-slate-700'
                                            }
                                        `}
                                    >
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3
                                            ${question.correct_answer?.toLowerCase() === choice.toLowerCase()
                                                ? 'bg-green-200 text-green-800'
                                                : 'bg-gray-100 text-gray-500'
                                            }
                                        `}>
                                            {choice}
                                        </span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{question[`choice_${choice.toLowerCase()}`]}</span>
                                        {question.correct_answer?.toLowerCase() === choice.toLowerCase() && (
                                            <span className="ml-auto text-xs font-bold text-green-600 bg-white px-2 py-0.5 rounded shadow-sm">Correct Answer</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {question.explanation && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                    <h5 className="font-bold text-yellow-800 dark:text-yellow-400 mb-1">Explanation</h5>
                                    <p className="text-gray-700 dark:text-gray-300">{question.explanation}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-center text-red-500">Failed to load question details.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestionDetailModal;
