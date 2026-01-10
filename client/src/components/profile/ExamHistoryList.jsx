import React, { useState, useEffect } from 'react';
import examService from '../../services/examService';
import { useNavigate } from 'react-router-dom';

const ExamHistoryList = ({ history }) => {
    const [exams, setExams] = useState(history || []);
    const [loading, setLoading] = useState(!history);
    const navigate = useNavigate();

    useEffect(() => {
        if (!history) {
            const fetchHistory = async () => {
                try {
                    const data = await examService.getHistory();
                    setExams(data.data || []);
                } catch (error) {
                    console.error("Failed to fetch history");
                } finally {
                    setLoading(false);
                }
            };
            fetchHistory();
        }
    }, [history]);

    if (loading) return <div>Loading history...</div>;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Recent Exam History</h3>
            <div className="space-y-4">
                {exams.length === 0 ? (
                    <p className="text-gray-500 py-4 text-center">No exams taken yet. Start practicing!</p>
                ) : (
                    exams.map(exam => (
                        <div key={exam.id} className="flex justify-between items-center p-3 border-b dark:border-slate-700 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{exam.exam_set_name || exam.title || 'Practice Exam'}</p>
                                <span className="text-xs text-gray-500">
                                    {new Date(exam.taken_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    {(() => {
                                        const percentage = exam.total_score > 0 ? (exam.score / exam.total_score) * 100 : 0;
                                        let scoreColor = 'text-red-500';
                                        if (percentage >= 80) scoreColor = 'text-green-500';
                                        else if (percentage >= 50) scoreColor = 'text-yellow-500';

                                        return (
                                            <span className={`block text-lg font-bold ${scoreColor}`}>
                                                {exam.score} <span className="text-xs text-gray-400">/ {exam.total_score}</span>
                                                <span className="text-xs ml-1 font-medium opacity-80">({Math.round(percentage)}%)</span>
                                            </span>
                                        );
                                    })()}
                                </div>
                                <button onClick={() => navigate(`/exam/result/${exam.id}`)} className="text-sm text-blue-600 hover:underline">Detail</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ExamHistoryList;
