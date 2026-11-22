import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { createRoomRealtimeClient } from '../services/roomRealtimeClient';
import api from '../services/api';

export default function ArcadeChat() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const chatEndRef = useRef(null);
    const clientRef = useRef(null);

    useEffect(() => {
        // Retrieve current user info
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setCurrentUser(JSON.parse(userStr));
            } catch (e) { }
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return; // Only connect when chat is open to save resources

        const token = localStorage.getItem('token');
        const userId = currentUser?.id || 'guest_' + Math.floor(Math.random() * 10000);

        let baseUrl = api.defaults.baseURL || window.location.origin;
        if (baseUrl.startsWith('/')) {
            baseUrl = window.location.origin + baseUrl;
        }

        const client = createRoomRealtimeClient({
            baseUrl,
            path: '/ws',
            token,
            userId
        });
        clientRef.current = client;

        client.on('connect', () => {
            setIsConnected(true);
            // Join global arcade chat room
            client.emit('join_room', { roomId: 'arcade_global', userId });
        });

        client.on('disconnect', () => {
            setIsConnected(false);
        });

        client.on('receive_message', (data) => {
            setMessages(prev => {
                const newMsgs = [...prev, data];
                return newMsgs.slice(-50); // Keep last 50 msgs
            });
            if (!isOpen) {
                setUnread(u => u + 1);
            }
        });

        client.on('user_joined', (data) => {
            // Optional: system message
        });

        return () => {
            client.disconnect();
            clientRef.current = null;
        };
    }, [isOpen, currentUser]);

    useEffect(() => {
        if (isOpen && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
            setUnread(0);
        }
    }, [messages, isOpen]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !clientRef.current?.connected) return;

        const displayName = currentUser?.display_name || currentUser?.username || 'Guest';

        const msgData = {
            roomId: 'arcade_global',
            text: inputValue,
            senderName: displayName,
            senderId: currentUser?.id,
            timestamp: new Date().toISOString()
        };

        clientRef.current.emit('send_message', msgData);
        setInputValue('');
    };

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="เปิดแชทหาเพื่อนเล่นเกม"
                className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 bg-gradient-to-r from-indigo-600/95 to-violet-600/95 backdrop-blur-md border border-white/25 text-white p-3.5 sm:p-4 rounded-full shadow-[0_12px_32px_rgba(15,5,36,0.45)] hover:brightness-110 hover:scale-105 transition-all z-[210] flex items-center justify-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer"
            >
                <MessageCircle className="w-6 h-6 shrink-0" strokeWidth={2.4} />
                {unread > 0 && (
                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                        {unread}
                    </span>
                )}
                <span className="hidden sm:inline-block max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ml-0 group-hover:ml-2 font-bold text-sm">
                    หาเพื่อนเล่นเกม
                </span>
            </button>
        );
    }

    return (
        <div
            className="fixed bottom-4 left-3 right-3 sm:left-6 sm:right-auto sm:bottom-6 sm:w-96 bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.55)] border border-white/20 flex flex-col overflow-hidden z-[210] h-[480px] max-h-[80vh]"
            style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-950/90 to-violet-950/90 text-white px-4 py-3.5 flex items-center justify-between border-b border-white/15">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-5 h-5 text-indigo-300" />
                    </span>
                    <div className="min-w-0">
                        <h3 className="font-black text-base sm:text-lg leading-none truncate">Arcade Chat</h3>
                        <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 font-semibold">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
                            <span>{isConnected ? 'เชื่อมต่อแล้ว' : 'กำลังเชื่อมต่อ...'}</span>
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="ปิดแชท"
                    className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-full w-8 h-8 flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer shrink-0"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950/45 flex flex-col gap-3 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-300 text-sm px-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-3 text-indigo-300">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-white/90">ยังไม่มีข้อความ...</p>
                        <p className="text-xs text-slate-400 mt-1">พิมพ์ทักทายหาเพื่อนเล่นเกมกันเลย!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = currentUser?.id ? msg.senderId === currentUser.id : msg.senderName === (currentUser?.display_name || 'Guest');
                        return (
                            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && <span className="text-xs text-indigo-200 mb-1 ml-1 font-bold">{msg.senderName}</span>}
                                <div
                                    className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] break-words text-sm leading-relaxed ${
                                        isMe
                                            ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-sm shadow-md'
                                            : 'bg-white/12 border border-white/15 text-slate-100 rounded-tl-sm'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                                <span className="text-[11px] text-slate-400 mt-1 px-1">
                                    {new Date(msg.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-slate-950/70 border-t border-white/15 flex items-center gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="พิมพ์ข้อความ..."
                    aria-label="พิมพ์ข้อความแชท"
                    className="min-w-0 flex-1 bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-400"
                    disabled={!isConnected}
                />
                <button
                    type="submit"
                    disabled={!isConnected || !inputValue.trim()}
                    aria-label="ส่งข้อความ"
                    className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
