import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import communityService from '../../services/communityService';

const SharePostModal = ({ post, businessName, onClose }) => {
    const [content, setContent] = useState(`ตรวจสอบโพสต์นี้จาก ${businessName}: ${post.title}\n\n`);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await communityService.shareBusinessPost({
                postId: post.id,
                content,
            });
            onClose(true);
        } catch (error) {
            console.error(error);
            toast.error('ไม่สามารถแชร์โพสต์ได้ กรุณาเข้าสู่ระบบหรือลองใหม่อีกครั้ง');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md"
            aria-labelledby="share-post-modal-title"
            role="dialog"
            aria-modal="true"
            onClick={() => onClose(false)}
        >
            <div
                className="relative w-full max-w-lg rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/15 shadow-2xl p-5 sm:p-6 text-left"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    aria-label="ปิดหน้าต่าง"
                    className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    onClick={() => onClose(false)}
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-start gap-3.5 pr-8">
                    <div className="flex-shrink-0 flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white" id="share-post-modal-title">
                            พูดคุยเกี่ยวกับโพสต์นี้
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                            เริ่มหัวข้อสนทนาเกี่ยวกับ &ldquo;{post.title}&rdquo; ในชุมชน
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-4">
                    <textarea
                        className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        rows={4}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="แสดงความคิดเห็นของคุณ..."
                    />

                    <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
                        <button
                            type="button"
                            className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 bg-white dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            onClick={() => onClose(false)}
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-xl px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-md hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            disabled={isSubmitting}
                        >
                            <Send className="w-4 h-4" />
                            <span>{isSubmitting ? 'กำลังส่ง...' : 'โพสต์ลงชุมชน'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SharePostModal;
