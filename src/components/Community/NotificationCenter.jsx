import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, BellRing } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const socket = useSocket();
    const containerRef = useRef(null);

    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await axios.get('/api/community/notifications', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(res.data || []);
            setUnreadCount((res.data || []).filter((n) => !n.is_read).length);
        } catch (error) {
            // Silently ignore for guests
        }
    };

    const markAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            await axios.put(
                '/api/community/notifications/mark-read',
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUnreadCount(0);
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setShowDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('new_notification', (notif) => {
            setNotifications((prev) => [notif, ...prev]);
            setUnreadCount((prev) => prev + 1);

            toast(notif.message, {
                icon: <Bell className="w-4 h-4 text-indigo-500" />,
                duration: 4000,
                position: 'top-right',
            });
        });
        return () => socket.off('new_notification');
    }, [socket]);

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => {
                    const nextOpen = !showDropdown;
                    setShowDropdown(nextOpen);
                    if (nextOpen && unreadCount > 0) markAsRead();
                }}
                aria-label="การแจ้งเตือน"
                aria-expanded={showDropdown}
                className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
                <Bell
                    size={20}
                    className={
                        unreadCount > 0
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-600 dark:text-slate-300'
                    }
                />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-rose-600 rounded-full border-2 border-white dark:border-slate-900">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-[min(320px,calc(100vw-24px))] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-white/15 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900 dark:text-white">
                            <BellRing size={16} className="text-indigo-600 dark:text-indigo-400" />
                            <span>การแจ้งเตือน</span>
                        </div>
                        {notifications.length > 0 && (
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                {notifications.length} รายการ
                            </span>
                        )}
                    </div>
                    <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-white/10">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center">
                                <Bell size={22} className="mx-auto text-slate-400 mb-2" />
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    ยังไม่มีการแจ้งเตือน
                                </p>
                            </div>
                        ) : (
                            notifications.map((notif, idx) => (
                                <div
                                    key={notif.id || idx}
                                    className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer ${
                                        !notif.is_read ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''
                                    }`}
                                >
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug">
                                        {notif.message}
                                    </p>
                                    {notif.created_at && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {new Date(notif.created_at).toLocaleDateString('th-TH', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
