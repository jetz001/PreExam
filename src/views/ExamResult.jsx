import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import examService from '../services/examService';
import { ChevronLeft, Loader2, FileQuestion, RotateCcw } from 'lucide-react';
import ExamResultComponent from '../components/ExamResult';

const ExamResult = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const data = await examService.getResultById(id);
                setResult(data.data || data);
            } catch (err) {
                console.error(err);
                setError("Could not load exam details.");
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [id]);

    if (loading) {
        return (
            <div
                role="status"
                aria-live="polite"
                className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#2e0b66] via-[#46178f] to-[#6d28d9] font-['Sarabun','Nunito',sans-serif]"
            >
                <div className="bg-white/10 backdrop-blur-xl border border-white/25 rounded-3xl p-8 flex flex-col items-center gap-4 text-white shadow-2xl max-w-xs w-full text-center">
                    <span className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-inner">
                        <Loader2 className="w-7 h-7 animate-spin text-amber-300" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="font-extrabold text-lg">กำลังโหลดผลสอบ...</p>
                        <p className="text-xs text-white/75 mt-1">Loading Exam Result</p>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback UI or Error
    if (error || !result) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8 sm:py-12 font-['Sarabun','Nunito',sans-serif]">
                <div className="max-w-2xl mx-auto">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        aria-label="ย้อนกลับ"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 font-bold text-sm mb-6 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
                    >
                        <ChevronLeft size={18} aria-hidden="true" />
                        <span>ย้อนกลับ</span>
                    </button>

                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/70 p-6 sm:p-10 rounded-3xl shadow-xl text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-400/35 flex items-center justify-center text-amber-600 dark:text-amber-300 shadow-inner">
                            <FileQuestion size={30} aria-hidden="true" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
                            ไม่พบข้อมูลผลสอบ
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mb-5">
                            {error || "The requested exam result does not exist."}
                        </p>
                        <div className="p-3.5 bg-amber-50/90 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl text-xs sm:text-sm font-medium max-w-md mx-auto mb-6">
                            หมายเหตุ: ระบบแสดงผลสอบเฉพาะรหัสประวัติการสอบที่มีอยู่ในฐานข้อมูลเท่านั้น
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/exam')}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 cursor-pointer"
                        >
                            <RotateCcw size={17} aria-hidden="true" />
                            <span>ไปที่หน้าคลังข้อสอบ</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <ExamResultComponent result={result} onRetry={() => navigate('/exam')} />;
};

export default ExamResult;
