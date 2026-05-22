import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, MessageSquare, CheckCircle, Clock, AlertCircle, Phone, Globe, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import supportService from '../../services/supportService';
import { motion, AnimatePresence } from 'framer-motion';
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

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${path.startsWith('/') ? '' : '/'}${path}`;
    };

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
                // If it's an internal note and user is not admin, ignore
                if (msg.is_internal_note && user.role !== 'admin') return;

                setMessages(prev => [...prev, msg]);
                scrollToBottom();
            };

            const handleStatusUpdate = ({ status }) => {
                setTicket(prev => ({ ...prev, status }));
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
            await supportService.sendMessage(id, {
                message: newMessage,
                is_internal_note: user.role === 'admin' ? isInternal : false
            });
            setNewMessage('');
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

    if (isLoading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">กำลังโหลด...</div>;
    if (!ticket) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 text-gray-400">ไม่พบ Ticket นี้</div>;

    const isAdmin = user.role === 'admin';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10">
            {/* Navbar / Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors">
                        <ArrowLeft size={20} />
                        <span className="font-medium">กลับ</span>
                    </button>
                    <div className="flex-1 text-center">
                        <h2 className="font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-sm mx-auto">
                            #TK-{ticket.id}: {ticket.subject}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAdmin ? (
                            <select
                                value={ticket.status}
                                onChange={(e) => handleUpdateStatus(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-royal-blue-500 outline-none"
                            >
                                <option value="open">TO DO (OPEN)</option>
                                <option value="in_progress">DOING (IN PROGRESS)</option>
                                <option value="resolved">DONE (RESOLVED)</option>
                                <option value="closed">ARCHIVE (CLOSED)</option>
                            </select>
                        ) : (
                            ticket.status !== 'closed' && (
                                <button
                                    onClick={() => handleUpdateStatus('resolved')}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 text-sm font-bold rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                                >
                                    <CheckCircle size={16} /> Mark Resolved
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Info Sidebar (Smart Context) */}
                <div className="lg:order-2 space-y-6">
                    {/* Ticket Status Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wider">ข้อมูลพื้นฐาน</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">สถานะปัจจุบัน</p>
                                <div className="flex items-center gap-2">
                                    {ticket.status === 'open' && <AlertCircle className="text-red-500" size={18} />}
                                    {ticket.status === 'in_progress' && <Clock className="text-orange-500" size={18} />}
                                    {ticket.status === 'resolved' && <CheckCircle className="text-green-500" size={18} />}
                                    <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wide">{ticket.status}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">หมวดหมู่</p>
                                <p className="font-medium text-gray-900 dark:text-white">{ticket.category}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">ระดับสมาชิก</p>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ticket.user_tier === 'premium' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {ticket.user_tier}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Smart Context Card */}
                    {ticket.context_data && Object.keys(ticket.context_data).length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wider">บริบทอัจฉริยะ</h3>
                            <div className="space-y-3">
                                {Object.entries(ticket.context_data).map(([key, val]) => (
                                    <div key={key} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                                        <span className="font-mono bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-900 dark:text-white">{val}</span>
                                    </div>
                                ))}
                                {isAdmin && (
                                    <button className="w-full mt-4 text-xs bg-indigo-50 text-indigo-600 font-bold py-2 rounded-lg hover:bg-indigo-100">
                                        Open Linked Page
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Device Info (Admin Only) */}
                    {isAdmin && ticket.device_info && (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-bold text-red-500 uppercase mb-4 tracking-wider flex items-center gap-2">
                                <Globe size={16} /> ข้อมูลเครื่อง (Admin Info)
                            </h3>
                            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                                <p><span className="font-bold">OS/Device:</span> {ticket.device_info.os}</p>
                                <p><span className="font-bold">Screen:</span> {ticket.device_info.screen_size}</p>
                                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded overflow-hidden">
                                    <p className="font-mono break-all">{ticket.device_info.browser}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat Section */}
                <div className="lg:col-span-2 lg:order-1 flex flex-col h-[70vh] sm:h-[80vh] bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    {/* Chat Feed */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                        {/* Initial Description */}
                        <div className="flex justify-start mb-8">
                            <div className="max-w-[85%] bg-indigo-50 dark:bg-indigo-900/40 p-5 rounded-2xl rounded-tl-none ring-1 ring-indigo-100 dark:ring-indigo-800/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                                        {ticket.user?.avatar ? (
                                            <img src={getImageUrl(ticket.user.avatar)} className="w-full h-full object-cover" />
                                        ) : (
                                            ticket.user?.display_name?.charAt(0)
                                        )}
                                    </div>
                                    <span className="font-bold text-indigo-900 dark:text-indigo-200">{ticket.user?.display_name} (เริ่มต้น)</span>
                                </div>
                                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{ticket.description}</p>
                                <p className="text-[10px] text-indigo-400 mt-2 text-right">
                                    {new Date(ticket.created_at).toLocaleString('th-TH')}
                                </p>
                            </div>
                        </div>

                        {messages.map((msg, idx) => {
                            const isMe = msg.sender_id === user.id;
                            const isSystem = msg.role === 'system';
                            const isInternalNote = msg.is_internal_note;

                            if (isSystem) {
                                return (
                                    <div key={idx} className="flex justify-center my-4">
                                        <div className="bg-gray-100 dark:bg-gray-700/50 px-4 py-1.5 rounded-full text-xs text-gray-500 text-center italic border border-gray-200 dark:border-gray-600">
                                            {msg.message}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl ${isMe
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : isInternalNote
                                            ? 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 rounded-tl-none'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none'
                                        }`}>
                                        {!isMe && (
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold overflow-hidden">
                                                    {msg.sender?.avatar ? (
                                                        <img src={getImageUrl(msg.sender.avatar)} className="w-full h-full object-cover" />
                                                    ) : (
                                                        msg.sender?.display_name?.charAt(0)
                                                    )}
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase ${isInternalNote ? 'text-amber-600' : 'text-gray-400'}`}>
                                                    {msg.sender?.display_name} {isInternalNote && '(INTERNAL NOTE)'}
                                                </span>
                                            </div>
                                        )}
                                        <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                                        <p className={`text-[9px] mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                            {new Date(msg.created_at).toLocaleString('th-TH')}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        {ticket.status === 'closed' ? (
                            <div className="text-center py-2 text-gray-400 italic text-sm">
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
                                            className="w-4 h-4 text-indigo-600 rounded"
                                        />
                                        <label htmlFor="internal" className="text-xs font-bold text-amber-600 flex items-center gap-1">
                                            <ShieldAlert size={12} /> internal note (แอดมินเห็นเท่านั้น)
                                        </label>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="พิมพ์ข้อความของคุณ..."
                                        rows={1}
                                        className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[44px] max-h-32"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        className="h-11 w-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ShieldAlert = ({ size }) => <AlertCircle size={size} />;

export default TicketDetail;
