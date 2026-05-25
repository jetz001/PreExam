import React from 'react';
import { Users, Flag, CheckCircle2, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TutorDashboard = ({ participants = [], totalQuestions = 0, onEndExam }) => {
    // Sort participants by score (desc), then by progress (desc)
    const sortedParticipants = [...participants].sort((a, b) => {
        const scoreDiff = (b.score || 0) - (a.score || 0);
        if (scoreDiff !== 0) return scoreDiff;
        
        const progA = a.status === 'finished' ? totalQuestions : (a.current_question_index || 0);
        const progB = b.status === 'finished' ? totalQuestions : (b.current_question_index || 0);
        return progB - progA;
    });

    return (
        <div className="flex flex-col h-full bg-[#f2f2f2] font-sans p-6 overflow-hidden">
            <div className="bg-white p-6 rounded-2xl shadow-md mb-6 flex justify-between items-center border-b-4 border-gray-200">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                        <Users className="text-[#1368ce]" size={28} />
                        สถานะผู้เข้าร่วมสอบ (Dashboard)
                    </h2>
                    <p className="text-gray-500 font-bold mt-1 text-sm">
                        เรียงลำดับตามคะแนนและความคืบหน้าแบบ Real-time
                    </p>
                </div>
                <button
                    onClick={onEndExam}
                    className="bg-[#e21b3c] hover:bg-[#c91835] text-white px-6 py-3 rounded-xl font-black shadow-[0_6px_0_#b3152d] active:translate-y-[6px] active:shadow-none transition-all flex items-center gap-2"
                >
                    <Flag size={20} />
                    จบเกมและดูเฉลย
                </button>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 overflow-y-auto">
                {sortedParticipants.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <Users size={64} className="mb-4 opacity-50" />
                        <h3 className="text-xl font-bold">ยังไม่มีผู้เข้าร่วม</h3>
                    </div>
                ) : (
                    <motion.div layout className="flex flex-col gap-4">
                        <AnimatePresence>
                            {sortedParticipants.map((p, idx) => {
                                const isFinished = p.status === 'finished';
                                let progressCount = isFinished ? totalQuestions : (p.current_question_index || 0);
                                if (progressCount > totalQuestions) progressCount = totalQuestions;

                                const percent = totalQuestions > 0 ? (progressCount / totalQuestions) * 100 : 0;
                                const isCompleted = percent === 100 || isFinished;
                                const avatarInitial = p.User?.display_name?.charAt(0).toUpperCase() || '?';
                                const rank = idx + 1;

                                return (
                                    <motion.div 
                                        key={p.user_id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-shadow relative overflow-hidden ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                                    >
                                        {/* Rank Badge */}
                                        <div className="flex flex-col items-center justify-center w-8">
                                            {rank === 1 ? (
                                                <Trophy className="text-yellow-500 mb-1" size={24} />
                                            ) : rank === 2 ? (
                                                <Trophy className="text-gray-400 mb-1" size={20} />
                                            ) : rank === 3 ? (
                                                <Trophy className="text-amber-600 mb-1" size={18} />
                                            ) : (
                                                <span className="font-bold text-gray-400">#{rank}</span>
                                            )}
                                        </div>

                                        {/* Avatar */}
                                        <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center font-black text-white text-xl shadow-inner ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}>
                                            {p.User?.avatar ? (
                                                <img src={p.User.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                avatarInitial
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-lg text-gray-800 truncate">{p.User?.display_name || 'ผู้เล่น'}</span>
                                                    {isCompleted && <CheckCircle2 className="text-green-500" size={20} />}
                                                </div>
                                                <div className="flex gap-4 items-center">
                                                    <div className="text-right">
                                                        <span className="text-xs font-bold text-gray-500 block uppercase tracking-wider">คะแนน</span>
                                                        <span className="font-black text-xl text-blue-600">{p.score || 0}</span>
                                                    </div>
                                                    <div className="text-right w-20">
                                                        <span className="text-xs font-bold text-gray-500 block uppercase tracking-wider">ความคืบหน้า</span>
                                                        <span className={`font-black text-lg ${isCompleted ? 'text-green-600' : 'text-gray-700'}`}>
                                                            {progressCount}/{totalQuestions}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner relative">
                                                <div 
                                                    className={`h-full transition-all duration-700 ease-out ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default TutorDashboard;
