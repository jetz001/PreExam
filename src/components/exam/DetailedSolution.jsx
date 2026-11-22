import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, X, BookOpen, Lightbulb } from 'lucide-react';
import PermissionGate from '../common/PermissionGate';

const DetailedSolution = ({ questions, answers }) => {
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const normalize = (val) => String(val || '').trim().toUpperCase();

    return (
        <div className="space-y-3.5 text-left font-['Sarabun','Nunito',sans-serif]">
            <div className="bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/70 p-4 rounded-2xl flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-400/35 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shrink-0 shadow-inner">
                    <BookOpen size={20} aria-hidden="true" />
                </span>
                <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                        เฉลยและคำอธิบาย
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        แตะที่แต่ละข้อเพื่อดูคำตอบและแนวคิด
                    </p>
                </div>
            </div>

            {(!questions || questions.length === 0) && (
                <div className="p-8 text-center rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 text-sm font-medium">
                    ไม่มีรายการข้อสอบสำหรับแสดงเฉลย
                </div>
            )}

            {questions?.map((q, index) => {
                const qId = q.id || q.question_id;
                const userAnswer = answers[qId];
                const isCorrect = Boolean(userAnswer) && normalize(userAnswer) === normalize(q.correct_answer);
                const isExpanded = expandedId === qId;

                const strippedText = (q.question_text || '').replace(/<[^>]+>/g, '');
                const displayText = strippedText.length > 90 ? strippedText.substring(0, 90) + '...' : strippedText;

                const userChoiceText = userAnswer ? (q['choice_' + String(userAnswer).toLowerCase()] || '') : '';
                const correctChoiceText = q.correct_answer ? (q['choice_' + String(q.correct_answer).toLowerCase()] || '') : '';

                return (
                    <div
                        key={qId}
                        className={`rounded-2xl overflow-hidden border backdrop-blur-md transition-all duration-200 ${
                            isCorrect
                                ? 'border-emerald-200/90 dark:border-emerald-800/70 bg-white/90 dark:bg-slate-900/80'
                                : 'border-rose-200/90 dark:border-rose-800/70 bg-white/90 dark:bg-slate-900/80'
                        }`}
                    >
                        <button
                            type="button"
                            onClick={() => toggleExpand(qId)}
                            aria-expanded={isExpanded}
                            className={`w-full text-left p-4 cursor-pointer flex justify-between items-start gap-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                isCorrect
                                    ? 'bg-emerald-50/80 hover:bg-emerald-100/70 dark:bg-emerald-950/35 dark:hover:bg-emerald-950/55'
                                    : 'bg-rose-50/80 hover:bg-rose-100/70 dark:bg-rose-950/35 dark:hover:bg-rose-950/55'
                            }`}
                        >
                            <div className="flex-1 min-w-0 text-sm sm:text-base leading-relaxed">
                                <span className={`font-extrabold mr-2 ${isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                                    ข้อ {index + 1}.
                                </span>
                                <span className="text-slate-800 dark:text-slate-100 break-words font-medium">
                                    {displayText}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 pt-0.5">
                                <span
                                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                        isCorrect
                                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-400/40'
                                            : 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-400/40'
                                    }`}
                                >
                                    {isCorrect ? <Check size={15} strokeWidth={3} aria-hidden="true" /> : <X size={15} strokeWidth={3} aria-hidden="true" />}
                                </span>
                                <span className="text-slate-400 dark:text-slate-400">
                                    {isExpanded ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
                                </span>
                            </div>
                        </button>

                        {isExpanded && (
                            <div className="p-4 sm:p-5 bg-white/95 dark:bg-slate-900/95 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                            คำตอบของคุณ
                                        </div>
                                        <div className={`font-bold text-sm sm:text-base break-words ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {userAnswer ? `${userAnswer}. ${userChoiceText}` : 'ไม่ได้ตอบ'}
                                        </div>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800/70">
                                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-1">
                                            คำตอบที่ถูกต้อง
                                        </div>
                                        <div className="font-bold text-sm sm:text-base text-emerald-700 dark:text-emerald-300 break-words">
                                            {q.correct_answer}. {correctChoiceText}
                                        </div>
                                    </div>
                                </div>

                                <PermissionGate requiredTier="premium" type="lock">
                                    <div className="pt-1 space-y-3">
                                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                                            คำอธิบายละเอียด
                                        </h4>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                            {q.explanation || 'ไม่มีคำอธิบายสำหรับข้อนี้'}
                                        </p>
                                        <div className="p-3.5 bg-indigo-50/90 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 text-sm rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-2.5">
                                            <span className="w-7 h-7 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-600 dark:text-amber-300 shrink-0 mt-0.5">
                                                <Lightbulb size={15} aria-hidden="true" />
                                            </span>
                                            <div>
                                                <strong className="font-extrabold">Tip:</strong> เทคนิคการจำคือ... (Premium Content Placeholder)
                                            </div>
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
