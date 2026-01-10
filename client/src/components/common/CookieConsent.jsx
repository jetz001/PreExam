import React, { useState, useEffect } from 'react';
import { Cookie, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent_accepted');
        if (!consent) {
            // Show after a short delay
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent_accepted', 'true');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-[9999]"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-2xl text-indigo-600">
                                <Cookie size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                    เราใช้คุกกี้เพื่อประสบการณ์ที่ดี
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    PreExam ใช้คุกกี้เพื่อเพิ่มประสิทธิภาพในการใช้งานและจดจำการตั้งค่าของคุณ
                                    การใช้งานต่อถือว่าคุณยอมรับ <Link to="/policy" className="text-indigo-600 hover:underline inline-flex items-center gap-0.5">นโยบายความเป็นส่วนตัว <ExternalLink size={12} /></Link>
                                </p>
                            </div>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleAccept}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg active:scale-95"
                            >
                                ยอมรับทั้งหมด
                            </button>
                            <Link
                                to="/policy"
                                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-center text-sm"
                            >
                                อ่านเพิ่มเติม
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
