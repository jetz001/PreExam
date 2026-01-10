import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const PrivateChatModal = ({ isOpen, onClose, friend }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const { user } = useAuth();
    const socket = useSocket();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && friend) {
            fetchMessages();
        }
    }, [isOpen, friend]);

    useEffect(() => {
        if (!socket) return;

        const handleReceive = (msg) => {
            // Check if msg belongs to this conversation
            if ((msg.sender_id === friend.id && msg.receiver_id === user.id) ||
                (msg.sender_id === user.id && msg.receiver_id === friend.id)) {
                setMessages(prev => [...prev, msg]);
            }
        };

        socket.on('receive_private_message', handleReceive);

        return () => {
            socket.off('receive_private_message', handleReceive);
        };
    }, [socket, friend, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/messages/${friend.id}`);
            setMessages(res.data.data || []);
        } catch (error) {
            console.error("Failed to load messages", error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        try {
            // Optimistic update handled by socket return, but we can rely on socket
            // Wait, socket emits to sender too. So just API call.
            await api.post('/messages/send', {
                friendId: friend.id,
                message: input
            });
            setInput('');
        } catch (error) {
            console.error("Send failed", error);
        }
    };

    if (!isOpen || !friend) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col h-[500px]">
                {/* Header */}
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img
                                src={friend.avatar ? `http://localhost:3000${friend.avatar}` : `https://ui-avatars.com/api/?name=${friend.display_name}`}
                                alt={friend.display_name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100">{friend.display_name}</h3>
                            {friend.is_online_visible && friend.last_active_at && (new Date() - new Date(friend.last_active_at) < 5 * 60 * 1000) ? (
                                <span className="text-xs text-green-500 font-medium flex items-center gap-1">● Online</span>
                            ) : (
                                <span className="text-xs text-gray-500">Offline</span>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Safety Tip */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 text-xs text-yellow-800 dark:text-yellow-200 text-center border-b border-yellow-100 dark:border-yellow-800/30 flex items-center justify-center gap-2">
                    <span role="img" aria-label="warning">⚠️</span>
                    ระวังมิจฉาชีพ! อย่าโอนเงินหรือให้ข้อมูลส่วนตัว
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100 dark:bg-slate-900/50">
                    {messages.map((msg, idx) => {
                        const isMe = msg.sender_id === user.id;
                        return (
                            <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 rounded-bl-none shadow'}`}>
                                    <p className="text-sm">{msg.message}</p>
                                    <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'} text-right`}>
                                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-700 rounded-b-2xl">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border rounded-full bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" disabled={!input.trim()} className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:opacity-50 transition shadow-lg">
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PrivateChatModal;
