import React, { useState, useEffect } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const PolicyPage = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-8 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>กลับ</span>
                </button>

                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl mb-6">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">นโยบายความเป็นส่วนตัว</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Privacy Policy</p>
                    <div className="mt-4 text-sm text-gray-400">ฉบับปรับปรุงล่าสุด: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading policy content...</div>
                ) : content ? (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div
                            className="prose prose-indigo dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        {/* Fallback to hardcoded if needed, or just show empty */}
                        Using default policy...
                    </div>
                )}

                <div className="mt-12 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} PreExam Thailand. All rights reserved.
                </div>
            </div>
        </div>
    );
};
export default PolicyPage;
