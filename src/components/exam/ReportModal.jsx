import React, { useState } from 'react';
import { X, AlertTriangle, Loader2, Send } from 'lucide-react';
import reportService from '../../services/reportService';
import toast from 'react-hot-toast';

const ReportModal = ({ questionId, onClose }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) return;

        setLoading(true);
        try {
            await reportService.submitReport(questionId, reason);
            toast.success('ขอบคุณสำหรับการแจ้งปัญหา เราจะตรวจสอบโดยเร็วที่สุด');
            onClose();
        } catch (error) {
            console.error('Error submitting report:', error);
            toast.error('เกิดข้อผิดพลาดในการส่งรายงาน');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
            className="fixed inset-0 z-[1000] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 font-['Sarabun','Nunito',sans-serif]"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700/70 w-full max-w-md overflow-hidden"
            >
                <div className="flex justify-between items-center p-5 border-b border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0 shadow-inner">
                            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                        </span>
                        <div>
                            <h3 id="report-modal-title" className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                                แจ้งปัญหาข้อสอบ
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                ข้อสอบรหัส #{questionId}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="ปิดหน้าต่างแจ้งปัญหา"
                        className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label
                            htmlFor="report-reason"
                            className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2"
                        >
                            รายละเอียดปัญหา
                        </label>
                        <textarea
                            id="report-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl p-3.5 h-32 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus:border-rose-500 transition-all"
                            placeholder="เช่น เฉลยผิด, โจทย์ไม่ชัดเจน, รูปภาพไม่แสดง..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2.5 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !reason.trim()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                    <span>กำลังส่ง...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" aria-hidden="true" />
                                    <span>ส่งรายงาน</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
