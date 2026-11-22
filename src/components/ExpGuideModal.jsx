import React, { useEffect } from 'react';
import { X, Award, ChevronRight, Sparkles, Medal, Gem, Crown, Shield } from 'lucide-react';

const ExpGuideModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const milestones = [
    { level: 1, xp: 0, note: 'จุดเริ่มต้น', Icon: Sparkles, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/20' },
    { level: 5, xp: 1000, note: 'ปลดล็อกกรอบโปรไฟล์เริ่มต้น', Icon: Shield, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/20' },
    { level: 10, xp: 4500, note: 'Rank Bronze', Icon: Medal, color: 'text-amber-700 bg-amber-50 dark:bg-amber-500/20' },
    { level: 25, xp: 30000, note: 'Rank Silver', Icon: Medal, color: 'text-slate-600 bg-slate-100 dark:bg-slate-700/50' },
    { level: 50, xp: 122500, note: 'Rank Gold', Icon: Medal, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/20' },
    { level: 75, xp: 277500, note: 'Rank Platinum', Icon: Gem, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-500/20' },
    { level: 100, xp: 495000, note: 'Rank Diamond (Max)', Icon: Crown, color: 'text-purple-600 bg-purple-50 dark:bg-purple-500/20' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exp-guide-title"
      style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
              <Award size={22} />
            </div>
            <div>
              <h2
                id="exp-guide-title"
                className="text-xl font-black text-slate-900 dark:text-white"
                style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
              >
                ระบบ Level &amp; EXP
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                วิธีเพิ่มเลเวลและของรางวัล
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar">
          <div className="mb-7">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-3">
              ได้ EXP อย่างไร?
            </h3>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl p-4 flex gap-3.5 items-start">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-slate-900 dark:text-slate-100 font-bold mb-1">
                  ทำข้อสอบสะสมคะแนน
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  คุณจะได้รับ <strong>10 EXP</strong> ต่อ 1 คะแนนที่คุณตอบถูก! ยิ่งทำข้อสอบเยอะและแม่นยำ เลเวลก็ยิ่งขึ้นไว
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-3.5">
              ตารางเลเวล (Milestones)
            </h3>
            <div className="space-y-2.5">
              {milestones.map((m, i) => {
                const IconComp = m.Icon;
                return (
                  <div
                    key={m.level}
                    className="flex items-center p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-slate-100 dark:border-slate-800"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-base shadow-md shrink-0">
                      {m.level}
                    </div>
                    <div className="ml-3.5 flex-1 min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${m.color}`}>
                          <IconComp size={14} />
                        </span>
                        <span className="truncate">{m.note}</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">
                        {m.xp.toLocaleString()} XP สะสม
                      </div>
                    </div>
                    {i < milestones.length - 1 && (
                      <ChevronRight size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              * XP ที่ต้องใช้ในการอัปเลเวลถัดไป = เลเวลปัจจุบัน x 1000
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-black transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            เข้าใจแล้ว ลุยเลย!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpGuideModal;
