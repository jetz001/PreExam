import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, HelpCircle, BookOpen, CreditCard, Shield, Settings, MessageCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../assets/css/contact.css';

const FAQPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [openIndex, setOpenIndex] = useState(null);
    const [shapes, setShapes] = useState([]);

    React.useEffect(() => {
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
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="c-header-title mb-4"
                    >
                        คำถามที่พบบ่อย (FAQ)
                    </motion.h1>
                    <p className="text-lg text-gray-200 font-medium">ค้นหาคำตอบที่คุณต้องการได้รวดเร็วที่นี่</p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400">
                        <Search size={24} className="text-yellow-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="ค้นหาคำถามหรือคำสำคัญ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-14 pr-6 py-4 bg-[rgba(255,255,255,0.1)] border-4 border-[rgba(255,255,255,0.2)] rounded-[32px] focus:outline-none focus:border-yellow-400 focus:bg-[rgba(255,255,255,0.2)] transition-all text-white font-bold placeholder-[rgba(255,255,255,0.5)] shadow-[0_6px_0_rgba(0,0,0,0.2)]"
                    />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-3 mb-10 justify-center">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-[20px] font-bold transition-all border-2 border-transparent ${activeCategory === cat.id
                                    ? 'bg-yellow-400 text-purple-900 shadow-[0_6px_0_rgba(0,0,0,0.2)] transform -translate-y-1'
                                    : 'bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.2)] border-[rgba(255,255,255,0.2)] shadow-[0_4px_0_rgba(0,0,0,0.1)]'
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
                            const faqColors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c', '#864cbf'];
                            const bgColor = faqColors[index % faqColors.length];
                            
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="c-card p-0 overflow-hidden"
                                    style={{ backgroundColor: bgColor, borderColor: 'rgba(255,255,255,0.3)' }}
                                >
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center justify-between p-6 text-left hover:bg-[rgba(255,255,255,0.15)] transition-colors"
                                    >
                                        <span className="font-bold text-white text-lg pr-4" style={{ textShadow: '1px 2px 0px rgba(0,0,0,0.2)' }}>{faq.q}</span>
                                        <motion.div
                                            animate={{ rotate: openIndex === index ? 180 : 0 }}
                                            className="text-white"
                                            style={{ filter: 'drop-shadow(1px 2px 0px rgba(0,0,0,0.2))' }}
                                        >
                                            <ChevronDown size={28} strokeWidth={3} />
                                        </motion.div>
                                    </button>
                                    <AnimatePresence>
                                        {openIndex === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden bg-[rgba(0,0,0,0.2)]"
                                            >
                                                <div className="p-6 pt-4 text-white border-t border-[rgba(255,255,255,0.2)] font-medium leading-relaxed italic">
                                                    {faq.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="text-center py-20 bg-[rgba(255,255,255,0.05)] rounded-3xl border-2 border-[rgba(255,255,255,0.1)]">
                            <AlertCircle className="mx-auto text-yellow-400 mb-4" size={64} />
                            <p className="text-xl font-bold text-white">ไม่พบคำที่ค้นหา</p>
                            <button
                                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                                className="mt-4 text-pink-400 font-bold hover:underline"
                            >
                                ล้างการค้นหา
                            </button>
                        </div>
                    )}
                </div>

                {/* Still need help? */}
                <div className="mt-16 c-card text-center border-4">
                    <div className="w-20 h-20 bg-[rgba(255,255,255,0.1)] text-yellow-400 border-4 border-[rgba(255,255,255,0.2)] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_6px_0_rgba(0,0,0,0.2)] transform -rotate-6">
                        <MessageCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">ยังไม่พบคำตอบที่คุณต้องการ?</h2>
                    <p className="text-gray-300 font-medium mb-8">ทีมงานของเราพร้อมช่วยเหลือคุณตลอด 24 ชั่วโมง</p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <a
                            href="/contact"
                            className="bg-pink-500 hover:bg-pink-400 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-[0_6px_0_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-[0_10px_0_rgba(0,0,0,0.3)]"
                        >
                            เปิด Ticket แจ้งเรื่อง
                        </a>
                        <a
                            href="https://line.me/R/ti/p/@preexam_th"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 hover:bg-green-400 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-[0_6px_0_rgba(0,0,0,0.2)] flex items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-[0_10px_0_rgba(0,0,0,0.3)]"
                        >
                            <MessageCircle size={24} />
                            แชทผ่าน LINE
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
