import React, { useState, useEffect } from 'react';
import {
    Mail,
    Phone,
    MessageCircle,
    HelpCircle,
    Plus,
    ChevronRight,
    Clock,
    CheckCircle,
    AlertCircle,
    Lock,
    FileText,
    Globe,
    Headset,
    Bug,
    CreditCard,
    Lightbulb,
    ShieldAlert,
    Flag,
    Sparkles,
    ShieldCheck,
    Zap,
    ArrowRight,
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import supportService from '../../services/supportService';
import { motion } from 'framer-motion';
import '../../assets/css/contact.css';

const TICKET_CATEGORY_MAP = {
    bug: { label: 'Bug Report', Icon: Bug, tone: 'text-rose-300 bg-rose-500/15 border-rose-400/30' },
    content: { label: 'Content Error', Icon: FileText, tone: 'text-amber-300 bg-amber-500/15 border-amber-400/30' },
    payment: { label: 'Payment / Ads', Icon: CreditCard, tone: 'text-sky-300 bg-sky-500/15 border-sky-400/30' },
    suggestion: { label: 'Suggestion', Icon: Lightbulb, tone: 'text-yellow-200 bg-yellow-500/15 border-yellow-400/30' },
    privacy: { label: 'Privacy', Icon: ShieldAlert, tone: 'text-slate-200 bg-slate-500/20 border-slate-400/30' },
    report: { label: 'User Report', Icon: Flag, tone: 'text-purple-300 bg-purple-500/15 border-purple-400/30' },
};

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
            setTickets(res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'open':
                return <span className="c-badge c-badge-red">Open</span>;
            case 'in_progress':
                return <span className="c-badge c-badge-yellow">In Progress</span>;
            case 'resolved':
                return <span className="c-badge c-badge-green">Resolved</span>;
            case 'closed':
                return <span className="c-badge c-badge-gray">Closed</span>;
            default:
                return null;
        }
    };

    const filteredTickets = (tickets || []).filter((t) => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['open', 'in_progress'].includes(t.status);
        if (filter === 'done') return ['resolved', 'closed'].includes(t.status);
        return true;
    });

    const openTicketModal = () => {
        document.getElementById('help-widget-btn')?.click();
    };

    const activeCount = (tickets || []).filter((t) => ['open', 'in_progress'].includes(t.status)).length;
    const doneCount = (tickets || []).filter((t) => ['resolved', 'closed'].includes(t.status)).length;

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

            <div className="contact-page-container">
                {/* Header */}
                <div className="text-center mb-10 space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-amber-200 backdrop-blur-md">
                        <Sparkles size={14} className="text-amber-300" />
                        <span>PreExam Help Center</span>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 p-[1px] shadow-[0_12px_30px_rgba(99,102,241,0.45)]">
                            <div className="w-full h-full rounded-[15px] bg-slate-950/35 backdrop-blur-md flex items-center justify-center text-amber-200">
                                <Headset size={28} />
                            </div>
                        </div>
                        <h1 className="c-header-title">ศูนย์ช่วยเหลือและแจ้งปัญหา</h1>
                    </div>

                    <p className="text-base sm:text-lg text-slate-200 font-medium max-w-xl mx-auto">
                        เรายินดีดูแลและแก้ไขทุกปัญหาการใช้งานของคุณอย่างรวดเร็ว
                    </p>

                    <div className="flex flex-wrap justify-center gap-2.5 pt-2">
                        <Link
                            to="/faq"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/18 border border-white/18 text-xs sm:text-sm font-bold text-slate-100 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <HelpCircle size={15} className="text-amber-300" />
                            <span>คำถามที่พบบ่อย (FAQ)</span>
                        </Link>
                        <Link
                            to="/policy"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/18 border border-white/18 text-xs sm:text-sm font-bold text-slate-100 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <ShieldCheck size={15} className="text-emerald-300" />
                            <span>นโยบายความเป็นส่วนตัว</span>
                        </Link>
                    </div>
                </div>

                {!user || user.role === 'guest' ? (
                    /* Guest View */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        {/* Public Info */}
                        <div className="c-card flex flex-col justify-between">
                            <div>
                                <h2 className="c-card-title flex items-center gap-2.5">
                                    <MessageCircle size={22} className="text-emerald-300" />
                                    <span>ช่องทางติดต่อสาธารณะ</span>
                                </h2>
                                <div className="space-y-3.5">
                                    <div className="c-contact-item">
                                        <div className="c-contact-icon c-icon-green">
                                            <MessageCircle size={22} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-slate-300">Line Official Account</p>
                                            <p className="text-base sm:text-lg font-extrabold text-white truncate">@preexam_support</p>
                                        </div>
                                    </div>
                                    <div className="c-contact-item">
                                        <div className="c-contact-icon c-icon-blue">
                                            <Globe size={22} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-slate-300">Facebook Page</p>
                                            <p className="text-base sm:text-lg font-extrabold text-white truncate">PreExam Thailand</p>
                                        </div>
                                    </div>
                                    <a
                                        href="mailto:support@preexam.com"
                                        className="c-contact-item focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    >
                                        <div className="c-contact-icon c-icon-pink">
                                            <Mail size={22} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-slate-300">Email Support</p>
                                            <p className="text-base sm:text-lg font-extrabold text-white truncate">support@preexam.com</p>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            <div className="mt-7 p-6 bg-slate-950/35 rounded-2xl text-center border border-white/14">
                                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/35 text-amber-300 flex items-center justify-center mx-auto mb-3">
                                    <Lock size={24} />
                                </div>
                                <p className="text-white font-bold text-sm sm:text-base mb-5 leading-relaxed">
                                    เข้าสู่ระบบเพื่อเปิด Ticket และติดตามสถานะแบบเรียลไทม์
                                </p>
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="c-btn-primary"
                                >
                                    <span>เข้าสู่ระบบ</span>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div ref={faqRef} className="c-card flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-5">
                                    <h2 className="c-card-title mb-0 flex items-center gap-2.5">
                                        <HelpCircle size={22} className="text-amber-300" />
                                        <span>คำถามที่พบบ่อย (FAQ)</span>
                                    </h2>
                                    <Link
                                        to="/faq"
                                        className="text-xs font-bold text-amber-200 hover:text-amber-100 underline shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                                    >
                                        ดูทั้งหมด
                                    </Link>
                                </div>
                                <div className="space-y-0">
                                    {[
                                        {
                                            q: 'สมัครสมาชิกพรีเมียมยังไง?',
                                            a: 'สามารถไปที่หน้าจัดการแผนการใช้งานและเลือกแผนที่ต้องการ จากนั้นชำระเงินผ่าน QR Code หรือบัตรเครดิตได้ทันที',
                                        },
                                        {
                                            q: 'ลืมรหัสผ่านต้องทำอย่างไร?',
                                            a: "กดปุ่ม 'ลืมรหัสผ่าน' ในหน้าเข้าสู่ระบบ เพื่อรับลิงก์รีเซ็ตรหัสผ่านทางอีเมล",
                                        },
                                        {
                                            q: 'ทำไมคะแนนสอบไม่ขึ้น?',
                                            a: "กรุณาตรวจสอบว่าคุณได้กด 'ส่งข้อสอบ' หลังจากทำเสร็จแล้วหรือไม่",
                                        },
                                        {
                                            q: 'แจ้งลบข้อมูลส่วนตัว?',
                                            a: "คุณสามารถแจ้งลบข้อมูลได้ผ่านการเปิด Ticket ในหัวข้อ 'นโยบายความเป็นส่วนตัว'",
                                        },
                                    ].map((item, idx) => (
                                        <div key={idx} className="c-faq-item">
                                            <p className="c-faq-q">{item.q}</p>
                                            <p className="c-faq-a">{item.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Privacy Policy Section */}
                        <div ref={policyRef} className="c-card md:col-span-2">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                                <h2 className="c-card-title mb-0 flex items-center gap-2.5">
                                    <ShieldCheck size={22} className="text-emerald-300" />
                                    <span>นโยบายความเป็นส่วนตัว (Privacy Policy)</span>
                                </h2>
                                <Link
                                    to="/policy"
                                    className="text-xs font-bold text-amber-200 hover:text-amber-100 underline self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                                >
                                    อ่านฉบับเต็ม
                                </Link>
                            </div>
                            <div className="c-prose text-sm">
                                <p className="mb-5 text-slate-200">
                                    PreExam Thailand ให้ความสำคัญกับความลับและข้อมูลส่วนบุคคลของคุณ เพื่อความโปร่งใส เราจึงกำหนดนโยบายดังนี้:
                                </p>
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
                    <div className="space-y-6 sm:space-y-8">
                        {/* Header Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                            <div className="c-stat-card">
                                <div>
                                    <p className="c-stat-label">Ticket ทั้งหมด</p>
                                    <p className="c-stat-value">{(tickets || []).length}</p>
                                </div>
                                <div className="c-contact-icon c-icon-blue">
                                    <FileText size={22} />
                                </div>
                            </div>
                            <div className="c-stat-card">
                                <div>
                                    <p className="c-stat-label">กำลังดำเนินการ</p>
                                    <p className="c-stat-value c-stat-value-orange">{activeCount}</p>
                                </div>
                                <div className="c-contact-icon c-icon-yellow">
                                    <Clock size={22} />
                                </div>
                            </div>
                            <div className="c-stat-card">
                                <div>
                                    <p className="c-stat-label">เสร็จสิ้นแล้ว</p>
                                    <p className="c-stat-value c-stat-value-green">{doneCount}</p>
                                </div>
                                <div className="c-contact-icon c-icon-green">
                                    <CheckCircle size={22} />
                                </div>
                            </div>
                        </div>

                        {/* Ticket List */}
                        <div className="c-card p-0 overflow-hidden">
                            <div className="p-4 sm:p-6 border-b border-white/12 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                                <div className="c-filter-group self-start">
                                    <button
                                        type="button"
                                        onClick={() => setFilter('all')}
                                        className={`c-filter-btn ${filter === 'all' ? 'active' : ''}`}
                                    >
                                        ทั้งหมด
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFilter('active')}
                                        className={`c-filter-btn ${filter === 'active' ? 'active' : ''}`}
                                    >
                                        กำลังดำเนินการ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFilter('done')}
                                        className={`c-filter-btn ${filter === 'done' ? 'active' : ''}`}
                                    >
                                        เสร็จสิ้น
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={openTicketModal}
                                    className="c-btn-new-ticket"
                                >
                                    <Plus size={18} />
                                    <span>สร้าง Ticket ใหม่</span>
                                </button>
                            </div>

                            <div>
                                {isLoading ? (
                                    <div className="p-6 space-y-3 animate-pulse">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-20 rounded-2xl bg-white/8" />
                                        ))}
                                    </div>
                                ) : filteredTickets.length === 0 ? (
                                    <div className="py-16 px-6 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-amber-400/15 border border-amber-300/30 text-amber-300 flex items-center justify-center mx-auto mb-4">
                                            <AlertCircle size={32} />
                                        </div>
                                        <p className="text-xl font-extrabold text-white mb-2">ไม่พบรายการแจ้งปัญหา</p>
                                        <p className="text-sm text-slate-300 mb-6">
                                            หากพบปัญหาการใช้งาน สามารถกดสร้าง Ticket เพื่อติดต่อทีมงานได้ทันที
                                        </p>
                                        <button
                                            type="button"
                                            onClick={openTicketModal}
                                            className="c-btn-new-ticket mx-auto"
                                        >
                                            <Plus size={18} />
                                            <span>เปิด Ticket แรกของคุณ</span>
                                        </button>
                                    </div>
                                ) : (
                                    filteredTickets.map((ticket) => {
                                        const categoryMeta = TICKET_CATEGORY_MAP[ticket.category];
                                        const CategoryIcon = categoryMeta?.Icon || FileText;
                                        return (
                                            <motion.div
                                                key={ticket.id}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => navigate(`/support/tickets/${ticket.id}`)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        navigate(`/support/tickets/${ticket.id}`);
                                                    }
                                                }}
                                                className="c-ticket-row group"
                                            >
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className="text-xs font-mono text-amber-300 font-bold bg-amber-400/10 border border-amber-400/25 px-2 py-0.5 rounded-md">
                                                            #TK-{ticket.id}
                                                        </span>
                                                        {getStatusBadge(ticket.status)}
                                                        {ticket.priority === 'high' && (
                                                            <span className="c-badge c-badge-red gap-1">
                                                                <Zap size={11} />
                                                                <span>VIP Fast Track</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="c-ticket-title truncate">
                                                        {ticket.subject}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs sm:text-sm text-slate-300 font-medium">
                                                        {categoryMeta && (
                                                            <span
                                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold ${categoryMeta.tone}`}
                                                            >
                                                                <CategoryIcon size={12} />
                                                                <span>{categoryMeta.label}</span>
                                                            </span>
                                                        )}
                                                        <span className="text-slate-400" aria-hidden="true">•</span>
                                                        <span className="text-slate-300">
                                                            {new Date(ticket.created_at).toLocaleDateString('th-TH', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronRight
                                                    className="text-slate-300 group-hover:text-amber-300 transition-all group-hover:translate-x-1 shrink-0"
                                                    size={22}
                                                />
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Contact Alternatives Footer */}
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-slate-200 font-semibold text-xs sm:text-sm py-3 px-4 rounded-2xl bg-white/6 border border-white/12 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <Phone size={16} className="text-pink-300 shrink-0" />
                                <span>Hot-line: 02-XXX-XXXX</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageCircle size={16} className="text-emerald-300 shrink-0" />
                                <span>@preexam_th</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-sky-300 shrink-0" />
                                <span>เวลาทำการ: จันทร์ - ศุกร์ (09:00 - 18:00)</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactPage;
