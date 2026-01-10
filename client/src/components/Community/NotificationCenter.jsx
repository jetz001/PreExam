import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const socket = useSocket();

    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await axios.get('http://localhost:3000/api/community/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.is_read).length);
        } catch (error) {
            // console.error(error); // Silently fail if auth error to avoid console noise for guests
        }
    };

    const markAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:3000/api/community/notifications/mark-read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('new_notification', (notif) => {
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show Toast
            toast(notif.message, {
                icon: '🔔',
                duration: 4000,
                position: 'top-right'
            });
        });
        return () => socket.off('new_notification');
    }, [socket]);

    return (
        <div className="relative">
            <button
                onClick={() => { setShowDropdown(!showDropdown); if (!showDropdown) markAsRead(); }}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
                <Bell size={20} className={unreadCount > 0 ? "text-indigo-600" : "text-gray-500"} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 font-semibold text-gray-700">Notifications</div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 text-sm">No notifications</div>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 bg-white border-b border-gray-50 transition-colors last:border-0 cursor-pointer">
                                    <p className="text-sm text-gray-800">{notif.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleDateString()}</p>
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
