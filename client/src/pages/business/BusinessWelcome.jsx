import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import businessApi from '../../services/businessApi';
import { BookOpen, ShoppingBag, TrendingUp, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

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
            toast.success('Business Page Created Successfully!');
            // Redirect to dashboard or force reload to update layout context
            navigate('/business/dashboard');
            window.location.reload(); // Simple way to refresh context/layout state
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create business page');
        }
    };

    if (isRegistering) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">สร้างเพจผู้เชี่ยวชาญของคุณ</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ชื่อเพจ</label>
                            <input
                                required
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-gray-900"
                                placeholder="เช่น Kru P'Nan English"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">สโลแกน / คำอธิบายสั้นๆ</label>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-gray-900"
                                placeholder="ช่วยให้คุณสอบผ่าน TOEIC"
                                value={formData.tagline}
                                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">หมวดหมู่</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-gray-900"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ลิงก์ติดต่อ (Line OA / Facebook)</label>
                            <input
                                type="url"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-gray-900"
                                placeholder="https://line.me/..."
                                value={formData.contact_link}
                                onChange={e => setFormData({ ...formData, contact_link: e.target.value })}
                            />
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsRegistering(false)}
                                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                            >
                                สร้างเพจ
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-gray-600 hover:text-indigo-600 font-medium mb-8 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    กลับสู่หน้าหลัก
                </button>

                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                        แบ่งปันความรู้ <span className="text-indigo-600">สร้างธุรกิจให้เติบโต</span>
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
                        เข้าร่วมตลาดแห่งการเรียนรู้ แบ่งปันความเชี่ยวชาญเพื่อสร้างความน่าเชื่อถือ (70%) และโปรโมทคอร์สเรียนหรือสินค้าของคุณ (30%) อย่างมีประสิทธิภาพ
                    </p>
                    <div className="mt-10 flex justify-center gap-4">
                        <button
                            onClick={() => setIsRegistering(true)}
                            className="px-8 py-3 rounded-lg bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 shadow-lg transition-transform transform hover:-translate-y-1"
                        >
                            สร้างเพจผู้เชี่ยวชาญ
                        </button>
                        <button
                            onClick={() => window.location.href = 'https://preexam.online/faq'}
                            className="px-8 py-3 rounded-lg bg-gray-100 text-gray-700 font-bold text-lg hover:bg-gray-200"
                        >
                            เรียนรู้เพิ่มเติม
                        </button>
                    </div>

                    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        <div className="p-6 bg-gray-50 rounded-2xl">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                                <BookOpen size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">เนื้อหาต้องมาก่อน</h3>
                            <p className="mt-2 text-gray-600">ให้คุณค่าก่อนที่จะรับ แบ่งปันเทคนิคการสอบ สรุป และวิดีโอ เพื่อดึงดูดผู้ติดตาม</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-2xl">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4">
                                <ShoppingBag size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">ร้านค้าในตัว</h3>
                            <p className="mt-2 text-gray-600">ขาย E-books คอร์สเรียน และชีทสรุปได้โดยตรงบนแท็บโปรไฟล์ของคุณ</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-2xl">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                                <TrendingUp size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">โฆษณาอัจฉริยะ</h3>
                            <p className="mt-2 text-gray-600">ดันเนื้อหาของคุณขึ้นสู่ด้านบนของฟีดด้วยพื้นที่โฆษณาที่ตรงกลุ่มเป้าหมาย</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessWelcome;
