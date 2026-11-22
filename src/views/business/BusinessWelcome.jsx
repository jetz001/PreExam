import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import businessApi from '../../services/businessApi';
import BrandLogo from '../../components/common/BrandLogo';
import {
    BookOpen,
    ShoppingBag,
    TrendingUp,
    ArrowLeft,
    Sparkles,
    Rocket,
    Target,
    Lightbulb,
    Building2,
    ChevronDown,
    CheckCircle2,
    Globe,
    Tag,
    FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const FEATURE_CARDS = [
    {
        title: 'เนื้อหาต้องมาก่อน',
        subtitle: 'Content-First Authority',
        description: 'ให้คุณค่าก่อนที่จะรับ แบ่งปันเทคนิคการสอบ และบทความสรุปคุณภาพเพื่อดึงดูดผู้ติดตามอย่างยั่งยืน',
        icon: BookOpen,
        gradient: 'from-indigo-500 to-blue-600',
        shadow: 'shadow-indigo-500/20',
    },
    {
        title: 'ร้านค้าในตัว',
        subtitle: 'Integrated Storefront',
        description: 'นำเสนอคอร์สเรียน E-books และชีทสรุปโดยตรงบนหน้าโปรไฟล์ผู้เชี่ยวชาญของคุณ',
        icon: ShoppingBag,
        gradient: 'from-violet-500 to-purple-600',
        shadow: 'shadow-violet-500/20',
    },
    {
        title: 'โฆษณาอัจฉริยะ',
        subtitle: 'Precision Promotion',
        description: 'ดันเนื้อหาและแคมเปญของคุณสู่กลุ่มผู้เตรียมสอบที่ใช่ด้วยพื้นที่โฆษณาในฟีดและหน้าผลสอบ',
        icon: TrendingUp,
        gradient: 'from-fuchsia-500 to-indigo-600',
        shadow: 'shadow-fuchsia-500/20',
    },
];

const BusinessWelcome = () => {
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        tagline: '',
        category: 'Education',
        contact_link: ''
    });

    const categories = ['Education', 'Tutor', 'Book Store', 'Online Course', 'Other'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await businessApi.createBusiness(formData);
            toast.success('Business Page Created Successfully!');
            navigate('/business/content');
            window.location.reload();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create business page');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isRegistering) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-between relative overflow-hidden font-sans">
                {/* Top Dark Executive Bar */}
                <header className="relative z-10 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-b border-indigo-500/20">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
                        <BrandLogo
                            variant="dark"
                            size="sm"
                            badge="BUSINESS"
                            subtitle="SPONSOR PORTAL"
                        />
                        <button
                            type="button"
                            onClick={() => setIsRegistering(false)}
                            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>ย้อนกลับ</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
                    <motion.div
                        initial={{ y: 16, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        className="w-full max-w-xl rounded-2xl bg-white border border-slate-200/80 shadow-xl overflow-hidden"
                    >
                        <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-6 sm:p-8 text-white relative overflow-hidden">
                            <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-indigo-500/25 blur-2xl" />
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 border border-white/20">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                                        Sponsor Onboarding
                                    </p>
                                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                                        สร้างเพจของคุณ
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                            <div>
                                <label htmlFor="biz-name" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                                    <Building2 className="w-4 h-4 text-indigo-600" />
                                    <span>ชื่อเพจ</span>
                                    <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    id="biz-name"
                                    required
                                    type="text"
                                    className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                                    placeholder="เช่น Kru P'Nan English"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="biz-tagline" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                                    <FileText className="w-4 h-4 text-indigo-600" />
                                    <span>สโลแกน / คำอธิบายสั้นๆ</span>
                                </label>
                                <input
                                    id="biz-tagline"
                                    type="text"
                                    className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                                    placeholder="ช่วยให้คุณสอบผ่าน TOEIC"
                                    value={formData.tagline}
                                    onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="biz-category" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                                    <Tag className="w-4 h-4 text-indigo-600" />
                                    <span>หมวดหมู่</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="biz-category"
                                        className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 shadow-sm appearance-none cursor-pointer focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="biz-contact" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
                                    <Globe className="w-4 h-4 text-indigo-600" />
                                    <span>ลิงก์ติดต่อ (Line OA / Facebook)</span>
                                </label>
                                <input
                                    id="biz-contact"
                                    type="url"
                                    className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                                    placeholder="https://line.me/..."
                                    value={formData.contact_link}
                                    onChange={e => setFormData({ ...formData, contact_link: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsRegistering(false)}
                                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                                >
                                    <Rocket className="w-4 h-4" />
                                    <span>{isSubmitting ? 'กำลังสร้างเพจ...' : 'สร้างเพจ'}</span>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            {/* Executive Dark Hero Header */}
            <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white relative overflow-hidden border-b border-indigo-500/20">
                <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
                    {/* Top Navigation Row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-10 sm:mb-14">
                        <BrandLogo
                            variant="dark"
                            size="md"
                            badge="BUSINESS"
                            subtitle="SPONSOR PORTAL"
                        />
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>กลับสู่หน้าหลัก</span>
                        </button>
                    </div>

                    {/* Hero Copy */}
                    <div className="text-center max-w-3xl mx-auto pb-8 sm:pb-12">
                        <motion.div
                            initial={{ y: -12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-indigo-200 backdrop-blur-md mb-6"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>PREEXAM EXECUTIVE SPONSOR SUITE</span>
                        </motion.div>

                        <motion.h1
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.35 }}
                            className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight"
                        >
                            แบ่งปันความรู้
                            <span className="block mt-2 bg-gradient-to-r from-indigo-300 via-violet-200 to-amber-200 bg-clip-text text-transparent">
                                สร้างธุรกิจให้เติบโต
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                            className="mt-5 text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl mx-auto"
                        >
                            เข้าร่วมตลาดแห่งการเรียนรู้ แบ่งปันความเชี่ยวชาญเพื่อสร้างความน่าเชื่อถือ และโปรโมทคอร์สเรียนหรือสินค้าของคุณสู่ผู้เตรียมสอบทั่วประเทศ
                        </motion.p>

                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.25 }}
                            className="mt-8 flex flex-col sm:flex-row justify-center gap-3.5"
                        >
                            <button
                                type="button"
                                onClick={() => setIsRegistering(true)}
                                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-base shadow-lg shadow-indigo-500/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <Target className="w-5 h-5" />
                                <span>สร้างเพจผู้เชี่ยวชาญ</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => window.location.href = 'https://preexam.online/faq'}
                                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-base backdrop-blur-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <Lightbulb className="w-5 h-5 text-amber-300" />
                                <span>เรียนรู้เพิ่มเติม</span>
                            </button>
                        </motion.div>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-200">
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                เปิดเพจผู้เชี่ยวชาญฟรี
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                เข้าถึงกลุ่มผู้เตรียมสอบโดยตรง
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                วัดผลแคมเปญแบบเรียลไทม์
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Cards Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {FEATURE_CARDS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.title}
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200/80 p-6 sm:p-7 transition-all"
                            >
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-lg ${item.shadow} mb-5`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1">
                                    {item.subtitle}
                                </p>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {item.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BusinessWelcome;
