import React, { useState } from 'react';
import {
    Headset,
    X,
    Send,
    Paperclip,
    MessageSquare,
    Bug,
    FileText,
    CreditCard,
    Lightbulb,
    ShieldAlert,
    Flag,
    ArrowUpRight,
    Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import supportService from '../../services/supportService';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useLocation, Link } from 'react-router-dom';

const categories = [
    { id: 'bug', label: 'แจ้งบั๊ก/ระบบรวน', icon: Bug, color: 'text-rose-400', badge: 'bg-rose-500/15 border-rose-400/30' },
    { id: 'content', label: 'แจ้งโจทย์/เฉลยผิด', icon: FileText, color: 'text-amber-400', badge: 'bg-amber-500/15 border-amber-400/30' },
    { id: 'payment', label: 'ชำระเงิน/โฆษณา', icon: CreditCard, color: 'text-sky-400', badge: 'bg-sky-500/15 border-sky-400/30' },
    { id: 'suggestion', label: 'เสนอแนะฟีเจอร์', icon: Lightbulb, color: 'text-yellow-300', badge: 'bg-yellow-500/15 border-yellow-400/30' },
    { id: 'privacy', label: 'ลบข้อมูล/บัญชี', icon: ShieldAlert, color: 'text-slate-300', badge: 'bg-slate-500/20 border-slate-400/30' },
    { id: 'report', label: 'ร้องเรียนผู้ใช้', icon: Flag, color: 'text-purple-300', badge: 'bg-purple-500/15 border-purple-400/30' },
];

const FloatingHelpWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [category, setCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();

    const handleFileChange = (e) => {
        if (e.target.files?.[0]) {
            setAttachment(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!category || !subject || !description) {
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        setIsLoading(true);
        try {
            let attachment_url = null;
            if (attachment) {
                setIsUploading(true);
                const formData = new FormData();
                formData.append('file', attachment);
                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                if (uploadRes.data.success) {
                    attachment_url = uploadRes.data.url;
                }
                setIsUploading(false);
            }

            // Collect Auto-Detected Info
            const device_info = {
                browser: navigator.userAgent,
                os: navigator.platform,
                screen_size: `${window.innerWidth}x${window.innerHeight}`,
            };

            // Collect Smart Context
            const context_data = {};
            const pathParts = location.pathname.split('/');
            if (location.pathname.includes('/exams/')) {
                context_data.exam_id = pathParts[pathParts.length - 1];
            }
            if (location.pathname.includes('/shop/')) {
                context_data.shop_id = pathParts[pathParts.length - 1];
            }

            if (attachment_url) {
                context_data.attachment_url = attachment_url;
            }

            await supportService.createTicket({
                category,
                subject,
                description,
                device_info,
                context_data,
                attachment_url,
            });

            toast.success('ส่งเรื่องแจ้งปัญหาแล้ว!');
            setIsOpen(false);
            setCategory('');
            setSubject('');
            setDescription('');
            setAttachment(null);
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล');
        } finally {
            setIsLoading(false);
            setIsUploading(false);
        }
    };

    return (
        <div
            className="fixed bottom-28 right-4 md:bottom-24 md:right-6 z-50"
            style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
        >
            {/* Bubble Button */}
            <motion.button
                id="help-widget-btn"
                type="button"
                aria-label={isOpen ? 'ปิดหน้าต่างช่วยเหลือ' : 'เปิดศูนย์ช่วยเหลือด่วน'}
                aria-expanded={isOpen}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center text-white shadow-[0_12px_30px_rgba(79,70,229,0.5)] border border-white/25 hover:brightness-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
                {isOpen ? <X size={25} /> : <Headset size={25} />}
            </motion.button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 18, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 18, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        role="dialog"
                        aria-label="ศูนย์ช่วยเหลือด่วน"
                        className="absolute bottom-18 right-0 w-[calc(100vw-2rem)] sm:w-[376px] max-w-[376px] max-h-[74vh] flex flex-col bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_24px_64px_rgba(8,3,28,0.65)] border border-white/18 overflow-hidden text-white"
                    >
                        <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
                                    <MessageSquare size={17} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-base leading-tight">ศูนย์ช่วยเหลือด่วน</h3>
                                    <p className="text-[11px] text-indigo-100/85">แจ้งปัญหาหรือสอบถามทีมงาน</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                aria-label="ปิดหน้าต่างช่วยเหลือ"
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="p-4 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1"
                        >
                            <div>
                                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                                    เลือกหัวข้อปัญหา
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {categories.map((cat) => {
                                        const IconComp = cat.icon;
                                        const active = category === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setCategory(cat.id)}
                                                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                                    active
                                                        ? 'bg-indigo-600/35 border-indigo-400 text-white shadow-sm'
                                                        : 'bg-white/6 border-white/12 text-slate-200 hover:bg-white/12'
                                                }`}
                                            >
                                                <span
                                                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${cat.badge} ${cat.color}`}
                                                >
                                                    <IconComp size={13} />
                                                </span>
                                                <span className="truncate">{cat.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="help-subject"
                                    className="block text-xs font-bold text-slate-200 mb-1.5"
                                >
                                    หัวข้อเรื่อง
                                </label>
                                <input
                                    id="help-subject"
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="สรุปปัญหาพอสังเขป"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/18 bg-white/8 text-sm text-white placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus:border-indigo-400 transition-colors"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="help-description"
                                    className="block text-xs font-bold text-slate-200 mb-1.5"
                                >
                                    รายละเอียด
                                </label>
                                <textarea
                                    id="help-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="อธิบายปัญหาที่คุณพบ..."
                                    rows={3}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/18 bg-white/8 text-sm text-white placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus:border-indigo-400 resize-none transition-colors"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="help-attachment"
                                    className="text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5"
                                >
                                    <Paperclip size={13} className="text-indigo-300" />
                                    <span>ไฟล์แนบ (ถ้ามี)</span>
                                </label>
                                <input
                                    id="help-attachment"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full p-2 text-xs text-slate-200 border border-white/18 rounded-xl bg-white/6 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-500/30 file:text-indigo-100 hover:file:bg-indigo-500/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || isUploading}
                                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:brightness-110 text-white font-extrabold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                {isLoading || isUploading ? (
                                    <>
                                        <Loader2 size={17} className="animate-spin" />
                                        <span>กำลังส่ง...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        <span>ส่ง Ticket</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="px-4 py-3 bg-slate-950/65 border-t border-white/12 text-center shrink-0">
                            <Link
                                to="/contact"
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-amber-200 font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                            >
                                <span>เข้าสู่ศูนย์ช่วยเหลือเต็มรูปแบบ</span>
                                <ArrowUpRight size={14} />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FloatingHelpWidget;
