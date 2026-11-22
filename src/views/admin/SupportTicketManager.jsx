import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Clock,
    Smartphone,
    Monitor,
    LifeBuoy,
    RefreshCw,
    Archive,
    Inbox
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import supportService from '../../services/supportService';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const statuses = [
    {
        id: 'open',
        label: 'To Do (Open)',
        borderClass: 'border-rose-300',
        titleClass: 'text-rose-700',
        pillClass: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
        id: 'in_progress',
        label: 'Doing (In Progress)',
        borderClass: 'border-amber-300',
        titleClass: 'text-amber-700',
        pillClass: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
        id: 'resolved',
        label: 'Done (Resolved)',
        borderClass: 'border-emerald-300',
        titleClass: 'text-emerald-700',
        pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
        id: 'closed',
        label: 'Archive (Closed)',
        borderClass: 'border-slate-300',
        titleClass: 'text-slate-700',
        pillClass: 'bg-slate-100 text-slate-700 border-slate-200'
    },
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
                    toast.error(`ด่วน: มี Ticket ใหม่จาก VIP/Payment (#TK-${newTicket.ticket_id})`, {
                        duration: 8000,
                        position: 'top-center'
                    });
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                    audio.play().catch(() => console.log('Audio play blocked'));
                } else {
                    toast.success(`มี Ticket ใหม่เข้ามา (#TK-${newTicket.ticket_id})`);
                }
            };
            socket.on('new_ticket', handleNewTicket);
            return () => socket.off('new_ticket', handleNewTicket);
        }
    }, [socket]);

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const res = await supportService.getAdminTickets();
            const mappedTickets = (res.data || []).map(t => ({
                ...t,
                id: t.id || t.ticket_id,
                subject: t.subject || t.title || 'ไม่มีหัวข้อ',
            }));
            setTickets(mappedTickets);
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

    const filteredTickets = (tickets || []).filter(t => {
        const subjectText = (t.subject || t.title || '').toLowerCase();
        const idText = (t.id || t.ticket_id || '').toString();
        const userText = (t.user?.display_name || '').toLowerCase();
        const query = (searchQuery || '').toLowerCase();

        const matchesSearch =
            subjectText.includes(query) ||
            idText.includes(query) ||
            userText.includes(query);
        const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const getTicketsByStatus = (status) => {
        return filteredTickets.filter(t => t.status === status);
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${path.startsWith('/') ? '' : '/'}${path}`;
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Executive Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur-sm p-5 sm:p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20">
                        <LifeBuoy size={24} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                                ศูนย์ช่วยเหลือ (Support Tickets)
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                                {tickets.length} ทั้งหมด
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            ติดตามคำร้องแจ้งปัญหา แบ่งตามสถานะแบบ Kanban Board พร้อมแจ้งเตือนเรียลไทม์
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={fetchTickets}
                    disabled={isLoading}
                    aria-label="รีเฟรชรายการ Ticket"
                    className="inline-flex items-center justify-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 text-sm font-semibold transition-all disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    <span>รีเฟรช</span>
                </button>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-slate-200/80">
                <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} aria-hidden="true" />
                    <input
                        type="text"
                        placeholder="ค้นหาตามหัวข้อ, ID หรือชื่อผู้ใช้..."
                        aria-label="ค้นหา Ticket"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-500"
                    />
                </div>
                <div className="flex items-center gap-2.5">
                    <Filter className="text-slate-500 flex-shrink-0" size={18} aria-hidden="true" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        aria-label="กรองตามหมวดหมู่ Ticket"
                        className="flex-1 md:flex-none bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    >
                        <option value="all">ทุกหมวดหมู่</option>
                        <option value="bug">แจ้งบั๊ก (Bug)</option>
                        <option value="content">โจทย์ผิด (Content)</option>
                        <option value="payment">การชำระเงิน (Payment)</option>
                        <option value="suggestion">เสนอแนะ (Suggestion)</option>
                        <option value="privacy">ความเป็นส่วนตัว (Privacy)</option>
                        <option value="report">ร้องเรียน (Report)</option>
                    </select>
                </div>
            </div>

            {/* Kanban Columns */}
            {isLoading && tickets.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 animate-pulse" role="status" aria-label="กำลังโหลด Ticket">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-96 rounded-2xl bg-slate-200/80" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 lg:h-[calc(100vh-290px)] lg:min-h-[540px]">
                    {statuses.map((status) => {
                        const columnTickets = getTicketsByStatus(status.id);
                        return (
                            <div
                                key={status.id}
                                className="flex flex-col bg-slate-100/80 rounded-2xl border border-slate-200/80 p-4 shadow-sm"
                            >
                                <div className={`flex items-center justify-between mb-4 pb-2.5 border-b ${status.borderClass}`}>
                                    <h3 className={`font-extrabold uppercase text-xs tracking-wider ${status.titleClass}`}>
                                        {status.label}
                                    </h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.pillClass}`}>
                                        {columnTickets.length}
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                                    {columnTickets.map((ticket) => (
                                        <motion.div
                                            key={ticket.id}
                                            layoutId={`ticket-${ticket.id}`}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => navigate(`/support/tickets/${ticket.id}`)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    navigate(`/support/tickets/${ticket.id}`);
                                                }
                                            }}
                                            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 cursor-pointer group hover:border-indigo-300 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-mono font-semibold text-slate-500">#TK-{ticket.id}</span>
                                                {ticket.priority === 'high' && (
                                                    <span className="bg-rose-50 text-rose-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                                                        VIP
                                                    </span>
                                                )}
                                            </div>

                                            <h4 className="font-bold text-slate-900 text-sm mb-2.5 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                                                {ticket.subject}
                                            </h4>

                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0">
                                                    {ticket.user?.avatar ? (
                                                        <img
                                                            src={getImageUrl(ticket.user.avatar)}
                                                            alt={ticket.user?.display_name || 'User'}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        (ticket.user?.display_name || 'U').charAt(0)
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium text-slate-600 truncate">
                                                    {ticket.user?.display_name || 'ผู้ใช้งาน'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                    {ticket.device_info?.os?.toLowerCase().includes('windows') ? (
                                                        <Monitor size={13} aria-hidden="true" />
                                                    ) : (
                                                        <Smartphone size={13} aria-hidden="true" />
                                                    )}
                                                    <span className="capitalize">{ticket.category || 'general'}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Clock size={12} aria-hidden="true" />
                                                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {ticket.status === 'resolved' && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUpdateStatus(ticket.id, 'closed');
                                                    }}
                                                    className="w-full mt-3 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200 inline-flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                >
                                                    <Archive size={13} />
                                                    <span>ส่งเข้าเก็บเข้ากรุ (Archive)</span>
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}

                                    {columnTickets.length === 0 && (
                                        <div className="rounded-xl border border-dashed border-slate-300/80 bg-white/60 py-8 px-3 text-center">
                                            <Inbox size={20} className="mx-auto text-slate-500 mb-1.5" />
                                            <p className="text-xs font-medium text-slate-500">ไม่มี Ticket ในสถานะนี้</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SupportTicketManager;
