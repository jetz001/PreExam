import React, { useState, useEffect } from 'react';
import { HelpCircle, Headset, X, Send, Paperclip, MessageSquare, Bug, FileText, CreditCard, Lightbulb, ShieldAlert, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import supportService from '../../services/supportService';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const categories = [
    { id: 'bug', label: 'แจ้งบั๊ก/ระบบรวน', icon: Bug, color: 'text-red-500' },
    { id: 'content', label: 'แจ้งโจทย์/เฉลยผิด', icon: FileText, color: 'text-orange-500' },
    { id: 'payment', label: 'ชำระเงิน/โฆษณา', icon: CreditCard, color: 'text-blue-500' },
    { id: 'suggestion', label: 'เสนอแนะฟีเจอร์', icon: Lightbulb, color: 'text-yellow-500' },
    { id: 'privacy', label: 'ลบข้อมูล/บัญชี', icon: ShieldAlert, color: 'text-gray-500' },
    { id: 'report', label: 'ร้องเรียนผู้ใช้', icon: Flag, color: 'text-purple-500' },
];

const FloatingHelpWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [category, setCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!category || !subject || !description) {
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        setIsLoading(true);
        try {
            // Collect Auto-Detected Info
            const device_info = {
                browser: navigator.userAgent,
                os: navigator.platform,
                screen_size: `${window.innerWidth}x${window.innerHeight}`
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
            // Add more as needed

            await supportService.createTicket({
                category,
                subject,
                description,
                device_info,
                context_data
            });

            toast.success('ส่งเรื่องแจ้งปัญหาแล้ว!');
            setIsOpen(false);
            setCategory('');
            setSubject('');
            setDescription('');
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50">
            {/* Bubble Button */}
            <motion.button
                id="help-widget-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-700 transition-colors"
            >
                {isOpen ? <X size={28} /> : <Headset size={28} />}
            </motion.button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-20 right-0 w-[350px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <MessageSquare size={20} />
                                <h3 className="font-semibold text-lg">ศูนย์ช่วยเหลือด่วน</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    เลือกหัวข้อปัญหา
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">-- เลือกหัวข้อ --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    หัวข้อเรื่อง
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="สรุปปัญหาพอสังเขป"
                                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    รายละเอียด
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="อธิบายปัญหาที่คุณพบ..."
                                    rows={4}
                                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    "กำลังส่ง..."
                                ) : (
                                    <>
                                        <Send size={18} />
                                        <span>ส่ง Ticket</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 text-center">
                            <a href="/contact" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                                เข้าสู่ศูนย์ช่วยเหลือเต็มรูปแบบ
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FloatingHelpWidget;
