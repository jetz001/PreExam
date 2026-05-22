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
                    className="fixed bottom-0 left-0 right-0 md:bottom-4 md:left-4 md:right-4 md:max-w-md z-[9999]"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-3xl shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] md:shadow-2xl border-t md:border border-gray-100 dark:border-gray-700 p-4 md:p-6 flex flex-col gap-3 md:gap-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 md:p-3 rounded-2xl text-indigo-600 hidden md:block">
                                <Cookie size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                    <Cookie size={18} className="md:hidden text-indigo-600" />
                                    เราใช้คุกกี้
                                </h3>
                                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    เราใช้คุกกี้เพื่อประสบการณ์ที่ดี <Link to="/policy" className="text-indigo-600 hover:underline inline-flex items-center gap-0.5 whitespace-nowrap">รายละเอียด <ExternalLink size={10} /></Link>
                                </p>
                            </div>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors -mr-2 -mt-2 p-2"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex gap-2 md:gap-3">
                            <button
                                onClick={handleAccept}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all shadow-md active:scale-95 text-sm md:text-base"
                            >
                                ยอมรับ
                            </button>
                            <Link
                                to="/policy"
                                className="px-3 py-2 md:py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg md:rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-center text-xs md:text-sm flex items-center"
                            >
                                เพิ่มเติม
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
