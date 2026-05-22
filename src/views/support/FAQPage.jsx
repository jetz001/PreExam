import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, HelpCircle, BookOpen, CreditCard, Shield, Settings, MessageCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [openIndex, setOpenIndex] = useState(null);

    const categories = [
        { id: 'all', name: 'ทั้งหมด', icon: <HelpCircle size={20} /> },
        { id: 'general', name: 'ทั่วไป', icon: <BookOpen size={20} /> },
        { id: 'premium', name: 'พรีเมียม & การชำระเงิน', icon: <CreditCard size={20} /> },
        { id: 'exam', name: 'การทำข้อสอบ', icon: <BookOpen size={20} /> },
        { id: 'privacy', name: 'ความเป็นส่วนตัว', icon: <Shield size={20} /> },
    ];

    const faqs = [
        {
            category: 'general',
            q: "PreExam คืออะไร?",
            a: "PreExam คือแพลตฟอร์มคลังข้อสอบออนไลน์ที่ช่วยให้คุณเตรียมความพร้อมสำหรับการสอบบรรจุข้าราชการและสนามสอบอื่นๆ ด้วยระบบจำลองสถานการณ์จริงและวิเคราะห์จุดแข็งจุดอ่อนของคุณ"
        },
        {
            category: 'premium',
            q: "สมัครสมาชิกพรีเมียมยังไง?",
            a: "คุณสามารถไปที่หน้า 'จัดการแผนการใช้งาน' เลือกแผนที่ต้องการ (รายเดือนหรือรายปี) และชำระเงินผ่าน QR Code ได้ทันที ระบบจะอัปเกรดสถานะให้คุณอัตโนมัติภายในไม่กี่นาที"
        },
        {
            category: 'exam',
            q: "ทำไมคะแนนสอบไม่บันทึก?",
            a: "กรุณาตรวจสอบให้แน่ใจว่าคุณได้กดปุ่ม 'ส่งข้อสอบ' ทุกครั้งเมื่อทำเสร็จ หากกดปิดหน้าต่างไปก่อน ระบบอาจไม่สามารถบันทึกผลได้ครบถ้วน"
        },
        {
            category: 'premium',
            q: "ลืมส่งหลักฐานการชำระเงิน ต้องทำอย่างไร?",
            a: "หากเลือกชำระแบบโอนเงินและลืมส่งสลิป คุณสามารถเปิด Ticket ในศูนย์ช่วยเหลือ หัวข้อ 'การชำระเงิน' พร้อมแนบหลักฐานเพื่อให้เจ้าหน้าที่ตรวจสอบให้ครับ"
        },
        {
            category: 'general',
            q: "เปลี่ยนรหัสผ่านได้ที่ไหน?",
            a: "คุณสามารถเปลี่ยนรหัสผ่านได้ในส่วน 'การตั้งค่าโปรไฟล์' > 'ความปลอดภัย' หรือหากลืมรหัสผ่าน สามารถใช้เมนู 'ลืมรหัสผ่าน' ในหน้า Login เพื่อรับลิงก์รีเซ็ตทางอีเมล"
        },
        {
            category: 'exam',
            q: "สามารถดูข้อสอบย้อนหลังได้ไหม?",
            a: "ได้ครับ! คุณสามารถดูประวัติการทำข้อสอบทั้งหมดและเฉลยละเอียดได้ที่หน้า Dashboard ในส่วน 'ประวัติการสอบ'"
        },
        {
            category: 'privacy',
            q: "ลบข้อมูลส่วนตัวได้อย่างไร?",
            a: "เราให้ความสำคัญกับความเป็นส่วนตัวของคุณ คุณสามารถแจ้งขอลบข้อมูลหรือยกเลิกบัญชีได้ถาวรโดยการเปิด Ticket ในหัวข้อ 'นโยบายความเป็นส่วนตัว' ในศูนย์ช่วยเหลือ"
        }
    ];

    const filteredFaqs = useMemo(() => {
        return faqs.filter(faq => {
            const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.a.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4"
                    >
                        คำถามที่พบบ่อย (FAQ)
                    </motion.h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">ค้นหาคำตอบที่คุณต้องการได้รวดเร็วที่นี่</p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="ค้นหาคำถามหรือคำสำคัญ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-lg shadow-indigo-500/5 focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-10 justify-center">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${activeCategory === cat.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                        filteredFaqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                                    <motion.div
                                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                                        className="text-gray-400"
                                    >
                                        <ChevronDown size={20} />
                                    </motion.div>
                                </button>
                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-6 pt-0 text-gray-600 dark:text-gray-400 border-t border-gray-50 dark:border-gray-700/50 leading-relaxed italic">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <AlertCircle className="mx-auto text-gray-300 mb-4" size={64} />
                            <p className="text-xl font-semibold text-gray-400">ไม่พบคำที่ค้นหา</p>
                            <button
                                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                                className="mt-4 text-indigo-600 font-medium hover:underline"
                            >
                                ล้างการค้นหา
                            </button>
                        </div>
                    )}
                </div>

                {/* Still need help? */}
                <div className="mt-16 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <MessageCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">ยังไม่พบคำตอบที่คุณต้องการ?</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">ทีมงานของเราพร้อมช่วยเหลือคุณตลอด 24 ชั่วโมง</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/contact"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg"
                        >
                            เปิด Ticket แจ้งเรื่อง
                        </a>
                        <a
                            href="https://line.me/R/ti/p/@preexam_th"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <MessageCircle size={20} />
                            แชทผ่าน LINE
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
