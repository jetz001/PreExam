import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, HelpCircle, Plus, ChevronRight, Clock, CheckCircle, AlertCircle, Lock, Book, Search, FileText, Globe } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import supportService from '../../services/supportService';
import { motion } from 'framer-motion';
import '../../assets/css/contact.css';

const ContactPage = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();
    const location = useLocation();
    const faqRef = React.useRef(null);
    const policyRef = React.useRef(null);

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
            case 'open': return <span className="c-badge c-badge-red">Open</span>;
            case 'in_progress': return <span className="c-badge c-badge-yellow">In Progress</span>;
            case 'resolved': return <span className="c-badge c-badge-green">Resolved</span>;
            case 'closed': return <span className="c-badge c-badge-gray">Closed</span>;
            default: return null;
        }
    };

    const filteredTickets = (tickets || []).filter(t => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['open', 'in_progress'].includes(t.status);
        if (filter === 'done') return ['resolved', 'closed'].includes(t.status);
        return true;
    });

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

            <div className="contact-page-container">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="c-header-title mb-4">ศูนย์ช่วยเหลือและแจ้งปัญหา</h1>
                    <p className="text-lg text-gray-200 font-medium">เรายินดีดูแลและแก้ไขทุกปัญหาการใช้งานของคุณ</p>
                </div>

                {!user || user.role === 'guest' ? (
                    /* Guest View */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Public Info */}
                        <div className="c-card">
                            <h2 className="c-card-title">ช่องทางติดต่อสาธารณะ</h2>
                            <div className="space-y-4">
                                <div className="c-contact-item">
                                    <div className="c-contact-icon c-icon-green">
                                        <MessageCircle size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-300">Line Official Account</p>
                                        <p className="text-lg font-bold text-white">@preexam_support</p>
                                    </div>
                                </div>
                                <div className="c-contact-item">
                                    <div className="c-contact-icon c-icon-blue">
                                        <Globe size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-300">Facebook Page</p>
                                        <p className="text-lg font-bold text-white">PreExam Thailand</p>
                                    </div>
                                </div>
                                <div className="c-contact-item">
                                    <div className="c-contact-icon c-icon-pink">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-300">Email Support</p>
                                        <p className="text-lg font-bold text-white">support@preexam.com</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-[rgba(0,0,0,0.2)] rounded-2xl text-center border-2 border-[rgba(255,255,255,0.1)]">
                                <Lock className="mx-auto text-yellow-400 mb-3" size={36} />
                                <p className="text-white font-bold mb-6">เข้าสู่ระบบเพื่อเปิด Ticket และติดตามสถานะแบบเรียลไทม์</p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="c-btn-primary"
                                >
                                    เข้าสู่ระบบ
                                </button>
                            </div>
                        </div>

                        {/* FAQ Section (Mockup) */}
                        {/* FAQ Section */}
                        <div ref={faqRef} className="c-card">
                            <h2 className="c-card-title">คำถามที่พบบ่อย (FAQ)</h2>
                            <div className="space-y-0">
                                {[
                                    { q: "สมัครสมาชิกพรีเมียมยังไง?", a: "สามารถไปที่หน้าจัดการแผนการใช้งานและเลือกแผนที่ต้องการ จากนั้นชำระเงินผ่าน QR Code ได้ทันที" },
                                    { q: "ลืมรหัสผ่านต้องทำอย่างไร?", a: "กดปุ่ม 'ลืมรหัสผ่าน' ในหน้าเข้าสู่ระบบ เพื่อรับลิงก์รีเซ็ตรหัสผ่านทางอีเมล" },
                                    { q: "ทำไมคะแนนสอบไม่ขึ้น?", a: "กรุณาตรวจสอบว่าคุณได้กด 'ส่งข้อสอบ' หลังจากทำเสร็จแล้วหรือไม่" },
                                    { q: "แจ้งลบข้อมูลส่วนตัว?", a: "คุณสามารถแจ้งลบข้อมูลได้ผ่านการเปิด Ticket ในหัวข้อ 'นโยบายความเป็นส่วนตัว'" }
                                ].map((item, idx) => (
                                    <div key={idx} className="c-faq-item">
                                        <p className="c-faq-q">{item.q}</p>
                                        <p className="c-faq-a">{item.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Privacy Policy Section */}
                        <div ref={policyRef} className="c-card md:col-span-2">
                            <h2 className="c-card-title text-center">นโยบายความเป็นส่วนตัว (Privacy Policy)</h2>
                            <div className="c-prose text-sm">
                                <p className="text-center mb-6">บริษัท PreExam Thailand ให้ความสำคัญกับความลับและข้อมูลส่วนบุคคลของคุณ เพื่อความโปร่งใส เราจึงกำหนดนโยบายดังนี้:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <section>
                                        <h3>1. ข้อมูลที่เราจัดเก็บ</h3>
                                        <p>เราจัดเก็บข้อมูลที่คุณให้ไว้ เช่น ชื่อ อีเมล และข้อมูลการเรียนการสอน เพื่อวิเคราะห์ผลคะแนนและพัฒนาปรับปรุงเนื้อหาข้อสอบให้ดียิ่งขึ้น</p>
                                    </section>
                                    <section>
                                        <h3>2. การใช้ข้อมูล</h3>
                                        <p>เราใช้ข้อมูลเพื่อยืนยันตัวตน และแสดงสถิติการทำข้อสอบของคุณเอง รวมถึงการแนะนำเนื้อหาที่เหมาะสมกับคุณ</p>
                                    </section>
                                    <section>
                                        <h3>3. ความปลอดภัย</h3>
                                        <p>เราใช้ระบบเข้ารหัสที่ได้มาตรฐานสากลเพื่อรักษาความปลอดภัยของข้อมูล และไม่มีนโยบายนำข้อมูลส่วนบุคคลไปขายให้กับบุคคลภายนอก</p>
                                    </section>
                                    <section>
                                        <h3>4. สิทธิของคุณ</h3>
                                        <p>คุณสามารถแจ้งลบข้อมูล หรือขอยกเลิกบัญชีได้ทุกเมื่อผ่านการเปิด Ticket แจ้งเจ้าหน้าที่ในหน้านี้</p>
                                    </section>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    /* Member View (Dashboard) */
                    <div className="space-y-8">
                        {/* Header Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="c-stat-card">
                                <div>
                                    <p className="c-stat-label">Ticket ทั้งหมด</p>
                                    <p className="c-stat-value">{(tickets || []).length}</p>
                                </div>
                                <div className="c-contact-icon c-icon-blue">
                                    <FileText size={24} />
                                </div>
                            </div>
                            <div className="c-stat-card">
                                <div>
                                    <p className="c-stat-label">กำลังดำเนินการ</p>
                                    <p className="c-stat-value c-stat-value-orange">{(tickets || []).filter(t => ['open', 'in_progress'].includes(t.status)).length}</p>
                                </div>
                                <div className="c-contact-icon c-icon-yellow">
                                    <Clock size={24} />
                                </div>
                            </div>
                            <div className="c-stat-card">
                                <div>
                                    <p className="c-stat-label">เสร็จสิ้นแล้ว</p>
                                    <p className="c-stat-value c-stat-value-green">{(tickets || []).filter(t => ['resolved', 'closed'].includes(t.status)).length}</p>
                                </div>
                                <div className="c-contact-icon c-icon-green">
                                    <CheckCircle size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Ticket List */}
                        <div className="c-card p-0 overflow-hidden">
                            <div className="p-6 border-b-2 border-[rgba(255,255,255,0.1)] flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="c-filter-group">
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={`c-filter-btn ${filter === 'all' ? 'active' : ''}`}
                                    >
                                        ทั้งหมด
                                    </button>
                                    <button
                                        onClick={() => setFilter('active')}
                                        className={`c-filter-btn ${filter === 'active' ? 'active' : ''}`}
                                    >
                                        กำลังดำเนินการ
                                    </button>
                                    <button
                                        onClick={() => setFilter('done')}
                                        className={`c-filter-btn ${filter === 'done' ? 'active' : ''}`}
                                    >
                                        เสร็จสิ้น
                                    </button>
                                </div>
                                <button
                                    onClick={() => document.getElementById('help-widget-btn')?.click()} // Trigger floating widget for now
                                    className="c-btn-new-ticket"
                                >
                                    <Plus size={20} />
                                    <span>สร้าง Ticket ใหม่</span>
                                </button>
                            </div>

                            <div className="divide-y divide-transparent">
                                {isLoading ? (
                                    <div className="p-10 text-center text-gray-300 font-bold">กำลังโหลดรายการ...</div>
                                ) : filteredTickets.length === 0 ? (
                                    <div className="p-20 text-center">
                                        <AlertCircle className="mx-auto text-yellow-400 mb-4" size={64} />
                                        <p className="text-xl font-bold text-white">ไม่พบรายการแจ้งปัญหา</p>
                                    </div>
                                ) : (
                                    filteredTickets.map((ticket) => (
                                        <motion.div
                                            key={ticket.id}
                                            onClick={() => navigate(`/support/tickets/${ticket.id}`)}
                                            className="c-ticket-row group"
                                        >
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-xs font-mono text-yellow-400 font-bold">#TK-{ticket.id}</span>
                                                    {getStatusBadge(ticket.status)}
                                                    {ticket.priority === 'high' && (
                                                        <span className="c-badge c-badge-red flex items-center gap-1">
                                                            <AlertCircle size={12} /> VIP FAST TRACK
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="c-ticket-title truncate">
                                                    {ticket.subject}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-300 font-medium">
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
                                            <ChevronRight className="text-gray-400 group-hover:text-yellow-400 transition-all group-hover:translate-x-1" size={24} />
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Contact Alternatives Footer */}
                        <div className="flex flex-wrap justify-center gap-8 text-gray-300 font-bold text-sm py-4">
                            <div className="flex items-center gap-2"><Phone size={18} className="text-pink-400" /> Hot-line: 02-XXX-XXXX</div>
                            <div className="flex items-center gap-2"><MessageCircle size={18} className="text-green-400" /> @preexam_th</div>
                            <div className="flex items-center gap-2"><Clock size={18} className="text-blue-400" /> เวลาทำการ: จันทร์ - ศุกร์ (09:00 - 18:00)</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactPage;
