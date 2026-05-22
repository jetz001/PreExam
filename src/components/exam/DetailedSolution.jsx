import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, X, BookOpen } from 'lucide-react';
import PermissionGate from '../common/PermissionGate';

const DetailedSolution = ({ questions, answers }) => {
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="space-y-4 text-left">
            <h3 className="text-xl font-bold bg-gray-50 p-4 rounded-lg flex items-center">
                <BookOpen className="mr-2 text-primary" /> เฉลยและคำอธิบาย
            </h3>

            {questions.map((q, index) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correct_answer;

                return (
                    <div key={q.id} className={`border rounded-lg overflow-hidden ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
                        {/* Header */}
                        <div
                            onClick={() => toggleExpand(q.id)}
                            className={`p-4 cursor-pointer flex justify-between items-start ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}
                        >
                            <div className="flex-1">
                                <span className={`font-bold mr-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                    ข้อ {index + 1}.
                                </span>
                                <span className="text-gray-800">{q.question_text}</span>
                            </div>
                            <div className="flex items-center ml-4">
                                {isCorrect ? <Check className="text-green-500" /> : <X className="text-red-500" />}
                                {expandedId === q.id ? <ChevronUp className="ml-2 text-gray-400" /> : <ChevronDown className="ml-2 text-gray-400" />}
                            </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedId === q.id && (
                            <div className="p-4 bg-white border-t border-gray-100 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="p-3 rounded bg-gray-50 border border-gray-200">
                                        <div className="text-xs text-gray-500 mb-1">คำตอบของคุณ</div>
                                        <div className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                            {userAnswer ? `${userAnswer}. ${q['choice_' + userAnswer.toLowerCase()]}` : 'ไม่ได้ตอบ'}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded bg-green-50 border border-green-200">
                                        <div className="text-xs text-green-700 mb-1">คำตอบที่ถูกต้อง</div>
                                        <div className="font-bold text-green-700">
                                            {q.correct_answer}. {q['choice_' + q.correct_answer.toLowerCase()]}
                                        </div>
                                    </div>
                                </div>

                                <PermissionGate requiredTier="premium" type="lock">
                                    <div className="mt-4">
                                        <h4 className="font-bold text-gray-900 mb-2">คำอธิบายละเอียด</h4>
                                        <p className="text-gray-600 leading-relaxed">
                                            {q.explanation || 'ไม่มีคำอธิบายสำหรับข้อนี้'}
                                        </p>
                                        {/* Example of Deep Dive content for premium */}
                                        <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded border border-blue-100">
                                            <strong>💡 Tip:</strong> เทคนิคการจำคือ... (Premium Content Placeholder)
                                        </div>
                                    </div>
                                </PermissionGate>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default DetailedSolution;
