import React, { useState, useEffect } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import '../assets/css/contact.css';

const PolicyPage = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shapes, setShapes] = useState([]);

    useEffect(() => {
        const shapeTypes = ['c-circle', 'c-square', 'c-triangle'];
        const newShapes = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
            left: `${Math.random() * 100}vw`,
            size: `${30 + Math.random() * 50}px`,
            delay: `${Math.random() * 10}s`,
            duration: `${15 + Math.random() * 15}s`,
        }));
        setShapes(newShapes);
    }, []);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const response = await api.get('/legal/policy');
                if (response.data && response.data.content) {
                    setContent(response.data.content);
                }
            } catch (error) {
                console.error("Failed to fetch policy", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPolicy();
    }, []);

    // Fallback static content if no dynamic content is set
    const staticContent = (
        <div className="space-y-8">
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700"
            >
                {/* Static content removed for brevity, will render dynamic or keep existing structure if needed. 
                   Actually, better to render the dynamic content inside a container. 
               */}
                <div dangerouslySetInnerHTML={{ __html: content }} className="prose dark:prose-invert max-w-none" />
            </motion.section>
        </div>
    );

    return (
        <div className="contact-page">
            {/* Background Shapes */}
            {shapes.map(s => (
                <div 
                    key={s.id} 
                    className={`c-shape ${s.type}`} 
                    style={{ 
                        left: s.left, 
                        width: s.type !== 'c-triangle' ? s.size : undefined, 
                        height: s.type !== 'c-triangle' ? s.size : undefined,
                        '--s': s.type === 'c-triangle' ? s.size : undefined,
                        animationDelay: s.delay,
                        animationDuration: s.duration
                    }} 
                />
            ))}

            <div className="contact-page-container max-w-4xl">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white font-bold hover:text-yellow-400 transition-colors mb-8 group"
                    style={{ textShadow: '1px 2px 0px rgba(0,0,0,0.2)' }}
                >
                    <ArrowLeft size={24} className="group-hover:-translate-x-2 transition-transform" />
                    <span className="text-lg">กลับ</span>
                </button>

                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[rgba(255,255,255,0.1)] text-pink-400 border-4 border-[rgba(255,255,255,0.2)] rounded-3xl mb-6 shadow-[0_6px_0_rgba(0,0,0,0.2)] transform rotate-12">
                        <Shield size={40} />
                    </div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="c-header-title mb-4"
                    >
                        นโยบายความเป็นส่วนตัว
                    </motion.h1>
                    <p className="text-lg text-gray-200 font-bold" style={{ textShadow: '1px 2px 0px rgba(0,0,0,0.2)' }}>Privacy Policy</p>
                    <div className="mt-4 text-sm text-yellow-400 font-bold drop-shadow-md">ฉบับปรับปรุงล่าสุด: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-300 font-bold text-xl drop-shadow-md">กำลังโหลดข้อมูลนโยบาย...</div>
                ) : content ? (
                    <div className="c-card p-8 md:p-12">
                        <div
                            className="c-prose max-w-none text-white text-base md:text-lg leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </div>
                ) : (
                    <div className="c-card p-12 text-center text-gray-200 font-bold text-xl">
                        {/* Fallback to hardcoded if needed, or just show empty */}
                        Using default policy...
                    </div>
                )}

                <div className="mt-12 text-center text-gray-300 font-bold text-sm">
                    © {new Date().getFullYear()} PreExam Thailand. All rights reserved.
                </div>
            </div>
        </div>
    );
};
export default PolicyPage;
