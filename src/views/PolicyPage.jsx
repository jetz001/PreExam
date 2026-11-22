import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, Sparkles, Lock, Eye, Database, UserCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import api from '../services/api';
import '../assets/css/contact.css';

const DEFAULT_POLICY_SECTIONS = [
    {
        title: '1. ข้อมูลที่เราจัดเก็บ',
        body: 'เราจัดเก็บข้อมูลที่คุณให้ไว้ เช่น ชื่อ อีเมล รูปโปรไฟล์ และประวัติการทำข้อสอบ เพื่อวิเคราะห์ผลคะแนนและพัฒนาเนื้อหาข้อสอบให้ดียิ่งขึ้น',
        Icon: Database,
        color: 'text-sky-300 bg-sky-500/15 border-sky-400/30',
    },
    {
        title: '2. วัตถุประสงค์ในการใช้ข้อมูล',
        body: 'เราใช้ข้อมูลเพื่อยืนยันตัวตน แสดงสถิติการเรียนรู้ของคุณ แนะนำแนวข้อสอบที่เหมาะสม และดูแลให้บริการช่วยเหลือสมาชิก',
        Icon: Eye,
        color: 'text-amber-300 bg-amber-500/15 border-amber-400/30',
    },
    {
        title: '3. ความปลอดภัยและการเก็บรักษา',
        body: 'เราใช้มาตรการเข้ารหัสและการควบคุมสิทธิ์ที่ได้มาตรฐาน เพื่อปกป้องข้อมูลส่วนบุคคลและไม่มีนโยบายจำหน่ายข้อมูลให้บุคคลภายนอก',
        Icon: Lock,
        color: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30',
    },
    {
        title: '4. สิทธิของเจ้าของข้อมูล',
        body: 'คุณสามารถตรวจสอบ แก้ไข หรือแจ้งขอลบข้อมูลและบัญชีผู้ใช้งานได้ทุกเมื่อผ่านศูนย์ช่วยเหลือของ PreExam',
        Icon: UserCheck,
        color: 'text-pink-300 bg-pink-500/15 border-pink-400/30',
    },
];

const PolicyPage = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shapes, setShapes] = useState([]);

    useEffect(() => {
        const shapeTypes = ['c-circle', 'c-square', 'c-triangle'];
        const newShapes = Array.from({ length: 14 }, (_, i) => ({
            id: i,
            type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
            left: `${Math.random() * 100}vw`,
            size: `${28 + Math.random() * 44}px`,
            delay: `${Math.random() * 10}s`,
            duration: `${16 + Math.random() * 14}s`,
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
                console.error('Failed to fetch policy', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPolicy();
    }, []);

    return (
        <div className="contact-page">
            {/* Background Shapes */}
            {shapes.map((s) => (
                <div
                    key={s.id}
                    aria-hidden="true"
                    className={`c-shape ${s.type}`}
                    style={{
                        left: s.left,
                        width: s.type !== 'c-triangle' ? s.size : undefined,
                        height: s.type !== 'c-triangle' ? s.size : undefined,
                        '--s': s.type === 'c-triangle' ? s.size : undefined,
                        animationDelay: s.delay,
                        animationDuration: s.duration,
                    }}
                />
            ))}

            <div className="contact-page-container max-w-4xl">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/18 border border-white/18 text-white font-bold text-sm transition-all mb-8 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>กลับ</span>
                </button>

                <div className="text-center mb-10 space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-emerald-200 backdrop-blur-md">
                        <Sparkles size={14} className="text-emerald-300" />
                        <span>Legal & Privacy</span>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-600 p-[1px] shadow-[0_12px_32px_rgba(16,185,129,0.35)]">
                            <div className="w-full h-full rounded-[15px] bg-slate-950/35 backdrop-blur-md flex items-center justify-center text-emerald-200">
                                <ShieldCheck size={32} />
                            </div>
                        </div>
                        <motion.h1
                            initial={{ opacity: 0, y: -14 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="c-header-title"
                        >
                            นโยบายความเป็นส่วนตัว
                        </motion.h1>
                    </div>

                    <p className="text-base sm:text-lg text-slate-200 font-semibold">Privacy Policy — PreExam Thailand</p>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-300/30 text-xs text-amber-200 font-bold">
                        <span>
                            ฉบับปรับปรุงล่าสุด:{' '}
                            {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="c-card p-6 sm:p-10 space-y-4 animate-pulse">
                        <div className="h-6 w-1/3 rounded-lg bg-white/15" />
                        <div className="h-4 w-full rounded-lg bg-white/10" />
                        <div className="h-4 w-5/6 rounded-lg bg-white/10" />
                        <div className="h-4 w-2/3 rounded-lg bg-white/10" />
                    </div>
                ) : content ? (
                    <div className="c-card p-6 sm:p-10">
                        <div
                            className="c-prose max-w-none text-slate-100 text-sm sm:text-base leading-relaxed break-words"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
                        />
                    </div>
                ) : (
                    <div className="c-card p-6 sm:p-10 space-y-6">
                        <p className="text-sm sm:text-base text-slate-200 leading-relaxed text-center max-w-2xl mx-auto">
                            PreExam Thailand ให้ความสำคัญสูงสุดกับความเป็นส่วนตัวและความปลอดภัยของข้อมูลส่วนบุคคลของคุณ
                            โปรดศึกษารายละเอียดแนวทางการจัดเก็บและคุ้มครองข้อมูลด้านล่างนี้
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {DEFAULT_POLICY_SECTIONS.map((sec) => {
                                const IconComp = sec.Icon;
                                return (
                                    <section
                                        key={sec.title}
                                        className="rounded-2xl bg-white/6 border border-white/14 p-5 space-y-2.5"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${sec.color}`}
                                            >
                                                <IconComp size={18} />
                                            </span>
                                            <h2 className="font-extrabold text-amber-200 text-base">{sec.title}</h2>
                                        </div>
                                        <p className="text-sm text-slate-200 leading-relaxed">{sec.body}</p>
                                    </section>
                                );
                            })}
                        </div>
                        <div className="pt-2 text-center">
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/18 border border-white/18 text-sm font-bold text-amber-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                ติดต่อเจ้าหน้าที่เกี่ยวกับข้อมูลส่วนบุคคล
                            </Link>
                        </div>
                    </div>
                )}

                <div className="mt-10 text-center text-slate-300 font-semibold text-xs sm:text-sm">
                    © {new Date().getFullYear()} PreExam Thailand. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default PolicyPage;
