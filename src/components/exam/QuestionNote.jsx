import React, { useState, useEffect } from 'react';
import { NotebookPen, Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const QuestionNote = ({ questionId }) => {
    const [note, setNote] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [savedJustNow, setSavedJustNow] = useState(false);

    // Load saved note from localStorage (or API in future)
    useEffect(() => {
        const savedNote = localStorage.getItem(`note_${questionId}`);
        if (savedNote) setNote(savedNote);
        else setNote('');
        setSavedJustNow(false);
    }, [questionId]);

    const handleSave = () => {
        localStorage.setItem(`note_${questionId}`, note);
        setSavedJustNow(true);
        toast.success('บันทึกโน้ตส่วนตัวแล้ว');
        setTimeout(() => setSavedJustNow(false), 1800);
    };

    return (
        <div className="mt-4 font-['Sarabun','Nunito',sans-serif]">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label={isOpen ? 'ปิดโน้ตส่วนตัว' : 'เปิดโน้ตส่วนตัว'}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900/60 hover:bg-slate-900/80 text-amber-200 border border-amber-400/35 backdrop-blur-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer shadow-sm"
            >
                <span className="w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-300/35 flex items-center justify-center text-amber-300">
                    <NotebookPen size={14} aria-hidden="true" />
                </span>
                <span>{isOpen ? 'ซ่อนโน้ตส่วนตัว' : 'เพิ่มโน้ตส่วนตัว'}</span>
            </button>

            {isOpen && (
                <div className="mt-2.5 relative rounded-2xl bg-slate-900/75 backdrop-blur-xl border border-amber-400/35 p-3 shadow-xl">
                    <textarea
                        aria-label="ข้อความโน้ตส่วนตัว"
                        className="w-full p-3 pr-12 rounded-xl bg-amber-50/95 text-slate-800 border border-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 text-sm leading-relaxed resize-y min-h-[88px] placeholder:text-slate-400"
                        placeholder="จดโน้ตช่วยจำสำหรับข้อนี้... (เห็นเฉพาะคุณเท่านั้น)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={handleSave}
                        aria-label="บันทึกโน้ต"
                        title="บันทึกโน้ต"
                        className={`absolute bottom-5 right-5 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer shadow-sm ${
                            savedJustNow
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 hover:bg-slate-900 text-amber-200'
                        }`}
                    >
                        {savedJustNow ? (
                            <>
                                <Check size={13} aria-hidden="true" />
                                <span>บันทึกแล้ว</span>
                            </>
                        ) : (
                            <>
                                <Save size={13} aria-hidden="true" />
                                <span>บันทึก</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuestionNote;
