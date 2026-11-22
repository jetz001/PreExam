import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Send,
    ArrowLeft,
    MessageSquare,
    CheckCircle,
    Clock,
    AlertCircle,
    Globe,
    ShieldAlert,
    Sparkles,
    Paperclip,
    Cpu,
    Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import supportService from '../../services/supportService';
import { getImageUrl } from '../../utils/imageUtils';
import { toast } from 'react-hot-toast';

const TicketDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isInternal, setIsInternal] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        fetchTicketDetails();
    }, [id]);

    useEffect(() => {
        if (socket && id) {
            socket.emit('join_ticket', id);

            const handleNewMessage = (msg) => {
                if (msg.is_internal_note && user?.role !== 'admin') return;
                setMessages((prev) => [...prev, msg]);
                scrollToBottom();
            };

            const handleStatusUpdate = ({ status }) => {
                setTicket((prev) => ({ ...prev, status }));
            };

            socket.on('new_message', handleNewMessage);
            socket.on('status_updated', handleStatusUpdate);

            return () => {
                socket.emit('leave_ticket', id);
                socket.off('new_message', handleNewMessage);
                socket.off('status_updated', handleStatusUpdate);
            };
        }
    }, [socket, id, user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchTicketDetails = async () => {
        try {
            const res = await supportService.getTicketDetails(id);
            setTicket(res.data);
            setMessages(res.data.messages || []);
        } catch (error) {
            console.error(error);
            toast.error('ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const result = await supportService.sendMessage(id, {
                message: newMessage,
                is_internal_note: user?.role === 'admin' ? isInternal : false,
            });
            setNewMessage('');
            if (result && result.data) {
                setMessages((prev) => [...prev, result.data]);
            } else {
                fetchTicketDetails();
            }
        } catch (error) {
            console.error(error);
            toast.error('ไม่สามารถส่งข้อความได้');
        }
    };

    const handleUpdateStatus = async (status) => {
        try {
            await supportService.updateStatus(id, status);
            toast.success(`เปลี่ยนสถานะเป็น ${status} แล้ว`);
        } catch (error) {
            console.error(error);
            toast.error('เปลี่ยนสถานะไม่สำเร็จ');
        }
    };

    if (isLoading) {
        return (
            <div
                className="-mt-20 pt-28 min-h-screen bg-[radial-gradient(circle_at_top,#4c1d95_0%,#240b52_48%,#0f0724_100%)] text-white px-4 pb-12"
                style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
            >
                <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
                    <div className="h-16 rounded-2xl bg-white/10 border border-white/15" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 h-[65vh] rounded-3xl bg-white/10 border border-white/15" />
                        <div className="h-64 rounded-3xl bg-white/10 border border-white/15" />
                    </div>
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div
                className="-mt-20 pt-28 min-h-screen bg-[radial-gradient(circle_at_top,#4c1d95_0%,#240b52_48%,#0f0724_100%)] text-white flex items-center justify-center px-4 pb-12"
                style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
            >
                <div className="max-w-md w-full rounded-3xl bg-white/10 backdrop-blur-xl border border-white/18 p-8 text-center shadow-2xl">
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-400/35 text-rose-300 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white mb-2">ไม่พบ Ticket นี้</h1>
                    <p className="text-sm text-slate-300 mb-6">รายการแจ้งปัญหาอาจถูกลบหรือคุณไม่มีสิทธิ์เข้าถึง</p>
                    <button
                        type="button"
                        onClick={() => navigate('/contact')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <ArrowLeft size={16} />
                        <span>กลับศูนย์ช่วยเหลือ</span>
                    </button>
                </div>
            </div>
        );
    }

    const isAdmin = user?.role === 'admin';

    return (
        <div
            className="-mt-20 pt-24 min-h-screen bg-[radial-gradient(circle_at_top,#4c1d95_0%,#240b52_46%,#0f0724_100%)] text-white pb-12 overflow-x-hidden relative"
            style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
        >
            {/* Ambient Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-[120px]" />
                <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-pink-500/15 blur-[120px]" />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
                {/* Sub-Header Bar */}
                <div className="bg-white/10 backdrop-blur-2xl border border-white/18 rounded-2xl sm:rounded-3xl p-4 sm:px-6 shadow-[0_16px_40px_-12px_rgba(8,3,28,0.5)]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            aria-label="ย้อนกลับ"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/18 border border-white/15 text-slate-100 hover:text-white text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0"
                        >
                            <ArrowLeft size={18} />
                            <span>กลับ</span>
                        </button>

                        <div className="flex-1 min-w-0 text-left sm:text-center px-1">
                            <div className="inline-flex items-center gap-2 max-w-full">
                                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded-md shrink-0">
                                    #TK-{ticket.id}
                                </span>
                                <h1 className="font-extrabold text-white text-base sm:text-lg truncate">
                                    {ticket.subject}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {isAdmin ? (
                                <select
                                    aria-label="อัปเดตสถานะ Ticket"
                                    value={ticket.status}
                                    onChange={(e) => handleUpdateStatus(e.target.value)}
                                    className="bg-slate-900/80 border border-white/25 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    <option value="open">TO DO (OPEN)</option>
                                    <option value="in_progress">DOING (IN PROGRESS)</option>
                                    <option value="resolved">DONE (RESOLVED)</option>
                                    <option value="closed">ARCHIVE (CLOSED)</option>
                                </select>
                            ) : (
                                ticket.status !== 'closed' &&
                                ticket.status !== 'resolved' && (
                                    <button
                                        type="button"
                                        onClick={() => handleUpdateStatus('resolved')}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs sm:text-sm font-bold rounded-xl transition-colors border border-emerald-400/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    >
                                        <CheckCircle size={16} />
                                        <span>Mark Resolved</span>
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Info Sidebar (Smart Context) */}
                    <div className="lg:order-2 space-y-5">
                        {/* Ticket Status Card */}
                        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-xl border border-white/18">
                            <h2 className="text-xs font-extrabold text-amber-200 uppercase mb-4 tracking-wider flex items-center gap-2">
                                <Sparkles size={14} className="text-amber-300" />
                                <span>ข้อมูลพื้นฐาน</span>
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-300 mb-1.5">สถานะปัจจุบัน</p>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/8 border border-white/12">
                                        {ticket.status === 'open' && <AlertCircle className="text-rose-400" size={17} />}
                                        {ticket.status === 'in_progress' && <Clock className="text-amber-400" size={17} />}
                                        {ticket.status === 'resolved' && <CheckCircle className="text-emerald-400" size={17} />}
                                        {ticket.status === 'closed' && <CheckCircle className="text-slate-300" size={17} />}
                                        <span className="font-extrabold text-white text-sm uppercase tracking-wide">
                                            {ticket.status}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-300 mb-1">หมวดหมู่</p>
                                    <p className="font-bold text-white text-sm capitalize">{ticket.category}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-300 mb-1.5">ระดับสมาชิก</p>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold uppercase border ${
                                            ticket.user_tier === 'premium'
                                                ? 'bg-amber-400/20 text-amber-200 border-amber-300/40'
                                                : 'bg-white/10 text-slate-200 border-white/15'
                                        }`}
                                    >
                                        {ticket.user_tier || 'standard'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Smart Context Card */}
                        {ticket.context_data && Object.keys(ticket.context_data).length > 0 && (
                            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-xl border border-white/18">
                                <h2 className="text-xs font-extrabold text-sky-200 uppercase mb-4 tracking-wider flex items-center gap-2">
                                    <Layers size={14} className="text-sky-300" />
                                    <span>บริบทอัจฉริยะ</span>
                                </h2>
                                <div className="space-y-3">
                                    {Object.entries(ticket.context_data).map(([key, val]) => (
                                        <div key={key} className="flex flex-wrap justify-between items-center gap-2 text-xs sm:text-sm">
                                            <span className="text-slate-300 capitalize">{key.replace('_', ' ')}:</span>
                                            <span className="font-mono bg-slate-950/50 border border-white/12 px-2.5 py-1 rounded-lg text-slate-100 break-all max-w-full">
                                                {String(val)}
                                            </span>
                                        </div>
                                    ))}
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            className="w-full mt-2 text-xs bg-indigo-500/25 hover:bg-indigo-500/40 border border-indigo-400/35 text-indigo-100 font-bold py-2.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                        >
                                            Open Linked Page
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Device Info (Admin Only) */}
                        {isAdmin && ticket.device_info && (
                            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-xl border border-rose-400/25">
                                <h2 className="text-xs font-extrabold text-rose-300 uppercase mb-4 tracking-wider flex items-center gap-2">
                                    <Cpu size={15} />
                                    <span>ข้อมูลเครื่อง (Admin Info)</span>
                                </h2>
                                <div className="space-y-2 text-xs text-slate-200">
                                    <p>
                                        <span className="font-bold text-white">OS/Device:</span> {ticket.device_info.os}
                                    </p>
                                    <p>
                                        <span className="font-bold text-white">Screen:</span> {ticket.device_info.screen_size}
                                    </p>
                                    <div className="mt-2 p-2.5 bg-slate-950/55 border border-white/12 rounded-xl overflow-hidden">
                                        <p className="font-mono break-all text-slate-300 leading-relaxed">
                                            {ticket.device_info.browser}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Section */}
                    <div className="lg:col-span-2 lg:order-1 flex flex-col h-[68vh] sm:h-[74vh] bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/18">
                        <div className="px-5 py-3.5 border-b border-white/12 bg-slate-950/30 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white">
                                <MessageSquare size={16} />
                            </div>
                            <span className="font-bold text-sm text-white">ห้องสนทนาช่วยเหลือ</span>
                        </div>

                        {/* Chat Feed */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4">
                            {/* Initial Description */}
                            <div className="flex justify-start mb-4">
                                <div className="max-w-[92%] sm:max-w-[85%] bg-indigo-500/20 p-4 sm:p-5 rounded-2xl rounded-tl-none border border-indigo-400/35 shadow-md">
                                    <div className="flex items-center gap-2.5 mb-2.5">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden border border-white/25 shrink-0">
                                            {ticket.user?.avatar ? (
                                                <img
                                                    src={getImageUrl(ticket.user.avatar)}
                                                    alt={ticket.user?.display_name || 'User'}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                ticket.user?.display_name?.charAt(0) || 'U'
                                            )}
                                        </div>
                                        <span className="font-bold text-amber-200 text-sm">
                                            {ticket.user?.display_name || 'ผู้ใช้งาน'} (เริ่มต้น)
                                        </span>
                                    </div>
                                    <p className="text-slate-100 whitespace-pre-wrap break-words text-sm leading-relaxed">
                                        {ticket.description}
                                    </p>
                                    {ticket.attachment_url && (
                                        <div className="mt-3 pt-3 border-t border-white/12">
                                            <p className="text-xs text-slate-300 mb-1.5 inline-flex items-center gap-1">
                                                <Paperclip size={12} /> ไฟล์แนบ:
                                            </p>
                                            <a
                                                href={getImageUrl(ticket.attachment_url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl overflow-hidden w-fit"
                                            >
                                                <img
                                                    src={getImageUrl(ticket.attachment_url)}
                                                    alt="Attachment"
                                                    className="max-w-[200px] rounded-xl border border-white/20"
                                                />
                                            </a>
                                        </div>
                                    )}
                                    <p className="text-[11px] text-indigo-200/80 mt-2 text-right">
                                        {new Date(ticket.created_at).toLocaleString('th-TH')}
                                    </p>
                                </div>
                            </div>

                            {messages.map((msg, idx) => {
                                const isMe = msg.sender_id === user?.id;
                                const isSystem = msg.role === 'system';
                                const isInternalNote = msg.is_internal_note;

                                if (isSystem) {
                                    return (
                                        <div key={idx} className="flex justify-center my-3">
                                            <div className="bg-white/10 px-4 py-1.5 rounded-full text-xs text-slate-200 text-center border border-white/15">
                                                {msg.message}
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[88%] sm:max-w-[82%] p-4 rounded-2xl border shadow-sm ${
                                                isMe
                                                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 border-indigo-400/40 text-white rounded-tr-none'
                                                    : isInternalNote
                                                        ? 'bg-amber-500/20 border-amber-400/40 text-amber-100 rounded-tl-none'
                                                        : 'bg-white/12 border-white/15 text-slate-100 rounded-tl-none'
                                            }`}
                                        >
                                            {!isMe && (
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold overflow-hidden shrink-0">
                                                        {msg.sender?.avatar ? (
                                                            <img
                                                                src={getImageUrl(msg.sender.avatar)}
                                                                alt={msg.sender?.display_name || 'Sender'}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            msg.sender?.display_name?.charAt(0) || 'A'
                                                        )}
                                                    </div>
                                                    <span
                                                        className={`text-[11px] font-bold uppercase ${
                                                            isInternalNote ? 'text-amber-300' : 'text-slate-300'
                                                        }`}
                                                    >
                                                        {msg.sender?.display_name || 'Support'} {isInternalNote && '(INTERNAL NOTE)'}
                                                    </span>
                                                </div>
                                            )}
                                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                                {msg.message}
                                            </p>
                                            <p className={`text-[10px] mt-1.5 ${isMe ? 'text-indigo-100/80' : 'text-slate-300/80'}`}>
                                                {new Date(msg.created_at).toLocaleString('th-TH')}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-white/12 bg-slate-950/40">
                            {ticket.status === 'closed' ? (
                                <div className="text-center py-2 text-slate-300 text-sm">
                                    บันทึกการสนทนาถูกปิดเนื่องจากเสร็จสิ้นการดำเนินการแล้ว
                                </div>
                            ) : (
                                <form onSubmit={handleSendMessage} className="space-y-3">
                                    {isAdmin && (
                                        <div className="flex items-center gap-2 px-1">
                                            <input
                                                type="checkbox"
                                                id="internal"
                                                checked={isInternal}
                                                onChange={(e) => setIsInternal(e.target.checked)}
                                                className="w-4 h-4 accent-amber-400 rounded focus-visible:ring-2 focus-visible:ring-indigo-500"
                                            />
                                            <label
                                                htmlFor="internal"
                                                className="text-xs font-bold text-amber-300 flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <ShieldAlert size={13} />
                                                <span>internal note (แอดมินเห็นเท่านั้น)</span>
                                            </label>
                                        </div>
                                    )}
                                    <div className="flex items-end gap-2.5">
                                        <textarea
                                            aria-label="พิมพ์ข้อความตอบกลับ"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="พิมพ์ข้อความของคุณ..."
                                            rows={1}
                                            className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-slate-300/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus:border-indigo-400 resize-none min-h-[44px] max-h-32"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage(e);
                                                }
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            aria-label="ส่งข้อความ"
                                            className="h-11 w-11 shrink-0 bg-gradient-to-br from-indigo-500 to-violet-600 hover:brightness-110 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;
