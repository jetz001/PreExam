import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ChatBox = ({ socket, roomId, userId, displayName, messages: externalMessages = [], onSendMessage }) => {
    const [messages, setMessages] = useState(externalMessages);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        setMessages(externalMessages);
    }, [externalMessages]);

    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);

            // Notification Logic
            if (message.userId !== userId && user?.notify_study_group) {
                // Play Sound
                const audio = new Audio('/sounds/notification.mp3'); // Ensure this file exists or use a CDN/Data URI
                audio.play().catch(e => console.log('Audio play failed', e));

                // Show Toast
                toast(`${message.displayName}: ${message.message.substring(0, 30)}${message.message.length > 30 ? '...' : ''}`, {
                    icon: <MessageCircle className="w-4 h-4 text-indigo-600" />,
                    duration: 4000
                });
            }
        });

        return () => {
            socket.off('receive_message');
        };
    }, [socket, userId, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        if (onSendMessage) {
            onSendMessage(input);
            setInput('');
            return;
        }
        if (socket) {
            socket.emit('send_message', {
                roomId,
                userId,
                message: input,
                displayName
            });
            setInput('');
        }
    };

    return (
        <div
            className="flex flex-col h-full bg-white/95 backdrop-blur-md rounded-b-3xl shadow-sm border border-slate-200/80 overflow-hidden"
            style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
        >
            <div className="px-4 py-3 border-b border-slate-200/80 bg-gradient-to-r from-indigo-50/90 via-white to-violet-50/90 text-slate-800 flex items-center justify-between gap-2">
                <h3 className="font-extrabold text-slate-800 text-base sm:text-lg flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-sm shrink-0">
                        <MessageCircle className="w-4 h-4" strokeWidth={2.5} />
                    </span>
                    <span>Chat Room</span>
                </h3>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                    {messages.length} ข้อความ
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 min-h-[220px] bg-slate-50/70 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center text-slate-500 px-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-400 flex items-center justify-center mb-2.5">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-700">ยังไม่มีข้อความในห้อง</p>
                        <p className="text-xs text-slate-500 mt-0.5">พิมพ์ทักทายเพื่อนร่วมห้องได้เลย</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.userId === userId;
                        return (
                            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 break-words shadow-xs ${
                                        isMe
                                            ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-sm'
                                            : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-sm'
                                    }`}
                                >
                                    <p className={`text-xs mb-0.5 font-extrabold ${isMe ? 'text-indigo-100' : 'text-indigo-700'}`}>
                                        {msg.displayName}
                                    </p>
                                    <p className="text-sm leading-relaxed">{msg.message}</p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 border-t border-slate-200/80 bg-white flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="พิมพ์ข้อความ..."
                    aria-label="พิมพ์ข้อความในห้องแชท"
                    className="min-w-0 flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-400 transition-all"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    aria-label="ส่งข้อความ"
                    className="shrink-0 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};

export default ChatBox;
