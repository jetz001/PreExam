import React from 'react';
import { X, Award, ChevronRight } from 'lucide-react';

const ExpGuideModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    // Define key milestones from the draft
    const milestones = [
        { level: 1, xp: 0, note: "จุดเริ่มต้น" },
        { level: 5, xp: 1000, note: "ปลดล็อกกรอบโปรไฟล์เริ่มต้น" },
        { level: 10, xp: 4500, note: "🥉 Rank Bronze" },
        { level: 25, xp: 30000, note: "🥈 Rank Silver" },
        { level: 50, xp: 122500, note: "🥇 Rank Gold" },
        { level: 75, xp: 277500, note: "💎 Rank Platinum" },
        { level: 100, xp: 495000, note: "👑 Rank Diamond (Max)" },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Award size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">ระบบ Level & EXP</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">วิธีเพิ่มเลเวลและของรางวัล</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">ได้ EXP อย่างไร?</h3>
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-2xl p-4 flex gap-4 items-start">
                            <div className="text-amber-500 text-2xl">✨</div>
                            <div>
                                <p className="text-gray-800 dark:text-gray-200 font-medium mb-1">ทำข้อสอบสะสมคะแนน</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    คุณจะได้รับ <strong>10 EXP</strong> ต่อ 1 คะแนนที่คุณตอบถูก! ยิ่งทำข้อสอบเยอะและแม่นยำ เลเวลก็ยิ่งขึ้นไว
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">ตารางเลเวล (Milestones)</h3>
                        <div className="space-y-3">
                            {milestones.map((m, i) => (
                                <div key={m.level} className="flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-slate-700">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                                        {m.level}
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <div className="font-bold text-gray-900 dark:text-white">{m.note}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">
                                            {m.xp.toLocaleString()} XP สะสม
                                        </div>
                                    </div>
                                    {i < milestones.length - 1 && (
                                        <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            * XP ที่ต้องใช้ในการอัปเลเวลถัดไป = เลเวลปัจจุบัน x 1000
                        </p>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-center">
                    <button onClick={onClose} className="w-full py-3 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white rounded-xl font-bold transition-transform active:scale-95">
                        เข้าใจแล้ว ลุยเลย!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpGuideModal;
