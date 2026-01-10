import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertCircle, Clock, CheckCircle, ChevronRight, MessageSquare, User as UserIcon, Smartphone, Monitor, ShieldAlert, LifeBuoy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import supportService from '../../services/supportService';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const statuses = [
    { id: 'open', label: 'To Do (Open)', color: 'border-red-500 bg-red-50 text-red-700' },
    { id: 'in_progress', label: 'Doing (In Progress)', color: 'border-orange-500 bg-orange-50 text-orange-700' },
    { id: 'resolved', label: 'Done (Resolved)', color: 'border-green-500 bg-green-50 text-green-700' },
    { id: 'closed', label: 'Archive (Closed)', color: 'border-gray-500 bg-gray-50 text-gray-700' },
];

const SupportTicketManager = () => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const navigate = useNavigate();
    const socket = useSocket();

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        if (socket) {
            const handleNewTicket = (newTicket) => {
                fetchTickets();
                const isUrgent = newTicket.category === 'payment' || newTicket.user_tier !== 'free';
                if (isUrgent) {
                    toast.error(`!!! ด่วน: มี Ticket ใหม่จาก VIP/Payment !!! (#TK-${newTicket.ticket_id})`, {
                        duration: 8000,
                        position: 'top-center'
                    });
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                    audio.play().catch(e => console.log('Audio play blocked'));
                } else {
                    toast.success(`มี Ticket ใหม่เข้ามา (#TK-${newTicket.ticket_id})`);
                }
            };
            socket.on('new_ticket', handleNewTicket);
            return () => socket.off('new_ticket', handleNewTicket);
        }
    }, [socket]);

    const fetchTickets = async () => {
        try {
            const res = await supportService.getAdminTickets();
            setTickets(res.data);
        } catch (error) {
            console.error(error);
            toast.error('โหลดข้อมูล Ticket ไม่สำเร็จ');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (ticketId, status) => {
        try {
            await supportService.updateStatus(ticketId, status);
            toast.success(`เปลี่ยนสถานะเป็น ${status} แล้ว`);
            fetchTickets();
        } catch (error) {
            console.error(error);
            toast.error('เปลี่ยนสถานะไม่สำเร็จ');
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.id.toString().includes(searchQuery) ||
            t.user?.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const getTicketsByStatus = (status) => {
        return filteredTickets.filter(t => t.status === status);
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:3000${path}`;
    };

    return (
        <div className="space-y-6">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex-1 w-full md:w-auto relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="ค้นหาตามหัวข้อ, ID หรือชื่อผู้ใช้..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Filter className="text-slate-400" size={18} />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-royal-blue-500 outline-none text-slate-700"
                    >
                        <option value="all">ทุกหมวดหมู่</option>
                        <option value="bug">แจ้งบั๊ก (Bug)</option>
                        <option value="content">โจทย์ผิด (Content)</option>
                        <option value="payment">การชำระเงิน (Payment)</option>
                        <option value="suggestion">เสนอแนะ (Suggestion)</option>
                        <option value="privacy">ความเป็นส่วนตัว (Privacy)</option>
                        <option value="report">ร้องเรียน (Report)</option>
                    </select>
                    <button onClick={fetchTickets} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                        <Clock size={18} className="text-slate-600" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
                {statuses.map((status) => (
                    <div key={status.id} className="flex flex-col bg-slate-100/50 rounded-2xl border border-slate-200 p-4">
                        <div className={`flex items-center justify-between mb-4 pb-2 border-b ${status.color.split(' ')[0]}`}>
                            <h3 className={`font-bold uppercase text-xs tracking-wider ${status.color.split(' ').pop()}`}>{status.label}</h3>
                            <span className="bg-white px-2 py-0.5 rounded-lg text-xs font-bold shadow-sm">
                                {getTicketsByStatus(status.id).length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                            {getTicketsByStatus(status.id).map((ticket) => (
                                <motion.div
                                    key={ticket.id}
                                    layoutId={`ticket-${ticket.id}`}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer group hover:border-royal-blue-300 transition-all"
                                    onClick={() => navigate(`/support/tickets/${ticket.id}`)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-mono text-slate-400">#TK-{ticket.id}</span>
                                        {ticket.priority === 'high' && (
                                            <span className="bg-red-50 text-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded ring-1 ring-red-200">
                                                VIP
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm mb-2 line-clamp-2 group-hover:text-royal-blue-600 transition-colors">
                                        {ticket.subject}
                                    </h4>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                                            {ticket.user?.avatar ? <img src={getImageUrl(ticket.user.avatar)} className="w-full h-full object-cover" /> : ticket.user?.display_name?.charAt(0)}
                                        </div>
                                        <span className="text-[11px] text-slate-500 truncate">{ticket.user?.display_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                            {ticket.device_info?.os?.toLowerCase().includes('windows') ? <Monitor size={12} /> : <Smartphone size={12} />}
                                            <span className="capitalize">{ticket.category}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 italic">
                                            <Clock size={10} /> {new Date(ticket.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {ticket.status === 'resolved' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUpdateStatus(ticket.id, 'closed');
                                            }}
                                            className="w-full mt-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-lg transition-colors border border-slate-200"
                                        >
                                            ส่งเข้าเก็บเข้ากรุ (Archive)
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SupportTicketManager;
