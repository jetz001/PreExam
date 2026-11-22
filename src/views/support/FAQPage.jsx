import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    ChevronDown,
    HelpCircle,
    BookOpen,
    CreditCard,
    Shield,
    MessageCircle,
    AlertCircle,
    Sparkles,
    X,
    FileCheck2,
    Send,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../assets/css/contact.css';

const CATEGORY_ACCENTS = {
    general: {
        badge: 'from-sky-500 to-indigo-600',
        border: 'border-l-sky-400',
        tag: 'ทั่วไป',
        Icon: BookOpen,
    },
    premium: {
        badge: 'from-amber-400 to-orange-500',
        border: 'border-l-amber-400',
        tag: 'พรีเมียม & ชำระเงิน',
        Icon: CreditCard,
    },
    exam: {
        badge: 'from-pink-500 to-rose-600',
        border: 'border-l-pink-400',
        tag: 'การทำข้อสอบ',
        Icon: FileCheck2,
    },
    privacy: {
        badge: 'from-emerald-400 to-teal-600',
        border: 'border-l-emerald-400',
        tag: 'ความเป็นส่วนตัว',
        Icon: Shield,
    },
};

const FAQPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [openIndex, setOpenIndex] = useState(null);
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

    const categories = [
        { id: 'all', name: 'ทั้งหมด', icon: <HelpCircle size={17} /> },
        { id: 'general', name: 'ทั่วไป', icon: <BookOpen size={17} /> },
        { id: 'premium', name: 'พรีเมียม & การชำระเงิน', icon: <CreditCard size={17} /> },
        { id: 'exam', name: 'การทำข้อสอบ', icon: <FileCheck2 size={17} /> },
        { id: 'privacy', name: 'ความเป็นส่วนตัว', icon: <Shield size={17} /> },
    ];

    const faqs = [
        {
            category: 'general',
            q: 'PreExam คืออะไร?',
            a: 'PreExam คือแพลตฟอร์มคลังข้อสอบออนไลน์ที่ช่วยให้คุณเตรียมความพร้อมสำหรับการสอบบรรจุข้าราชการและสนามสอบอื่นๆ ด้วยระบบจำลองสถานการณ์จริงและวิเคราะห์จุดแข็งจุดอ่อนของคุณ',
        },
        {
            category: 'premium',
            q: 'สมัครสมาชิกพรีเมียมยังไง?',
            a: "คุณสามารถไปที่หน้า 'จัดการแผนการใช้งาน' เลือกแผนที่ต้องการ (รายเดือนหรือรายปี) และชำระเงินผ่าน QR Code หรือบัตรเครดิตได้ทันที ระบบจะอัปเกรดสถานะให้คุณอัตโนมัติภายในไม่กี่นาที",
        },
        {
            category: 'exam',
            q: 'ทำไมคะแนนสอบไม่บันทึก?',
            a: "กรุณาตรวจสอบให้แน่ใจว่าคุณได้กดปุ่ม 'ส่งข้อสอบ' ทุกครั้งเมื่อทำเสร็จ หากกดปิดหน้าต่างไปก่อน ระบบอาจไม่สามารถบันทึกผลได้ครบถ้วน",
        },
        {
            category: 'premium',
            q: 'ลืมส่งหลักฐานการชำระเงิน ต้องทำอย่างไร?',
            a: "หากเลือกชำระแบบโอนเงินและลืมส่งสลิป คุณสามารถเปิด Ticket ในศูนย์ช่วยเหลือ หัวข้อ 'การชำระเงิน' พร้อมแนบหลักฐานเพื่อให้เจ้าหน้าที่ตรวจสอบให้ครับ",
        },
        {
            category: 'general',
            q: 'เปลี่ยนรหัสผ่านได้ที่ไหน?',
            a: "คุณสามารถเปลี่ยนรหัสผ่านได้ในส่วน 'การตั้งค่าโปรไฟล์' > 'ความปลอดภัย' หรือหากลืมรหัสผ่าน สามารถใช้เมนู 'ลืมรหัสผ่าน' ในหน้า Login เพื่อรับลิงก์รีเซ็ตทางอีเมล",
        },
        {
            category: 'exam',
            q: 'สามารถดูข้อสอบย้อนหลังได้ไหม?',
            a: "ได้ครับ! คุณสามารถดูประวัติการทำข้อสอบทั้งหมดและเฉลยละเอียดได้ที่หน้า Dashboard ในส่วน 'ประวัติการสอบ'",
        },
        {
            category: 'privacy',
            q: 'ลบข้อมูลส่วนตัวได้อย่างไร?',
            a: "เราให้ความสำคัญกับความเป็นส่วนตัวของคุณ คุณสามารถแจ้งขอลบข้อมูลหรือยกเลิกบัญชีได้ถาวรโดยการเปิด Ticket ในหัวข้อ 'นโยบายความเป็นส่วนตัว' ในศูนย์ช่วยเหลือ",
        },
    ];

    const filteredFaqs = useMemo(() => {
        return faqs.filter((faq) => {
            const matchesSearch =
                (faq.q || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
                (faq.a || '').toLowerCase().includes((searchQuery || '').toLowerCase());
            const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

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
                <div className="text-center mb-10 space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-amber-200 backdrop-blur-md">
                        <Sparkles size={14} className="text-amber-300" />
                        <span>Knowledge Base & FAQ</span>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 p-[1px] shadow-[0_12px_30px_rgba(245,158,11,0.4)]">
                            <div className="w-full h-full rounded-[15px] bg-slate-950/35 backdrop-blur-md flex items-center justify-center text-amber-200">
                                <HelpCircle size={28} />
                            </div>
                        </div>
                        <motion.h1
                            initial={{ opacity: 0, y: -14 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="c-header-title"
                        >
                            คำถามที่พบบ่อย (FAQ)
                        </motion.h1>
                    </div>
                    <p className="text-base sm:text-lg text-slate-200 font-medium">
                        ค้นหาคำตอบที่คุณต้องการได้อย่างรวดเร็วที่นี่
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Search size={20} className="text-amber-300" />
                    </div>
                    <input
                        type="text"
                        aria-label="ค้นหาคำถามหรือคำสำคัญ"
                        placeholder="ค้นหาคำถามหรือคำสำคัญ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-13 pr-12 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus:border-amber-300/80 focus:bg-white/15 transition-all text-white font-semibold placeholder:text-slate-300/75 shadow-[0_12px_32px_-8px_rgba(10,4,32,0.45)]"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            aria-label="ล้างคำค้นหา"
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-slate-200 hover:text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2.5 mb-8 justify-center">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                activeCategory === cat.id
                                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 border-amber-200 shadow-[0_8px_22px_-6px_rgba(245,158,11,0.65)] -translate-y-0.5'
                                    : 'bg-white/10 text-slate-100 hover:bg-white/18 border-white/18'
                            }`}
                        >
                            {cat.icon}
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, index) => {
                            const accent = CATEGORY_ACCENTS[faq.category] || CATEGORY_ACCENTS.general;
                            const CatIcon = accent.Icon;
                            const isOpen = openIndex === index;

                            return (
                                <motion.div
                                    key={faq.q}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    className={`c-card p-0 overflow-hidden border-l-4 ${accent.border}`}
                                >
                                    <button
                                        type="button"
                                        aria-expanded={isOpen}
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left hover:bg-white/8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div
                                                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent.badge} flex items-center justify-center text-white shrink-0 shadow-md`}
                                            >
                                                <CatIcon size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="inline-block text-[11px] font-bold text-amber-200/90 uppercase tracking-wider mb-0.5">
                                                    {accent.tag}
                                                </span>
                                                <span className="block font-extrabold text-white text-base sm:text-lg leading-snug break-words">
                                                    {faq.q}
                                                </span>
                                            </div>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-slate-200 shrink-0"
                                        >
                                            <ChevronDown size={20} strokeWidth={2.5} />
                                        </motion.div>
                                    </button>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden bg-slate-950/35"
                                            >
                                                <div className="px-5 sm:px-6 py-4 text-slate-100 border-t border-white/12 font-medium text-sm sm:text-base leading-relaxed">
                                                    {faq.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="text-center py-16 px-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/18">
                            <div className="w-16 h-16 rounded-2xl bg-amber-400/15 border border-amber-300/30 text-amber-300 flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <p className="text-xl font-extrabold text-white mb-2">ไม่พบคำที่ค้นหา</p>
                            <p className="text-sm text-slate-300 mb-5">ลองค้นหาด้วยคำอื่น หรือล้างตัวกรองเพื่อดูคำถามทั้งหมด</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setActiveCategory('all');
                                }}
                                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                ล้างการค้นหา
                            </button>
                        </div>
                    )}
                </div>

                {/* Still need help? */}
                <div className="mt-14 c-card text-center p-7 sm:p-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-[1px] mx-auto mb-5 shadow-[0_12px_30px_rgba(99,102,241,0.4)]">
                        <div className="w-full h-full rounded-[15px] bg-slate-950/35 flex items-center justify-center text-amber-300">
                            <MessageCircle size={30} />
                        </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                        ยังไม่พบคำตอบที่คุณต้องการ?
                    </h2>
                    <p className="text-slate-200 font-medium mb-7 text-sm sm:text-base">
                        ทีมงานของเราพร้อมดูแลและช่วยเหลือคุณอย่างเต็มที่
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-pink-500 to-indigo-600 hover:brightness-110 text-white font-extrabold py-3.5 px-7 rounded-2xl transition-all shadow-[0_10px_28px_-6px_rgba(236,72,153,0.5)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <Send size={18} />
                            <span>เปิด Ticket แจ้งเรื่อง</span>
                        </Link>
                        <a
                            href="https://line.me/R/ti/p/@preexam_th"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-extrabold py-3.5 px-7 rounded-2xl transition-all shadow-[0_10px_28px_-6px_rgba(16,185,129,0.45)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <MessageCircle size={18} />
                            <span>แชทผ่าน LINE</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
