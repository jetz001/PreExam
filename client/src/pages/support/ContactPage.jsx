import React, { useState, useEffect } from 'react';
import { Mail, Phone, MessageCircle, Facebook, HelpCircle, Plus, ChevronRight, Clock, CheckCircle, AlertCircle, Lock, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import supportService from '../../services/supportService';
import { motion } from 'framer-motion';

const ContactPage = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();
    const location = useLocation();
    const faqRef = React.useRef(null);
    const policyRef = React.useRef(null);

    useEffect(() => {
        if (location.pathname === '/faq' && faqRef.current) {
            faqRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        if (location.pathname === '/policy' && policyRef.current) {
            policyRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location]);

    useEffect(() => {
        if (user && user.role !== 'guest') {
            fetchTickets();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const fetchTickets = async () => {
        try {
            const res = await supportService.getMyTickets();
            setTickets(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'open': return <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold uppercase">Open</span>;
            case 'in_progress': return <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-semibold uppercase">In Progress</span>;
            case 'resolved': return <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold uppercase">Resolved</span>;
            case 'closed': return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold uppercase">Closed</span>;
            default: return null;
        }
    };

    const filteredTickets = tickets.filter(t => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['open', 'in_progress'].includes(t.status);
        if (filter === 'done') return ['resolved', 'closed'].includes(t.status);
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">ศูนย์ช่วยเหลือและแจ้งปัญหา</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">เรายินดีดูแลและแก้ไขทุกปัญหาการใช้งานของคุณ</p>
                </div>

                {!user || user.role === 'guest' ? (
                    /* Guest View */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Public Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">ช่องทางติดต่อสาธารณะ</h2>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                                        <MessageCircle size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Line Official Account</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">@preexam_support</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                                        <Facebook size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Facebook Page</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">PreExam Thailand</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email Support</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">support@preexam.com</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-center">
                                <Lock className="mx-auto text-indigo-600 mb-2" size={32} />
                                <p className="text-indigo-900 dark:text-indigo-200 font-medium mb-4">เข้าสู่ระบบเพื่อเปิด Ticket และติดตามสถานะแบบเรียลไทม์</p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
                                >
                                    เข้าสู่ระบบ
                                </button>
                            </div>
                        </div>

                        {/* FAQ Section (Mockup) */}
                        <div ref={faqRef} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">คำถามที่พบบ่อย (FAQ)</h2>
                            <div className="space-y-4">
                                {[
                                    { q: "สมัครสมาชิกพรีเมียมยังไง?", a: "สามารถไปที่หน้าจัดการแผนการใช้งานและเลือกแผนที่ต้องการ จากนั้นชำระเงินผ่าน QR Code ได้ทันที" },
                                    { q: "ลืมรหัสผ่านต้องทำอย่างไร?", a: "กดปุ่ม 'ลืมรหัสผ่าน' ในหน้าเข้าสู่ระบบ เพื่อรับลิงก์รีเซ็ตรหัสผ่านทางอีเมล" },
                                    { q: "ทำไมคะแนนสอบไม่ขึ้น?", a: "กรุณาตรวจสอบว่าคุณได้กด 'ส่งข้อสอบ' หลังจากทำเสร็จแล้วหรือไม่" },
                                    { q: "แจ้งลบข้อมูลส่วนตัว?", a: "คุณสามารถแจ้งลบข้อมูลได้ผ่านการเปิด Ticket ในหัวข้อ 'นโยบายความเป็นส่วนตัว'" }
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                                        <p className="font-semibold text-gray-900 dark:text-white mb-2">{item.q}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Privacy Policy Section */}
                        <div ref={policyRef} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">นโยบายความเป็นส่วนตัว (Privacy Policy)</h2>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-4 text-sm leading-relaxed">
                                <p>บริษัท PreExam Thailand ให้ความสำคัญกับความลับและข้อมูลส่วนบุคคลของคุณ เพื่อความโปร่งใส เราจึงกำหนดนโยบายดังนี้:</p>
                                <section>
                                    <h3 className="text-gray-900 dark:text-white font-bold mb-1">1. ข้อมูลที่เราจัดเก็บ</h3>
                                    <p>เราจัดเก็บข้อมูลที่คุณให้ไว้ เช่น ชื่อ อีเมล และข้อมูลการเรียนการสอน เพื่อวิเคราะห์ผลคะแนนและพัฒนาปรับปรุงเนื้อหาข้อสอบให้ดียิ่งขึ้น</p>
                                </section>
                                <section>
                                    <h3 className="text-gray-900 dark:text-white font-bold mb-1">2. การใช้ข้อมูล</h3>
                                    <p>เราใช้ข้อมูลเพื่อยืนยันตัวตน และแสดงสถิติการทำข้อสอบของคุณเอง รวมถึงการแนะนำเนื้อหาที่เหมาะสมกับคุณ</p>
                                </section>
                                <section>
                                    <h3 className="text-gray-900 dark:text-white font-bold mb-1">3. ความปลอดภัย</h3>
                                    <p>เราใช้ระบบเข้ารหัสที่ได้มาตรฐานสากลเพื่อรักษาความปลอดภัยของข้อมูล และไม่มีนโยบายนำข้อมูลส่วนบุคคลไปขายให้กับบุคคลภายนอก</p>
                                </section>
                                <section>
                                    <h3 className="text-gray-900 dark:text-white font-bold mb-1">4. สิทธิของคุณ</h3>
                                    <p>คุณสามารถแจ้งลบข้อมูล หรือขอยกเลิกบัญชีได้ทุกเมื่อผ่านการเปิด Ticket แจ้งเจ้าหน้าที่ในหน้านี้</p>
                                </section>
                            </div>
                        </div>

                    </div>
                ) : (
                    /* Member View (Dashboard) */
                    <div className="space-y-8">
                        {/* Header Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Ticket ทั้งหมด</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{tickets.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                                    <FileText size={24} />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">กำลังดำเนินการ</p>
                                    <p className="text-3xl font-bold text-orange-500">{tickets.filter(t => ['open', 'in_progress'].includes(t.status)).length}</p>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                                    <Clock size={24} />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">เสร็จสิ้นแล้ว</p>
                                    <p className="text-3xl font-bold text-green-500">{tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                                    <CheckCircle size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Ticket List */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}
                                    >
                                        ทั้งหมด
                                    </button>
                                    <button
                                        onClick={() => setFilter('active')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'active' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}
                                    >
                                        กำลังดำเนินการ
                                    </button>
                                    <button
                                        onClick={() => setFilter('done')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'done' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}
                                    >
                                        เสร็จสิ้น
                                    </button>
                                </div>
                                <button
                                    onClick={() => document.getElementById('help-widget-btn')?.click()} // Trigger floating widget for now
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg"
                                >
                                    <Plus size={20} />
                                    <span>สร้าง Ticket ใหม่</span>
                                </button>
                            </div>

                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {isLoading ? (
                                    <div className="p-10 text-center text-gray-500">กำลังโหลดรายการ...</div>
                                ) : filteredTickets.length === 0 ? (
                                    <div className="p-20 text-center">
                                        <AlertCircle className="mx-auto text-gray-300 mb-4" size={64} />
                                        <p className="text-xl font-semibold text-gray-400">ไม่พบรายการแจ้งปัญหา</p>
                                    </div>
                                ) : (
                                    filteredTickets.map((ticket) => (
                                        <motion.div
                                            key={ticket.id}
                                            whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                                            onClick={() => navigate(`/support/tickets/${ticket.id}`)}
                                            className="p-6 cursor-pointer flex items-center justify-between group transition-colors"
                                        >
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-xs font-mono text-gray-400">#TK-{ticket.id}</span>
                                                    {getStatusBadge(ticket.status)}
                                                    {ticket.priority === 'high' && (
                                                        <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[10px] font-bold rounded uppercase flex items-center gap-1">
                                                            <AlertCircle size={10} /> VIP FAST TRACK
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                                                    {ticket.subject}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1 italic">
                                                        {ticket.category === 'bug' && '🐛 Bug Report'}
                                                        {ticket.category === 'content' && '📝 Content Error'}
                                                        {ticket.category === 'payment' && '💳 Payment/Ads'}
                                                        {ticket.category === 'suggestion' && '💡 Suggestion'}
                                                        {ticket.category === 'privacy' && '🔒 Privacy'}
                                                        {ticket.category === 'report' && '🚩 User Report'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{new Date(ticket.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="text-gray-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" size={24} />
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Contact Alternatives Footer */}
                        <div className="flex flex-wrap justify-center gap-8 text-gray-500 text-sm py-4">
                            <div className="flex items-center gap-2"><Phone size={16} /> Hot-line: 02-XXX-XXXX</div>
                            <div className="flex items-center gap-2"><MessageCircle size={16} /> @preexam_th</div>
                            <div className="flex items-center gap-2"><Clock size={16} /> เวลาทำการ: จันทร์ - ศุกร์ (09:00 - 18:00)</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactPage;
