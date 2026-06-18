import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import businessApi from '../../services/businessApi';
import { BookOpen, ShoppingBag, TrendingUp, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const FloatingShapes = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Shapes */}
            <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 left-10 w-24 h-24 bg-red-500 rounded-2xl border-4 border-black"
            />
            <motion.div
                animate={{ y: [0, 30, 0], rotate: [0, -15, 15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-40 right-20 w-16 h-16 bg-blue-500 rounded-full border-4 border-black"
            />
            <motion.div
                animate={{ x: [0, 20, 0], y: [0, 15, 0], rotate: [0, 45, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-32 left-32 w-20 h-20 bg-yellow-400 border-4 border-black"
                style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
            />
            <motion.div
                animate={{ y: [0, -40, 0], rotate: [0, -20, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-20 right-40 w-28 h-28 bg-green-500 rounded-3xl border-4 border-black"
            />
            <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute top-1/2 left-1/4 w-12 h-12 bg-purple-500 rounded-full border-4 border-black"
            />
        </div>
    );
};

const BusinessWelcome = () => {
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        tagline: '',
        category: 'Education',
        contact_link: ''
    });

    const categories = ['Education', 'Tutor', 'Book Store', 'Online Course', 'Other'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await businessApi.createBusiness(formData);
            toast.success('Business Page Created Successfully!', {
                style: { border: '2px solid black', fontWeight: 'bold' }
            });
            navigate('/business/content');
            window.location.reload(); 
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create business page', {
                style: { border: '2px solid black', fontWeight: 'bold', backgroundColor: '#fee2e2' }
            });
        }
    };

    if (isRegistering) {
        return (
            <div className="min-h-screen bg-cyan-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
                <FloatingShapes />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white max-w-lg w-full rounded-3xl border-4 border-black p-8 relative z-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                >
                    <h2 className="text-3xl font-black text-black mb-6 text-center uppercase tracking-wide">
                        🌟 สร้างเพจของคุณ
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-lg font-bold text-black mb-1">ชื่อเพจ</label>
                            <input
                                required
                                type="text"
                                className="block w-full rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] focus:translate-x-[2px] p-3 text-black font-medium outline-none transition-all"
                                placeholder="เช่น Kru P'Nan English"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-bold text-black mb-1">สโลแกน / คำอธิบายสั้นๆ</label>
                            <input
                                type="text"
                                className="block w-full rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] focus:translate-x-[2px] p-3 text-black font-medium outline-none transition-all"
                                placeholder="ช่วยให้คุณสอบผ่าน TOEIC"
                                value={formData.tagline}
                                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-bold text-black mb-1">หมวดหมู่</label>
                            <select
                                className="block w-full rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] focus:translate-x-[2px] p-3 text-black font-medium outline-none transition-all bg-white appearance-none cursor-pointer"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-lg font-bold text-black mb-1">ลิงก์ติดต่อ (Line OA / Facebook)</label>
                            <input
                                type="url"
                                className="block w-full rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] focus:translate-x-[2px] p-3 text-black font-medium outline-none transition-all"
                                placeholder="https://line.me/..."
                                value={formData.contact_link}
                                onChange={e => setFormData({ ...formData, contact_link: e.target.value })}
                            />
                        </div>
                        <div className="pt-6 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsRegistering(false)}
                                className="flex-1 py-3 bg-white border-4 border-black text-black rounded-xl font-bold text-lg hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[4px] active:translate-x-[4px] transition-all"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-purple-500 border-4 border-black text-white rounded-xl font-bold text-lg hover:bg-purple-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[4px] active:translate-x-[4px] transition-all"
                            >
                                สร้างเพจ 🚀
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-yellow-300 relative overflow-hidden font-sans">
            <FloatingShapes />
            
            <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-black hover:text-white hover:bg-black font-bold mb-12 transition-colors border-2 border-transparent hover:border-black rounded-full px-4 py-2"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    กลับสู่หน้าหลัก
                </button>

                <div className="text-center">
                    <motion.div 
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="inline-block bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8"
                    >
                        <h1 className="text-4xl font-black text-black sm:text-5xl md:text-6xl uppercase tracking-tighter">
                            แบ่งปันความรู้ <br />
                            <span className="text-blue-600 block mt-2">สร้างธุรกิจให้เติบโต!</span>
                        </h1>
                    </motion.div>
                    
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 max-w-2xl mx-auto text-xl text-black font-bold bg-white/50 p-4 rounded-xl border-2 border-black inline-block"
                    >
                        เข้าร่วมตลาดแห่งการเรียนรู้ แบ่งปันความเชี่ยวชาญเพื่อสร้างความน่าเชื่อถือ และโปรโมทคอร์สเรียนหรือสินค้าของคุณอย่างสนุกสนาน!
                    </motion.p>
                    
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
                        className="mt-12 flex flex-col sm:flex-row justify-center gap-6"
                    >
                        <button
                            onClick={() => setIsRegistering(true)}
                            className="px-8 py-4 rounded-2xl bg-green-500 text-white font-black text-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] transition-all"
                        >
                            สร้างเพจผู้เชี่ยวชาญ 🎯
                        </button>
                        <button
                            onClick={() => window.location.href = 'https://preexam.online/faq'}
                            className="px-8 py-4 rounded-2xl bg-white text-black font-black text-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] transition-all"
                        >
                            เรียนรู้เพิ่มเติม 💡
                        </button>
                    </motion.div>

                    <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-center pb-20">
                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="p-8 bg-blue-100 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative"
                        >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-blue-500 rounded-full border-4 border-black flex items-center justify-center text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <BookOpen size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-black mt-4 mb-2">เนื้อหาต้องมาก่อน</h3>
                            <p className="text-black font-medium">ให้คุณค่าก่อนที่จะรับ แบ่งปันเทคนิคการสอบ สรุป เพื่อดึงดูดผู้ติดตาม</p>
                        </motion.div>
                        
                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="p-8 bg-pink-100 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative mt-12 md:mt-0"
                        >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-pink-500 rounded-full border-4 border-black flex items-center justify-center text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <ShoppingBag size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-black mt-4 mb-2">ร้านค้าในตัว</h3>
                            <p className="text-black font-medium">ขาย E-books คอร์สเรียน และชีทสรุปได้โดยตรงบนหน้าโปรไฟล์ของคุณ</p>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="p-8 bg-purple-100 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative mt-12 md:mt-0"
                        >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-purple-500 rounded-full border-4 border-black flex items-center justify-center text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <TrendingUp size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-black mt-4 mb-2">โฆษณาอัจฉริยะ</h3>
                            <p className="text-black font-medium">ดันเนื้อหาของคุณขึ้นสู่ด้านบนของฟีดด้วยระบบพื้นที่โฆษณา</p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessWelcome;
